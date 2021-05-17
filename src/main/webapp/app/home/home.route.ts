import { Route } from '@angular/router';

export const HOME_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: '/note',
    pathMatch: 'full',
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'home.title',
    },
  },
];
