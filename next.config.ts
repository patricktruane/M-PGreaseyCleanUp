import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Build is memory-careful on this host (2 CPUs / ~3.9GB RAM): cap the
  // number of build workers so `next build` never spawns more than needed.
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
