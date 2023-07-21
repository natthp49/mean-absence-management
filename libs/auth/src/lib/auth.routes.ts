import { Route } from '@angular/router';
import { authGuard } from './guards';

export const authRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./components/register/register.component').then(
            (mod) => mod.RegisterComponent
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./components/login/login.component').then(
            (mod) => mod.LoginComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./components/profile/profile.component').then(
            (mod) => mod.ProfileComponent
          ),
      },
    ],
  },
];
