import { useEffect } from 'react';

/**
 * Lightweight SEO document title and meta description updater.
 * Updates DOM title and description tags safely on route transitions.
 */
export function SEO({ title, description }) {
  useEffect(() => {
    const defaultTitle = 'Devendra Bhoi | Software Engineer';
    document.title = title ? `${title} | Devendra Bhoi` : defaultTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}

export default SEO;
