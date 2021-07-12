import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

import { INote, Note } from '../note.model';
import { ITag } from 'app/entities/tag/tag.model';
import { IUser } from 'app/entities/user/user.model';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { AlertService, Alert } from 'app/core/util/alert.service';

import { DATE_TIME_FORMAT, DATE_TIME_INPUT_FORMAT, DATE_FORMAT, TIME_FORMAT } from 'app/config/input.constants';
import { TagService } from 'app/entities/tag/service/tag.service';
import { UserService } from 'app/entities/user/user.service';
import { NoteService } from '../service/note.service';
import { FormBuilder, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { NoteStatus } from 'app/entities/enumerations/note-status.model';
import { ModalCloseReason } from 'app/entities/enumerations/modal-close-reason.model';
import { MinDateValidator } from 'app/shared/date/MinDateValidator.directive';
import { NoteDeleteDialogComponent } from '../delete/note-delete-dialog.component';
import { TagInputComponent } from 'app/entities/tag/tag-chips/tag-input/tag-input.component';
import { Attachment, IAttachment } from 'app/entities/attachment/attachment.model';
import { AttachmentService } from 'app/entities/attachment/service/attachment.service';

@Component({
  templateUrl: './note-update-dialog.component.html',
  styleUrls: ['../note.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoteUpdateDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('field_title') titleText!: ElementRef;
  @ViewChild('field_content') contentText!: ElementRef;
  @ViewChild('tagInput') tagInput!: TagInputComponent;

  note?: INote;
  allNoteStatus = NoteStatus;

  usersSharedCollection: IUser[] = [];

  maxTagLength = 50;
  maxTitleLength = 255;
  maxContentLength = 20000;
  minDate = dayjs().format(DATE_TIME_INPUT_FORMAT);
  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.maxLength(255)]],
    content: [null, [Validators.maxLength(20000)]],
    lastUpdateDate: [null, [Validators.required]],
    alarmDate: [null, [MinDateValidator(this.minDate)]],
    status: [null, [Validators.required]],
    owner: [null, [Validators.required]],
    tags: [],
    collaborators: [],
  });

  attachForm = this.fb.group({
    data: [null, [Validators.required]],
    dataContentType: [],
  });

  isSaving = false;
  private alertMaxTitle?: Alert;
  private alertMaxContent?: Alert;
  private alerts: Alert[] = [];

  private selected = false;

  constructor(
    protected dataUtils: DataUtils,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    public activeModal: NgbActiveModal,
    protected eventManager: EventManager,
    protected noteService: NoteService,
    protected userService: UserService,
    protected tagService: TagService,
    protected fb: FormBuilder,
    protected alertService: AlertService,
    protected attachmentService: AttachmentService
  ) {}

  ngAfterViewInit(): void {
    this.tagInput.inputForm!.popup.selectItem.subscribe(() => {
      this.selected = true;
      setTimeout(() => (this.selected = false), 10);
    });
  }

  ngOnInit(): void {
    // eslint-disable-next-line no-console
    console.log(this.note);

    this.alerts = this.alertService.get();
    this.updateForm(this.note!);
    this.loadRelationshipsOptions();
    this.loadAttachment();
    if (this.note!.status === NoteStatus.DELETED) {
      this.editForm.disable();
    }
  }

  closeAndSaveNote(): void {
    if (!this.selected) {
      if (this.note!.status === NoteStatus.DELETED) {
        this.close(ModalCloseReason.CLOSED);
      } else {
        if (this.canSubmit()) {
          this.save(ModalCloseReason.MODIFIED);
        }
      }
    }
  }

  savePatch(event: Event | undefined): void {
    this.isSaving = true;
    this.pushAlert(event?.target as HTMLInputElement);
    const note = this.createFromForm();
    if (note.id !== undefined) {
      this.subscribeToSavePatchResponse(this.noteService.partialUpdate(note), note);
    }
  }

  addWarningAlert(translationKey?: string, translationParams?: { [key: string]: unknown }): Alert {
    return this.alertService.addAlert({ type: 'warning', timeout: 0, translationKey, translationParams }, this.alerts);
  }

  checkInputLenght(
    limit: number,
    translationKey: string,
    currentLenght: number,
    maxLenght: number,
    alertToDeisplay: Alert | undefined
  ): Alert | undefined {
    const remainingChar = maxLenght - currentLenght >= 0 ? maxLenght - currentLenght : 0;
    if (remainingChar <= limit) {
      if (!alertToDeisplay || alertToDeisplay.closed === true) {
        alertToDeisplay = this.addWarningAlert(translationKey, { remainingCharachters: remainingChar });
      } else {
        alertToDeisplay.translationParams!.remainingCharachters = remainingChar;
        this.alertService.translateDynamicMessage(alertToDeisplay);
      }
    } else {
      if (alertToDeisplay?.closed === false) {
        alertToDeisplay.close?.(this.alerts);
      }
    }
    return alertToDeisplay;
  }

  pushAlert(elem: HTMLInputElement | undefined): void {
    if (elem && elem === this.titleText.nativeElement) {
      this.alertMaxTitle = this.checkInputLenght(100, 'warning.titlelength', elem.value.length, this.maxTitleLength, this.alertMaxTitle);
    }
    if (elem && elem === this.contentText.nativeElement) {
      this.alertMaxContent = this.checkInputLenght(
        500,
        'warning.contentlength',
        elem.value.length,
        this.maxContentLength,
        this.alertMaxContent
      );
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

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

  trackTagById(index: number, item: ITag): number {
    return item.id!;
  }

  close(reason: string): void {
    if (this.alertMaxTitle?.closed === false) {
      this.alertMaxTitle.close?.(this.alerts);
    }
    if (this.alertMaxContent?.closed === false) {
      this.alertMaxContent.close?.(this.alerts);
    }
    this.activeModal.close(reason);
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.attachForm, field, isImage).subscribe(
      () => {
        this.isSaving = true;
        const attachment = this.createAttach();
        this.subscribeToAttachSaveResponse(this.attachmentService.create(attachment));
      },
      (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('noticeMeApp.error', { ...err, key: 'error.file.' + err.key })
        )
    );
  }

  deleteNote(): void {
    this.editForm.patchValue({ status: NoteStatus.DELETED });
    this.save(ModalCloseReason.DELETED);
  }
  unDeleteNote(): void {
    this.editForm.patchValue({ status: NoteStatus.NORMAL });
    this.save(ModalCloseReason.UNDELETED);
  }
  permanentDeleteNote(): void {
    const modalRef = this.modalService.open(NoteDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      backdropClass: 'click-outside-exclude',
      windowClass: 'click-outside-exclude',
    });
    modalRef.componentInstance.note = this.note;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.close(ModalCloseReason.PERMANENTDELETED);
      }
    });
  }

  archiveNote(): void {
    this.editForm.patchValue({ status: NoteStatus.ARCHIVED });
    this.save(ModalCloseReason.ARCHIVED);
  }

  unPinNote(): void {
    this.note!.status = NoteStatus.NORMAL;
    this.editForm.patchValue({ status: NoteStatus.NORMAL });
  }

  pinNote(): void {
    const initialStatus = this.note!.status;
    this.note!.status = NoteStatus.PINNED;
    this.editForm.patchValue({ status: NoteStatus.PINNED });
    if (initialStatus === NoteStatus.ARCHIVED) {
      this.save(ModalCloseReason.UNARCHIVED);
    }
  }

  unArchiveNote(): void {
    this.editForm.patchValue({ status: NoteStatus.NORMAL });
    this.save(ModalCloseReason.UNARCHIVED);
  }

  canSubmit(): boolean {
    return (
      (this.editForm.valid ||
        (this.editForm.get('alarmDate')!.invalid &&
          this.editForm.get('status')!.valid &&
          this.editForm.get('title')!.valid &&
          this.editForm.get('content')!.valid &&
          this.editForm.get('owner')!.valid)) &&
      !this.isSaving
    );
  }

  resetDate(): dayjs.Dayjs {
    this.note!.alarmDate = undefined;
    this.editForm.get('alarmDate')!.reset();
    return dayjs(this.editForm.get('alarmDate')!.value, DATE_TIME_FORMAT);
  }

  getFormattedDate(): string {
    let lastUpdateDate: string;
    const today = dayjs().set('second', 0).set('minute', 0).set('hour', 0);
    if (this.note?.lastUpdateDate?.isAfter(today)) {
      lastUpdateDate = ': ' + this.note.lastUpdateDate.format(TIME_FORMAT);
    } else {
      lastUpdateDate = ': ' + this.note!.lastUpdateDate!.format(DATE_FORMAT);
    }
    return lastUpdateDate;
  }

  public modelChangeFn($event: ITag[]): void {
    this.note!.tags = $event;
    this.editForm.patchValue({ tags: this.note!.tags });
    this.savePatch(undefined);
  }

  protected subscribeToAttachSaveResponse(result: Observable<HttpResponse<IAttachment>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSavePatchSuccess(),
      () => this.onSavePatchError()
    );
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

  protected subscribeToSavePatchResponse(result: Observable<HttpResponse<INote>>, note: INote): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => {
        this.onSavePatchSuccess();
        this.note = note;
      },
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
    this.attachForm.patchValue({ note: note.id });
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(this.usersSharedCollection, ...(note.collaborators ?? []));

    this.alertMaxTitle = this.checkInputLenght(
      100,
      'warning.titlelength',
      note.title?.length ?? 0,
      this.maxTitleLength,
      this.alertMaxTitle
    );
    this.alertMaxContent = this.checkInputLenght(
      500,
      'warning.contentlength',
      note.content?.length ?? 0,
      this.maxContentLength,
      this.alertMaxContent
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) => this.userService.addUserToCollectionIfMissing(users, ...(this.editForm.get('collaborators')!.value ?? [])))
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }

  protected loadAttachment(): void {
    this.attachmentService.query;
    return;
  }

  protected createFromForm(): INote {
    return {
      ...new Note(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      content: this.editForm.get(['content'])!.value,
      lastUpdateDate: dayjs(dayjs(), DATE_TIME_FORMAT),
      alarmDate: this.editForm.get(['alarmDate'])!.valid
        ? dayjs(this.editForm.get(['alarmDate'])!.value, DATE_TIME_FORMAT)
        : this.resetDate(),
      status: this.editForm.get(['status'])!.value,
      owner: this.editForm.get(['owner'])!.value,
      tags: this.editForm.get(['tags'])?.value,
      collaborators: this.editForm.get(['collaborators'])!.value,
    };
  }

  protected createAttach(): IAttachment {
    return {
      ...new Attachment(),
      dataContentType: this.attachForm.get(['dataContentType'])!.value,
      data: this.attachForm.get(['data'])!.value,
      note: this.createFromForm(),
    };
  }
}
