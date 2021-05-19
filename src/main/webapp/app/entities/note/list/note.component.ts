import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { INote } from '../note.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { NoteService } from '../service/note.service';
import { NoteDeleteDialogComponent } from '../delete/note-delete-dialog.component';
import { NoteDetailDialogComponent } from '../detail/note-detail-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';
import { ParseLinks } from 'app/core/util/parse-links.service';
import { GridOptions } from 'muuri';
import Grid from 'muuri';

@Component({
  selector: 'jhi-note',
  templateUrl: './note.component.html',
  styleUrls: ['../note.scss'],
})
export class NoteComponent implements OnInit {
  notes: INote[];
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

  grid: Grid | undefined;

  constructor(
    protected noteService: NoteService,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal,
    protected parseLinks: ParseLinks
  ) {
    this.notes = [];
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0,
    };
    this.predicate = 'id';
    this.ascending = true;
  }
  onResized(): void {
    this.grid?.refreshItems().layout();
  }

  onMouseDown(event: MouseEvent): void {
    this.mousePosition.x = event.screenX;
    this.mousePosition.y = event.screenY;
  }

  onClick(event: MouseEvent, note: INote): void {
    if (!this.isDragging && Math.abs(this.mousePosition.x - event.screenX) <= 5 && Math.abs(this.mousePosition.y - event.screenY) <= 5) {
      const modalRef = this.modalService.open(NoteDetailDialogComponent, { windowClass: 'note-detail-dialog' });
      modalRef.componentInstance.note = note;
    }
  }

  onGridCreated(grid: Grid): void {
    this.grid = grid;
    this.grid.on('dragInit', () => {
      this.isDragging = true;
    });
    this.grid.on('dragReleaseEnd', () => {
      this.isDragging = false;
    });
  }

  loadAll(): void {
    this.isLoading = true;

    this.noteService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sort(),
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
    this.notes = [];
    this.loadAll();
  }

  loadPage(page: number): void {
    this.page = page;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: INote): number {
    return item.id!;
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
        this.notes.push(d);
      }
    }
  }
}
