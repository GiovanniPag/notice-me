import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { NoteComponent } from './list/note.component';
import { NoteDetailDialogComponent } from './detail/note-detail-dialog.component';
import { NoteUpdateComponent } from './update/note-update.component';
import { NoteDeleteDialogComponent } from './delete/note-delete-dialog.component';
import { NoteRoutingModule } from './route/note-routing.module';
import { NoteCreateComponent } from './create/note-create.component';
import { TagModule } from '../tag/tag.module';

@NgModule({
  imports: [SharedModule, NoteRoutingModule, TagModule],
  declarations: [NoteComponent, NoteDetailDialogComponent, NoteUpdateComponent, NoteDeleteDialogComponent, NoteCreateComponent],
  entryComponents: [NoteDeleteDialogComponent, NoteDetailDialogComponent],
})
export class NoteModule {}
