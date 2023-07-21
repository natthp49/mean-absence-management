import { Route } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from '@mean-absence-management/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'leaves',
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('@mean-absence-management/auth').then((mod) => mod.authRoutes),
      },
      {
        path: 'leaves',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./leaves/leave.routes').then((mod) => mod.leaveRoutes),
      },
    ],
  },
];
