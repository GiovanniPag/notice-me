/* eslint-disable @angular-eslint/no-output-on-prefix */
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'app/admin/user-management/user-management.model';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { TagService } from '../../service/tag.service';
import { ITag } from '../../tag.model';

@Component({
  selector: 'jhi-tag-chips-form',
  styleUrls: ['./tag-chips-form.style.scss'],
  templateUrl: './tag-chips-form.template.html',
  providers: [NgbTypeaheadConfig],
})
export class TagChipsFormComponent implements OnChanges {
  /**
   * @name onSubmit
   */
  @Output() public onSubmit: EventEmitter<any> = new EventEmitter();

  /**
   * @name onBlur
   */
  @Output() public onBlur: EventEmitter<any> = new EventEmitter();

  /**
   * @name onKeyup
   */
  @Output() public onKeyup: EventEmitter<any> = new EventEmitter();

  /**
   * @name onKeydown
   */
  @Output() public onKeydown: EventEmitter<any> = new EventEmitter();

  // inputs

  /**
   * @name placeholder
   */
  @Input() public placeholder!: string;

  /**
   * @name inputId
   */
  @Input() public inputId: string | null | undefined;

  /**
   * @name owner
   * @desc the owner of the component
   */
  @Input() public owner!: IUser;

  /**
   * @name owner
   * @desc the owner of the component
   */
  @Input() public noteid: number | undefined;

  /**
   * @name inputClass
   */
  @Input() public inputClass!: string;

  /**
   * @name disabled
   */
  @Input() public disabled = false;

  /**
   * @name input
   */
  @ViewChild('tagName') public input!: ElementRef;

  /**
   * @name form
   */
  public form = this.fb.group({
    tagName: ['', [this.tagnameValidator(), Validators.maxLength(50)]],
  });

  tagsAutocomplete: ITag[] = [];
  private searching = false;

  constructor(private fb: FormBuilder, private config: NgbTypeaheadConfig, private tagService: TagService) {
    // customize default values of typeaheads used by this component tree
    this.config.showHint = true;
  }

  tagnameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string).trim();
      return value.length < 1 ? { minlength: { msg: 'entity.validation.minlength', TranslateValues: { min: 1 } } } : null;
    };
  }

  /**
   * @name inputText
   */
  public get inputText(): string {
    return this.form.get('tagName')!.value as string;
  }

  /**
   * @name inputText
   * @param text {string}
   */
  public set inputText(text: string) {
    this.form.get('tagName')!.setValue(text);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!!changes.disabled && !changes.disabled.firstChange) {
      if (changes.disabled.currentValue) {
        this.form.controls['tagName'].disable();
      } else {
        this.form.controls['tagName'].enable();
      }
    }
  }

  /**
   * @name value
   */
  public get value(): FormControl {
    return this.form.get('tagName') as FormControl;
  }

  /**
   * @name isInputFocused
   */
  public isInputFocused(): boolean {
    const doc = typeof document !== 'undefined' ? document : undefined;
    return doc ? doc.activeElement === this.input.nativeElement : false;
  }

  /**
   * @name getErrorMessages
   * @param messages
   */
  public getErrorMessages(messages: {
    [key: string]: { msg: string; translateValues?: { [key: string]: unknown } };
  }): { msg: string; translateValues?: { [key: string]: unknown } }[] {
    return Object.keys(messages)
      .filter(err => this.value.hasError(err))
      .map(err => messages[err]);
  }

  /**
   * @name hasErrors
   */
  public hasErrors(): boolean {
    const { dirty, value, valid } = this.form;
    return dirty && !!value.tagName && !valid;
  }

  /**
   * @name focus
   */
  public focus(): void {
    this.input.nativeElement.focus();
  }

  /**
   * @name blur
   */
  public blur(): void {
    this.input.nativeElement.blur();
  }

  /**
   * @name onKeyDown
   * @param $event
   */
  public onKeyDown($event: any): void {
    this.inputText = this.value.value;
    if ($event.key === 'Enter' && this.inputText.length > 0 && !this.hasErrors()) {
      this.submit($event);
    } else if ($event.key === 'Enter') {
      $event.preventDefault();
    } else {
      return this.onKeydown.emit($event);
    }
  }

  /**
   * @name onKeyUp
   * @param $event
   */
  public onKeyUp($event: any): void {
    this.inputText = this.value.value;
    return this.onKeyup.emit($event);
  }

  /**
   * @name submit
   */
  public submit($event: any): void {
    $event.preventDefault();
    this.onSubmit.emit($event);
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((value: string) =>
        value.length > 0
          ? this.tagService
              .query({
                page: 0,
                size: 10,
                initial: value,
                ownerid: this.owner.id,
                noteid: this.noteid,
              })
              .pipe(map((res: HttpResponse<ITag[]>): string[] => (res.body ? res.body.map((t: ITag): string => t.tagName!) : [])))
          : []
      ),
      tap(() => (this.searching = false))
    );
}
