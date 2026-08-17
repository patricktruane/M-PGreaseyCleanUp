#!/usr/bin/env bash
# Rebuild the Next.js site and (re)start the production server on port 3000.
#
# Build runs in the foreground so errors surface; the server is launched in a
# new session (setsid) so it keeps running after this script — and your shell —
# exits. We free port 3000 first (across user boundaries, retrying on races)
# before starting, so this is safe to re-run no matter who started the current
# server. `bun run start` runs the Next.js production server (`next start`)
# pinned to 0.0.0.0:3000 — the published preview URL is reverse-proxied to
# 0.0.0.0:3000 inside the sandbox, so the site MUST bind there.
set -euo pipefail
cd "$(dirname "$0")"
# Group-writable so any team member can publish over another member's build.
umask 002
mkdir -p .run
# The workspace starts as sources only (the coming-soon placeholder serves from
# the image's pre-built copy), so the first publish installs deps here. No-op
# once node_modules is current.
bun install
bun run build
# Free port 3000 regardless of which user owns the current listener. lsof runs
# under sudo so it can see (and the kill can signal) a process owned by another
# user; the loop waits for the socket to actually release before we start.
sudo sh -c 'for _ in $(seq 1 25); do pids=$(lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null || true); if [ -z "$pids" ]; then exit 0; fi; kill $pids 2>/dev/null || true; sleep 0.2; done'
setsid nohup bun run start > .run/server.log 2>&1 < /dev/null &
# Wait for the new server to actually answer before reporting success, so a
# startup crash surfaces here instead of silently leaving the old page live.
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.5
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1
