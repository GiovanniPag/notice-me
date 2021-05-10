import { Route } from '@angular/router';

import { LoginComponent } from './login.component';
import { LoggedInGuard } from 'app/core/auth/user-logged-in-guard';

export const LOGIN_ROUTE: Route = {
  path: 'login',
  component: LoginComponent,
  data: {
    authorities: [],
    pageTitle: 'login.title',
  },
  canActivate: [LoggedInGuard],
};
