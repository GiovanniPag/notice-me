import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { AttachmentComponent } from './list/attachment.component';
import { AttachmentDetailComponent } from './detail/attachment-detail.component';
import { AttachmentUpdateComponent } from './update/attachment-update.component';
import { AttachmentDeleteDialogComponent } from './delete/attachment-delete-dialog.component';
import { AttachmentRoutingModule } from './route/attachment-routing.module';
import { jhiCarouselComponent } from './carousel/carousel.component';

@NgModule({
  imports: [SharedModule, AttachmentRoutingModule],
  exports: [jhiCarouselComponent],
  declarations: [
    AttachmentComponent,
    AttachmentDetailComponent,
    AttachmentUpdateComponent,
    AttachmentDeleteDialogComponent,
    jhiCarouselComponent,
  ],
  entryComponents: [AttachmentDeleteDialogComponent],
})
export class AttachmentModule {}
