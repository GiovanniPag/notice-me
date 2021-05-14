import { Route } from '@angular/router';

import { RegisterComponent } from './register.component';
import { LoggedInGuard } from 'app/core/auth/user-logged-in-guard';

export const registerRoute: Route = {
  path: 'register',
  component: RegisterComponent,
  data: {
    pageTitle: 'register.title',
  },
  canActivate: [LoggedInGuard],
};
