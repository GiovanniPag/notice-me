import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { INote } from '../note.model';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  templateUrl: './note-detail-dialog.component.html',
  styleUrls: ['../note.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoteDetailDialogComponent {
  note?: INote;

  constructor(protected dataUtils: DataUtils, protected activatedRoute: ActivatedRoute, public activeModal: NgbActiveModal) {}

  close(): void {
    this.activeModal.dismiss();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }
}
