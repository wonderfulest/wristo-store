import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

interface RouteMeta {
  title?: string;
  description?: string;
  requiresAuth?: boolean;
}

export function setupPageTitle(route: RouteLocationNormalized) {
  // Set page title from route meta or use default
  const meta = route.meta as RouteMeta;
  const title = meta.title || 'Wristo Store';
  document.title = title;
  
  // Update meta description if provided
  if (meta.description) {
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', meta.description);
  }
  
  // Add canonical URL
  const canonicalUrl = `${window.location.origin}${route.path}`;
  let linkTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.rel = 'canonical';
    document.head.appendChild(linkTag);
  }
  linkTag.href = canonicalUrl;
}

export function createPageGuard() {
  return (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // Handle page title and meta tags
    setupPageTitle(to);
    
    // Add any additional global route handling here
    next();
  };
}

export default {
  setupPageTitle,
  createPageGuard,
};
