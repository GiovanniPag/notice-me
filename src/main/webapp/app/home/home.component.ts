import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { Router } from '@angular/router';

@Component({
  selector: 'jhi-home',
  template: '...',
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  authSubscription?: Subscription;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => (this.account = account));
    this.accountService.identity().subscribe(() => {
      if (!this.isAuthenticated()) {
        this.navigate('/login');
      } else {
        this.navigate('/note');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
