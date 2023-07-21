import { Route } from '@angular/router';

export const leaveRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/leave-layout/leave-layout.component').then(
        (mod) => mod.LeaveLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/leave-list/leave-list.component').then(
            (mod) => mod.LeaveListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/create-leave/create-leave.component').then(
            (mod) => mod.CreateLeaveComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/edit-leave/edit-leave.component').then(
            (mod) => mod.EditLeaveComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/leave-details/leave-details.component').then(
            (mod) => mod.LeaveDetailsComponent
          ),
      },
    ],
  },
];
