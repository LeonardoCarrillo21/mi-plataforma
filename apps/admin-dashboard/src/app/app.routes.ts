import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@mi-plataforma/admin/feature-home').then(m => m.homeRoutes),
    pathMatch: 'full'
  },
  {
    path: 'rrhh',
    loadChildren: () => import('@mi-plataforma/admin/feature-hr').then(m => m.hrRoutes)
  }
];