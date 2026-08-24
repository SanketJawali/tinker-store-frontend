import { createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';

const SITE_URL = 'https://tinkerstore.tech';
const SITE_NAME = 'Tinker Store';

type MetaConfig = {
  title: string;
  description: string;
};

const routeMeta: Record<string, MetaConfig> = {
  '/': {
    title: `${SITE_NAME} - Demo Marketplace`,
    description:
      'Browse sample products in this personal demo ecommerce project built with SolidJS and a Python API.',
  },
  '/about': {
    title: `About - ${SITE_NAME}`,
    description:
      'Learn about Tinker Store, a personal demo project made to practice modern ecommerce frontend and API patterns.',
  },
  '/contact': {
    title: `Contact - ${SITE_NAME}`,
    description:
      'Contact information for the Tinker Store personal demo project and feedback channels.',
  },
  '/cart': {
    title: `Cart - ${SITE_NAME}`,
    description: 'Review cart items in the Tinker Store demo checkout flow.',
  },
  '/checkout': {
    title: `Checkout - ${SITE_NAME}`,
    description: 'Demo checkout page for Tinker Store personal project.',
  },
  '/new-product': {
    title: `List Product - ${SITE_NAME}`,
    description: 'Create a sample listing in this demo marketplace project.',
  },
  '/terms': {
    title: `Terms of Service - ${SITE_NAME}`,
    description: 'Terms of use for the Tinker Store personal demo application.',
  },
  '/privacy': {
    title: `Privacy Policy - ${SITE_NAME}`,
    description: 'Privacy policy for the Tinker Store personal demo application.',
  },
};

const setMetaTag = (name: string, content: string, property = false) => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');
    if (property) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', href);
};

export default function SeoHead() {
  const location = useLocation();

  createEffect(() => {
    const pathname = location.pathname;
    const isProductPage = pathname.startsWith('/product/');

    const meta: MetaConfig = isProductPage
      ? {
          title: `Product Details - ${SITE_NAME}`,
          description: 'View sample product details, pricing, and reviews on Tinker Store.',
        }
      : routeMeta[pathname] || routeMeta['/'];

    const canonical = `${SITE_URL}${pathname}${location.search || ''}`;

    document.title = meta.title;
    setMetaTag('description', meta.description);
    setMetaTag('og:title', meta.title, true);
    setMetaTag('og:description', meta.description, true);
    setMetaTag('og:url', canonical, true);
    setMetaTag('twitter:title', meta.title);
    setMetaTag('twitter:description', meta.description);
    setCanonical(canonical);
  });

  return null;
}
