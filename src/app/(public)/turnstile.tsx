"use client";

import Script from "next/script";

/** Renders the Cloudflare Turnstile widget when a site key is configured; nothing otherwise. */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
