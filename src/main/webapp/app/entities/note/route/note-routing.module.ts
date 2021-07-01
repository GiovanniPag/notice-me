import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { NoteComponent } from '../list/note.component';
import { NoteRoutingResolveService } from './note-routing-resolve.service';

const noteRoute: Routes = [
  {
    path: '',
    component: NoteComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: NoteComponent,
    resolve: {
      note: NoteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: NoteComponent,
    resolve: {
      note: NoteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(noteRoute)],
  exports: [RouterModule],
})
export class NoteRoutingModule {}
