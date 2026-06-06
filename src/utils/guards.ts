import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { applySeo, getRouteSeo } from '@/seo';

interface RouteMeta {
  title?: string;
  description?: string;
  requiresAuth?: boolean;
}

export function setupPageTitle(route: RouteLocationNormalized) {
  const meta = route.meta as RouteMeta;
  applySeo({
    ...getRouteSeo(route),
    title: meta.title || getRouteSeo(route).title,
    description: meta.description || getRouteSeo(route).description,
  });
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
