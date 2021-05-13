import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'tag',
        loadChildren: () => import('./tag/tag.module').then(m => m.NoticeMeTagModule),
      },
      {
        path: 'note',
        loadChildren: () => import('./note/note.module').then(m => m.NoticeMeNoteModule),
      },
      {
        path: 'attachment',
        loadChildren: () => import('./attachment/attachment.module').then(m => m.NoticeMeAttachmentModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class NoticeMeEntityModule {}
