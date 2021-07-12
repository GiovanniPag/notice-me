import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { INote } from '../note.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { NoteService } from '../service/note.service';
import { NoteDeleteDialogComponent } from '../delete/note-delete-dialog.component';
import { NoteUpdateDialogComponent } from '../update/note-update-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { GridOptions } from 'muuri';
import Grid from 'muuri';
import { ActivatedRoute } from '@angular/router';
import { ModalCloseReason } from 'app/entities/enumerations/modal-close-reason.model';
import { NoteStatus } from 'app/entities/enumerations/note-status.model';
import { animations } from 'app/config/animations';
import { ITag } from 'app/entities/tag/tag.model';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as dayjs from 'dayjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-note',
  templateUrl: './note.component.html',
  styleUrls: ['../note.scss'],
  animations,
})
export class NoteComponent implements OnInit {
  otherNotes: INote[];
  pinnedNotes: INote[];

  isLoading = false;
  isDragging = false;
  itemsPerPage: number;
  links: { [key: string]: number };
  page: number;
  predicate: string;
  ascending: boolean;

  mousePosition = {
    x: 0,
    y: 0,
  };

  allNoteStatus = NoteStatus;

  public layoutConfig: GridOptions = {
    layoutOnInit: true, // Muuri trigger layout method automatically on init
    layoutOnResize: true, //  trigger layout method on window resize
    dragEnabled: true, // items be draggable
    layoutDuration: 300, // The duration for item's layout animation in milliseconds
    layout: {
      fillGaps: true,
      horizontal: false,
      alignRight: false,
      alignBottom: false,
      rounding: true,
    },
    dragStartPredicate: {
      // determines when the item should start moving when the item is being dragged
      distance: 10, // How many pixels the user must drag before the drag procedure starts
      delay: 0, // ow long (in milliseconds) the user must drag before the dragging starts.
    },
  };

  gridPinned: Grid | undefined;
  gridOther: Grid | undefined;
  status: string | undefined;
  collab: boolean | undefined;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    protected noteService: NoteService,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal,
    protected parseLinks: ParseLinks,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.collab = params['isCollaborator'];
    });
    this.otherNotes = [];
    this.pinnedNotes = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
  }

  onResized(): void {
    this.gridOther?.refreshItems().layout();
    this.gridPinned?.refreshItems().layout();
  }

  onMouseDown(event: MouseEvent): void {
    this.mousePosition.x = event.screenX;
    this.mousePosition.y = event.screenY;
  }

  onClick(event: MouseEvent, note: INote): void {
    if (!this.isDragging && Math.abs(this.mousePosition.x - event.screenX) <= 5 && Math.abs(this.mousePosition.y - event.screenY) <= 5) {
      const modalRef = this.modalService.open(NoteUpdateDialogComponent, {
        scrollable: true,
        windowClass: 'note-detail-dialog',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.note = note;
      modalRef.closed.subscribe(reason => {
        switch (reason) {
          case ModalCloseReason.MODIFIED:
            this.loadOne(note.id!);
            break;
          case ModalCloseReason.DELETED:
          case ModalCloseReason.ARCHIVED:
          case ModalCloseReason.UNDELETED:
          case ModalCloseReason.UNARCHIVED:
          case ModalCloseReason.PERMANENTDELETED:
            this.removeOne(note.id!);
            break;
          case ModalCloseReason.CLOSED:
          default:
            break;
        }
      });
    }
  }

  getFormattedLastUpdateDate(note: INote): string {
    let lastUpdateDate: string;
    let time = dayjs().diff(note.lastUpdateDate!, 's');
    if (time <= 60) {
      lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.secondsAgo');
    } else {
      time = dayjs().diff(note.lastUpdateDate!, 'm');
      if (time <= 60) {
        lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.minutesAgo', { time });
      } else {
        time = dayjs().diff(note.lastUpdateDate!, 'h');
        if (time <= 24) {
          lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.hoursAgo', { time });
        } else {
          time = dayjs().diff(note.lastUpdateDate!, 'd');
          if (time <= 31) {
            lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.daysAgo', { time });
          } else {
            time = dayjs().diff(note.lastUpdateDate!, 'M');
            if (time <= 12) {
              lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.monthsAgo', { time });
            } else {
              time = dayjs().diff(note.lastUpdateDate!, 'y');
              lastUpdateDate = this.translateService.instant('noticeMeApp.note.detail.yearsAgo', { time });
            }
          }
        }
      }
    }
    return lastUpdateDate;
  }

  public modelChangeFn($event: ITag[], note: INote): void {
    note.tags = $event;
    this.savePatch(note);
  }

  savePatch(noteToSave: INote): void {
    this.isSaving = true;
    if (noteToSave.id !== undefined) {
      this.subscribeToSavePatchResponse(this.noteService.partialUpdate(noteToSave));
    }
  }

  onGridCreated(grid: Grid, elem: HTMLDivElement): void {
    if (elem.id === 'gridPinned') {
      this.gridPinned = grid;
      this.gridPinned.on('dragInit', () => {
        this.isDragging = true;
      });
      this.gridPinned.on('dragReleaseEnd', () => {
        this.isDragging = false;
      });
    } else {
      this.gridOther = grid;
      this.gridOther.on('dragInit', () => {
        this.isDragging = true;
      });
      this.gridOther.on('dragReleaseEnd', () => {
        this.isDragging = false;
      });
    }
  }

  loadOne(id: number): void {
    this.isLoading = true;
    this.noteService.find(id).subscribe(
      (note: HttpResponse<INote>) => {
        this.isLoading = false;
        this.updateNote(note.body);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  removeOne(id: number): void {
    this.otherNotes = this.otherNotes.filter(note => note.id !== id);
    this.pinnedNotes = this.pinnedNotes.filter(note => note.id !== id);
  }

  loadAll(): void {
    this.isLoading = true;
    this.noteService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
        hasAlarm: this.route.snapshot.queryParams['hasAlarm'] === 'true',
        status: this.status,
        isCollaborator: this.collab ? true : false,
      })
      .subscribe(
        (res: HttpResponse<INote[]>) => {
          this.isLoading = false;
          this.paginateNotes(res.body, res.headers);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  reset(): void {
    this.page = 0;
    this.otherNotes = [];
    this.pinnedNotes = [];
    this.loadAll();
  }

  loadPage(page: number): void {
    this.page = page;
    this.loadAll();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => {
      this.reset();
    });
  }

  trackId(index: number, item: INote): number {
    return item.id!;
  }

  trackByIndex(index: number, tag: INote): number {
    return tag.id!;
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(note: INote): void {
    const modalRef = this.modalService.open(NoteDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.note = note;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.reset();
      }
    });
  }

  canShowCreate(): boolean {
    return (
      (this.status === undefined ||
        this.status === 'undefined' ||
        this.status === NoteStatus.NORMAL ||
        this.status === NoteStatus.PINNED) &&
      !this.collab
    );
  }

  addNote(note: INote): void {
    if (note.status === NoteStatus.PINNED) {
      this.pinnedNotes.push(note);
    } else {
      this.otherNotes.push(note);
    }
  }

  protected subscribeToSavePatchResponse(result: Observable<HttpResponse<INote>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSavePatchSuccess(),
      () => this.onSavePatchError()
    );
  }

  protected onSavePatchSuccess(): void {
    // Api for inheritance.
  }

  protected onSavePatchError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected paginateNotes(data: INote[] | null, headers: HttpHeaders): void {
    this.links = this.parseLinks.parse(headers.get('link') ?? '');
    if (data) {
      for (const d of data) {
        d.status === NoteStatus.PINNED ? this.pinnedNotes.push(d) : this.otherNotes.push(d);
      }
    }
  }

  protected updateNote(data: INote | null): void {
    if (data) {
      let n = this.pinnedNotes.find(note => note.id === data.id);
      if (n) {
        if (n.status === data.status && data.status === NoteStatus.PINNED) {
          this.pinnedNotes = this.pinnedNotes.map(note => (note.id === data.id ? data : note));
        } else {
          this.pinnedNotes = this.pinnedNotes.filter(note => note.id !== data.id);
          this.otherNotes.push(data);
        }
      } else {
        n = this.otherNotes.find(note => note.id === data.id);
        if (n) {
          if (n.status === data.status && data.status !== NoteStatus.PINNED) {
            this.otherNotes = this.otherNotes.map(note => (note.id === data.id ? data : note));
          } else {
            this.otherNotes = this.otherNotes.filter(note => note.id !== data.id);
            this.pinnedNotes.push(data);
          }
        }
      }
    }
  }
}
