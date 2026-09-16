/**
 * Safe, Privacy-Respecting Analytics Helper
 *
 * Requirements:
 * - Only initialized if VITE_GA_MEASUREMENT_ID is explicitly provided and non-empty.
 * - Completely inactive in local development unless configured.
 * - Strictly ignores admin routes (/admin, /admin/*).
 * - Never tracks passwords, authentication tokens, or contact form message bodies.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof GA_MEASUREMENT_ID !== 'string' || !GA_MEASUREMENT_ID.trim()) {
    // Analytics is disabled or unconfigured
    return;
  }

  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  try {
    // Load gtag.js asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID.trim())}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID.trim(), {
      anonymize_ip: true,
      send_page_view: false, // We control page view dispatch safely
    });

    isInitialized = true;
  } catch (e) {
    // Gracefully handle any script loading failure
  }
}

export function trackPageView(pathname) {
  // Never track private administration paths
  if (!pathname || pathname.startsWith('/admin')) {
    return;
  }

  if (!isInitialized || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  } catch (e) {
    // Ignore reporting errors
  }
}
