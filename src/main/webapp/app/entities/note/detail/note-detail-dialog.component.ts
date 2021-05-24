import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

import { INote, Note } from '../note.model';
import { ITag } from 'app/entities/tag/tag.model';
import { IUser } from 'app/entities/user/user.model';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertError } from 'app/shared/alert/alert-error.model';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { TagService } from 'app/entities/tag/service/tag.service';
import { UserService } from 'app/entities/user/user.service';
import { NoteService } from '../service/note.service';
import { FormBuilder, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';

@Component({
  templateUrl: './note-detail-dialog.component.html',
  styleUrls: ['../note.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoteDetailDialogComponent implements OnInit {
  note?: INote;

  isSaving = false;
  usersSharedCollection: IUser[] = [];
  tagsSharedCollection: ITag[] = [];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required, Validators.minLength(1)]],
    content: [null, [Validators.required]],
    date: [null, [Validators.required]],
    alarm: [],
    status: [null, [Validators.required]],
    owner: [null, Validators.required],
    tags: [],
    collaborators: [],
  });

  constructor(
    protected dataUtils: DataUtils,
    protected activatedRoute: ActivatedRoute,
    public activeModal: NgbActiveModal,

    protected eventManager: EventManager,
    protected noteService: NoteService,
    protected userService: UserService,
    protected tagService: TagService,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ note }) => {
      if (note.id === undefined) {
        const today = dayjs().startOf('day');
        note.date = today;
        note.alarm = today;
      }

      this.updateForm(note);

      this.loadRelationshipsOptions();
    });
  }

  save(): void {
    this.isSaving = true;
    const note = this.createFromForm();
    if (note.id !== undefined) {
      this.subscribeToSaveResponse(this.noteService.update(note));
    } else {
      this.subscribeToSaveResponse(this.noteService.create(note));
    }
  }

  getSelectedUser(option: IUser, selectedVals?: IUser[]): IUser {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  getSelectedTag(option: ITag, selectedVals?: ITag[]): ITag {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

  trackTagById(index: number, item: ITag): number {
    return item.id!;
  }

  close(): void {
    this.activeModal.dismiss();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('noticeMeApp.error', { ...err, key: 'error.file.' + err.key })
        ),
    });
  }

  protected onSaveSuccess(): void {
    this.close();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INote>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected updateForm(note: INote): void {
    this.editForm.patchValue({
      id: note.id,
      title: note.title,
      content: note.content,
      date: note.date ? note.date.format(DATE_TIME_FORMAT) : null,
      alarm: note.alarm ? note.alarm.format(DATE_TIME_FORMAT) : null,
      status: note.status,
      owner: note.owner,
      tags: note.tags,
      collaborators: note.collaborators,
    });

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(
      this.usersSharedCollection,
      note.owner,
      ...(note.collaborators ?? [])
    );
    this.tagsSharedCollection = this.tagService.addTagToCollectionIfMissing(this.tagsSharedCollection, ...(note.tags ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) =>
          this.userService.addUserToCollectionIfMissing(
            users,
            this.editForm.get('owner')!.value,
            ...(this.editForm.get('collaborators')!.value ?? [])
          )
        )
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.tagService
      .query()
      .pipe(map((res: HttpResponse<ITag[]>) => res.body ?? []))
      .pipe(map((tags: ITag[]) => this.tagService.addTagToCollectionIfMissing(tags, ...(this.editForm.get('tags')!.value ?? []))))
      .subscribe((tags: ITag[]) => (this.tagsSharedCollection = tags));
  }

  protected createFromForm(): INote {
    return {
      ...new Note(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      content: this.editForm.get(['content'])!.value,
      date: this.editForm.get(['date'])!.value ? dayjs(this.editForm.get(['date'])!.value, DATE_TIME_FORMAT) : undefined,
      alarm: this.editForm.get(['alarm'])!.value ? dayjs(this.editForm.get(['alarm'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      owner: this.editForm.get(['owner'])!.value,
      tags: this.editForm.get(['tags'])!.value,
      collaborators: this.editForm.get(['collaborators'])!.value,
    };
  }
}
