/* ------------------------------------------------------------------ */
/* Inbound SMS webhook — stable public URL for Twilio to POST to.      */
/*                                                                     */
/*   Configure in Twilio console: Messaging → your number → "A message */
/*   comes in" → webhook → POST to:  <published site>/api/sms           */
/*                                                                     */
/* Handles Twilio's form-encoded POST (From, Body, To, MessageSid, …), */
/* answers instantly with TwiML, and captures the sender as a lead in  */
/* the leads store with rule-based hot/warm/cold scoring. Live-but-    */
/* dormant without credentials: no TWILIO_* env vars → still replies   */
/* and captures leads; only REST outbound + signature checks wait.     */
/*                                                                     */
/* This uses the route-level server-handler mechanism (server.handlers) */
/* — this TanStack Start version's plain API-route path: a stable URL, */
/* per-method dispatch, and outside the serverFn CSRF scope.           */
/* ------------------------------------------------------------------ */
import { createFileRoute } from "@tanstack/react-router";
import {
  handleInboundSms,
  isSignatureValid,
  parseSmsRequest,
  webhookInfoResponse,
  webhookResponse,
} from "../../lib/sms-handler";

export const Route = createFileRoute("/api/sms")({
  server: {
    handlers: {
      /** Twilio inbound SMS (POST, form-encoded). */
      POST: async ({ request }: { request: Request }) => {
        try {
          const msg = await parseSmsRequest(request);

          // Enforce Twilio's signature when credentials are configured.
          if (
            msg.from &&
            !isSignatureValid(
              request,
              msg.rawParams,
              request.headers.get("X-Twilio-Signature")
            )
          ) {
            // Never let an unsigned request write a lead once creds exist.
            return new Response("Invalid Twilio signature", { status: 403 });
          }

          const result = await handleInboundSms(msg);
          return webhookResponse(result);
        } catch (err) {
          // Twilio retries on 5xx; a stored lead beats a dropped message.
          console.error("sms webhook error:", err);
          return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } }
          );
        }
      },
      /** Health/eyeball check (browsers GET the URL; Twilio may too). */
      GET: () => webhookInfoResponse(),
      ANY: () => webhookInfoResponse(),
    },
  },
});
