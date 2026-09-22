import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Devendra Bhoi | Machine Learning & Software Portfolio';
const DEFAULT_DESCRIPTION =
  'Personal portfolio of Devendra Bhoi, Computer Engineering graduate from SSBT COET (2026) focused on Machine Learning, AI fundamentals, Python, SQL, and data-driven systems.';

/**
 * Robust, zero-dependency SEO & Metadata management component.
 * Safely manages document title, meta descriptions, canonical URLs,
 * Open Graph, Twitter Cards, robots indexing directives, and JSON-LD structured data.
 */
export function SEO({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  noindex = false,
  projectData = null,
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Resolve Document Title
    let computedTitle = DEFAULT_TITLE;
    if (title) {
      if (title.includes('Devendra Bhoi')) {
        computedTitle = title;
      } else {
        computedTitle = `${title} | Devendra Bhoi`;
      }
    }
    document.title = computedTitle;

    // 2. Resolve Meta Description
    const metaDescContent = description || DEFAULT_DESCRIPTION;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metaDescContent);

    // 3. Resolve Site URL & Canonical URL
    // Configurable frontend environment variable VITE_SITE_URL with local fallback
    const siteBaseUrl = (
      import.meta.env.VITE_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
    ).replace(/\/$/, '');

    const currentPath = canonicalPath !== undefined ? canonicalPath : location.pathname;
    const canonicalUrl = `${siteBaseUrl}${currentPath === '/' ? '' : currentPath}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Robots Directives (Public crawlable, Admin strictly noindex)
    const isAdminRoute = location.pathname.startsWith('/admin') || noindex;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute(
      'content',
      isAdminRoute ? 'noindex, nofollow' : 'index, follow'
    );

    // Helper to safely set or update meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (content) {
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attributeName, attributeValue);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      } else if (el) {
        el.remove();
      }
    };

    // 5. Open Graph Metadata
    setMetaTag('property', 'og:title', computedTitle);
    setMetaTag('property', 'og:description', metaDescContent);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'Devendra Bhoi');

    // Only set og:image when a genuine, non-empty image exists (no fake URLs)
    const hasValidImage = image && typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'));
    setMetaTag('property', 'og:image', hasValidImage ? image : null);

    // 6. Twitter / X Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', computedTitle);
    setMetaTag('name', 'twitter:description', metaDescContent);
    setMetaTag('name', 'twitter:image', hasValidImage ? image : null);

    // 7. Optional Google Search Console Verification (only if configured in env, no fake tokens)
    const gscToken = import.meta.env.VITE_GSC_VERIFICATION;
    if (gscToken && typeof gscToken === 'string' && gscToken.trim()) {
      setMetaTag('name', 'google-site-verification', gscToken.trim());
    }

    // 8. JSON-LD Personal Branding & Structured Data
    let jsonLdScript = document.getElementById('seo-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    // Strictly factual structured data (NO personal email address, NO invented employers/certifications)
    const graph = [
      {
        '@type': 'Person',
        '@id': `${siteBaseUrl}/#person`,
        'name': 'Devendra Bhoi',
        'url': `${siteBaseUrl}/`,
        'sameAs': [
          'https://github.com/Indra-2005',
          'https://www.linkedin.com/in/devendra-bhoi-21a720243',
        ],
      },
    ];

    // On project detail pages, include factual project structured data
    if (projectData && projectData.title) {
      const projectNode = {
        '@type': 'SoftwareSourceCode',
        '@id': `${canonicalUrl}#software`,
        'name': projectData.title,
        'description': projectData.short_description || projectData.description,
        'url': canonicalUrl,
      };

      if (projectData.github_url) {
        projectNode['codeRepository'] = projectData.github_url;
      }
      if (Array.isArray(projectData.technologies) && projectData.technologies.length > 0) {
        projectNode['programmingLanguage'] = projectData.technologies.join(', ');
      }
      graph.push(projectNode);
    }

    jsonLdScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
  }, [
    title,
    description,
    canonicalPath,
    image,
    type,
    noindex,
    projectData,
    location.pathname,
  ]);

  return null;
}

export default SEO;
