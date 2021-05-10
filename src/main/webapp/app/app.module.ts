import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { NoticeMeSharedModule } from 'app/shared/shared.module';
import { NoticeMeCoreModule } from 'app/core/core.module';
import { NoticeMeAppRoutingModule } from './app-routing.module';
import { NoticeMeHomeModule } from './home/home.module';
import { NoticeMeEntityModule } from './entities/entity.module';
import { NoticeMeLoginModule } from './login/login.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { SideBarService } from './layouts/sidebar/sidebar.service';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';

@NgModule({
  imports: [
    BrowserModule,
    NoticeMeSharedModule,
    NoticeMeCoreModule,
    NoticeMeHomeModule,
    NoticeMeLoginModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    NoticeMeEntityModule,
    NoticeMeAppRoutingModule,
  ],
  providers: [SideBarService],
  declarations: [MainComponent, NavbarComponent, SidebarComponent, ErrorComponent, PageRibbonComponent, ActiveMenuDirective],
  bootstrap: [MainComponent],
})
export class NoticeMeAppModule {}
