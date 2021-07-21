import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { AttachmentDeleteDialogComponent } from './delete/attachment-delete-dialog.component';
import { jhiCarouselComponent } from './carousel/carousel.component';

@NgModule({
  imports: [SharedModule],
  exports: [jhiCarouselComponent],
  declarations: [AttachmentDeleteDialogComponent, jhiCarouselComponent],
  entryComponents: [AttachmentDeleteDialogComponent],
})
export class AttachmentModule {}
