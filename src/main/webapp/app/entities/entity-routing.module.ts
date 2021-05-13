import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'tag',
        data: { pageTitle: 'noticeMeApp.tag.home.title' },
        loadChildren: () => import('./tag/tag.module').then(m => m.TagModule),
      },
      {
        path: 'note',
        data: { pageTitle: 'noticeMeApp.note.home.title' },
        loadChildren: () => import('./note/note.module').then(m => m.NoteModule),
      },
      {
        path: 'attachment',
        data: { pageTitle: 'noticeMeApp.attachment.home.title' },
        loadChildren: () => import('./attachment/attachment.module').then(m => m.AttachmentModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
