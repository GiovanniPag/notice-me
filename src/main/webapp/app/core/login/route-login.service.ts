import { Injectable } from '@angular/core';

import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginRouteService {
  constructor(private router: Router) {}

  open(): void {
    this.router.navigate(['login']);
  }
}
