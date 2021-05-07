import { Route } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';

export const HOME_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: '/note',
    pathMatch: 'full',
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: '',
    redirectTo: '/note',
    pathMatch: 'full',
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'home.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
