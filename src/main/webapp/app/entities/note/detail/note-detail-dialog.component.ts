import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

import { INote, Note } from '../note.model';
import { ITag } from 'app/entities/tag/tag.model';
import { IUser } from 'app/entities/user/user.model';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertError } from 'app/shared/alert/alert-error.model';

import { DATE_TIME_FORMAT, DATE_TIME_INPUT_FORMAT } from 'app/config/input.constants';
import { TagService } from 'app/entities/tag/service/tag.service';
import { UserService } from 'app/entities/user/user.service';
import { NoteService } from '../service/note.service';
import { FormBuilder, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { NoteStatus } from 'app/entities/enumerations/note-status.model';
import { MinDateValidator } from 'app/shared/date/MinDateValidator.directive';

@Component({
  templateUrl: './note-detail-dialog.component.html',
  styleUrls: ['../note.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoteDetailDialogComponent implements OnInit {
  @ViewChild('noteupdateform') form!: ElementRef;
  @ViewChild('popoverAlarm') popoverAlarm!: NgbPopover;
  @ViewChild('popoverAlarm', { static: false }) popover!: ElementRef;

  note?: INote;
  isSaving = false;
  usersSharedCollection: IUser[] = [];
  tagsSharedCollection: ITag[] = [];
  inside = false;

  minDate = dayjs().format(DATE_TIME_INPUT_FORMAT);

  editForm = this.fb.group({
    id: [],
    title: [],
    content: [],
    lastUpdateDate: ['', [Validators.required]],
    alarmDate: ['', [MinDateValidator(this.minDate)]],
    status: ['', [Validators.required]],
    owner: ['', [Validators.required]],
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
    this.updateForm(this.note!);
    this.loadRelationshipsOptions();
  }

  closeAndSaveNote(): void {
    if (this.canClose()) {
      this.save('modified');
    }
  }

  savePatch(): void {
    this.isSaving = true;
    const note = this.createFromForm();
    if (note.id !== undefined) {
      this.subscribeToSavePatchResponse(this.noteService.partialUpdate(note));
    }
  }

  save(reason: string): void {
    this.isSaving = true;
    const note = this.createFromForm();
    if (note.id !== undefined) {
      this.subscribeToSaveResponse(this.noteService.update(note), reason);
    } else {
      this.subscribeToSaveResponse(this.noteService.create(note), reason);
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

  close(reason: string): void {
    this.activeModal.close(reason);
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

  deleteNote(): void {
    this.editForm.patchValue({ status: NoteStatus.DELETED });
    this.save('deleted');
  }

  archiveNote(): void {
    this.editForm.patchValue({ status: NoteStatus.ARCHIVED });
    this.save('archived');
  }

  canClose(): boolean {
    return !((this.editForm.invalid && this.editForm.get('alarmDate')!.valid) || this.isSaving);
  }

  resetDate(): void {
    this.editForm.get('alarmDate')!.reset();
  }

  protected onSaveSuccess(result: string): void {
    this.close(result);
  }

  protected onSaveError(): void {
    // Api for inheritance.
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

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INote>>, reason: string): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(reason),
      () => this.onSaveError()
    );
  }

  protected subscribeToSavePatchResponse(result: Observable<HttpResponse<INote>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSavePatchSuccess(),
      () => this.onSavePatchError()
    );
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

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(this.usersSharedCollection, ...(note.collaborators ?? []));
    this.tagsSharedCollection = this.tagService.addTagToCollectionIfMissing(this.tagsSharedCollection, ...(note.tags ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) => this.userService.addUserToCollectionIfMissing(users, ...(this.editForm.get('collaborators')!.value ?? [])))
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
      lastUpdateDate: dayjs(dayjs(), DATE_TIME_FORMAT),
      alarmDate: this.editForm.get(['alarmDate'])!.valid ? dayjs(this.editForm.get(['alarmDate'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      owner: this.editForm.get(['owner'])!.value,
      tags: this.editForm.get(['tags'])!.value,
      collaborators: this.editForm.get(['collaborators'])!.value,
    };
  }
}
