import { Component, OnInit, HostBinding } from '@angular/core';

import { VERSION } from 'app/app.constants';
import { LANGUAGES } from 'app/config/language.constants';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { SideBarService } from './sidebar.service';

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  inProduction?: boolean;
  languages = LANGUAGES;
  version: string;

  @HostBinding('class.is-active')
  isActive = false;

  constructor(private accountService: AccountService, private profileService: ProfileService, private sideBarService: SideBarService) {
    this.version = VERSION ? (VERSION.toLowerCase().startsWith('v') ? VERSION : 'v' + VERSION) : '';
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
    });
    this.sideBarService.Sidebarchange.subscribe((isActive: boolean) => {
      this.isActive = isActive;
    });
  }

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  getImageUrl(): string {
    return this.isAuthenticated() ? this.accountService.getImageUrl() : '';
  }
}
