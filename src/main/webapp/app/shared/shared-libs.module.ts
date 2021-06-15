import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { MuuriModule } from 'muuri-angular';
import { EllipsisModule } from 'ngx-ellipsis';
import { AngularResizedEventModule } from 'angular-resize-event';
import { ClickOutsideModule } from 'ng-click-outside';

@NgModule({
  exports: [
    MuuriModule,
    FormsModule,
    CommonModule,
    NgbModule,
    InfiniteScrollModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TranslateModule,
    AngularResizedEventModule,
    EllipsisModule,
    ClickOutsideModule,
  ],
})
export class SharedLibsModule {}
