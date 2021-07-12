import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { NoteComponent } from './list/note.component';
import { NoteUpdateDialogComponent } from './update/note-update-dialog.component';
import { NoteDeleteDialogComponent } from './delete/note-delete-dialog.component';
import { NoteRoutingModule } from './route/note-routing.module';
import { NoteCreateComponent } from './create/note-create.component';
import { TagModule } from '../tag/tag.module';
import { AttachmentModule } from '../attachment/attachment.module';

@NgModule({
  imports: [SharedModule, NoteRoutingModule, TagModule, AttachmentModule],
  declarations: [NoteComponent, NoteUpdateDialogComponent, NoteDeleteDialogComponent, NoteCreateComponent],
  entryComponents: [NoteDeleteDialogComponent, NoteUpdateDialogComponent],
})
export class NoteModule {}
