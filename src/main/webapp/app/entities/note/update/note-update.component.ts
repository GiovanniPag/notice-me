import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { INote, Note } from '../note.model';
import { NoteService } from '../service/note.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';

@Component({
  selector: 'jhi-note-update',
  templateUrl: './note-update.component.html',
})
export class NoteUpdateComponent implements OnInit {
  isSaving = false;

  usersSharedCollection: IUser[] = [];
  tagsSharedCollection: ITag[] = [];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.maxLength(255)]],
    content: [],
    lastUpdateDate: [null, [Validators.required]],
    alarmDate: [],
    status: [null, [Validators.required]],
    owner: [null, Validators.required],
    tags: [],
    collaborators: [],
  });

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected noteService: NoteService,
    protected userService: UserService,
    protected tagService: TagService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ note }) => {
      if (note.id === undefined) {
        const today = dayjs().startOf('day');
        note.lastUpdateDate = today;
        note.alarmDate = today;
      }

      this.updateForm(note);

      this.loadRelationshipsOptions();
    });
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

  previousState(): void {
    window.history.back();
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

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

  trackTagById(index: number, item: ITag): number {
    return item.id!;
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

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INote>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(note: INote): void {
    this.editForm.patchValue({
      id: note.id,
      title: note.title,
      content: note.content,
      lastUpdateDate: note.lastUpdateDate ? note.lastUpdateDate.format(DATE_TIME_FORMAT) : null,
      alarmDate: note.alarmDate ? note.alarmDate.format(DATE_TIME_FORMAT) : null,
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
      lastUpdateDate: this.editForm.get(['lastUpdateDate'])!.value
        ? dayjs(this.editForm.get(['lastUpdateDate'])!.value, DATE_TIME_FORMAT)
        : undefined,
      alarmDate: this.editForm.get(['alarmDate'])!.value ? dayjs(this.editForm.get(['alarmDate'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      owner: this.editForm.get(['owner'])!.value,
      tags: this.editForm.get(['tags'])!.value,
      collaborators: this.editForm.get(['collaborators'])!.value,
    };
  }
}
