/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, forwardRef, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

// rx
import { debounceTime, filter, finalize, first } from 'rxjs/operators';

// ng2-tag-input
import { ITag, Tag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';
import { ACTIONS_KEYS, KEYDOWN, KEYUP, KEY_PRESS_ACTIONS, NEXT, PREV } from 'app/config/tag-chips.constants';
import { defaults } from 'app/config/tag-chips.constants';

import { TagChipsFormComponent } from '../tag-chips-form/tag-chips-form.component';
import { TagComponent } from '../tag/tag.component';

import { TagInputAccessorDirective } from '../accessor';
import { animations } from './animations';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

const CUSTOM_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TagInputComponent),
  multi: true,
};

@Component({
  selector: 'jhi-tag-input',
  providers: [CUSTOM_ACCESSOR],
  styleUrls: ['./tag-input.style.scss'],
  templateUrl: './tag-input.template.html',
  animations,
})
export class TagInputComponent extends TagInputAccessorDirective implements AfterViewInit {
  /**
   * @name separatorKeyCodes
   * @desc keyboard key codes with which a user can separate items
   */
  @Input() public separatorKeys: string[] = defaults.tagInput.separatorKeyCodes;

  /**
   * @name placeholder
   * @desc the placeholder of the input text
   */
  @Input() public placeholder: string = defaults.tagInput.placeholder;

  /**
   * @name noteid
   * @desc the owner of the component
   */
  @Input() public noteid: number | undefined;

  /**
   * @name secondaryPlaceholder
   * @desc placeholder to appear when the input is empty
   */
  @Input() public secondaryPlaceholder: string = defaults.tagInput.secondaryPlaceholder;

  /**
   * @name errorMessages
   */
  @Input() public errorMessages: { [key: string]: { msg: string; translateValues?: { [key: string]: unknown } } } =
    defaults.tagInput.errorMessages;

  /**
   * @name theme
   */
  @Input() public theme: string = defaults.tagInput.theme;

  /**
   * - custom id assigned to the input
   * @name id
   */
  @Input() public inputId = defaults.tagInput.inputId;

  /**
   * - custom class assigned to the input
   */
  @Input() public inputClass: string = defaults.tagInput.inputClass;

  /**
   * @name disable
   */
  @Input() public disable: boolean = defaults.tagInput.disable;

  /**
   * @name onRemoving
   */
  @Input() public onRemoving = defaults.tagInput.onRemoving;

  /**
   * @name onAdding
   */
  @Input() public onAdding = defaults.tagInput.onAdding;

  /**
   * @name onAdd
   * @desc event emitted when adding a new item
   */
  @Output() public onAdd = new EventEmitter<{ tag: ITag; index: number | undefined }>();

  /**
   * @name onRemove
   * @desc event emitted when removing an existing item
   */
  @Output() public onRemove = new EventEmitter<ITag>();

  /**
   * - output triggered when tag entered is not valid
   * @name onValidationError
   */
  @Output() public onValidationError = new EventEmitter<ITag>();

  /**
   * @name inputForm
   */
  @ViewChild(TagChipsFormComponent) public inputForm: TagChipsFormComponent | undefined;

  /**
   * @name selectedTag
   * @desc reference to the current selected tag
   */
  public selectedTag: ITag | undefined;

  /**
   * @name tags
   * @desc list of Element items
   */
  @ViewChildren(TagComponent) public tags!: QueryList<TagComponent>;

  /**
   * @name animationMetadata
   */
  public animationMetadata = { value: 'in', params: { enter: '250ms', leave: '150ms' } };

  public errors: { msg: string; translateValues?: { [key: string]: unknown } }[] | undefined;

  /**
   * @name listeners
   * @desc array of events that get fired using @fireEvents
   */
  private listeners: { [key: string]: { (fun: any): any }[] } = {
    [KEYDOWN]: <{ (fun: any): any }[]>[],
    [KEYUP]: <{ (fun: any): any }[]>[],
  };

  private isSaving = false;
  private isLoading = false;

  constructor(protected tagService: TagService) {
    super();
  }

  /**
   * @name ngAfterViewInit
   */
  public ngAfterViewInit(): void {
    // set up listeners

    this.setUpKeypressListeners();
    this.setupSeparatorKeysListener();
    this.setUpInputKeydownListeners();

    // on blur clear the text's form
    this.setUpOnBlurSubscriber();

    const statusChanges$ = this.inputForm?.form.statusChanges;

    statusChanges$?.pipe(filter((status: string) => status !== 'PENDING')).subscribe(() => {
      this.errors = this.inputForm?.getErrorMessages(this.errorMessages);
    });
  }

  /**
   * @name onRemoveRequested
   * @param tag
   * @param index
   */
  public onRemoveRequested(tag: ITag, index: number): Promise<ITag> {
    return new Promise(resolve => {
      const subscribeFn = (model: ITag): void => {
        this.removeItem(model, index);
        resolve(tag);
      };
      this.onRemoving ? this.onRemoving(tag).pipe(first()).subscribe(subscribeFn) : subscribeFn(tag);
    });
  }

  /**
   * @name appendTag
   * @param tag {ITag}
   */
  public appendTag = (tag: ITag, index = this.items.length): void => {
    const items = this.items;
    this.items = [...items.slice(0, index), tag, ...items.slice(index, items.length)];
  };

  /**
   * @name selectItem
   * @desc selects item passed as parameter as the selected tag
   * @param item
   * @param emit
   */
  public selectItem(item: ITag | undefined): void {
    if (this.selectedTag === item) {
      return;
    }
    this.selectedTag = item;
  }

  /**
   * @name fireEvents
   * @desc goes through the list of the events for a given eventName, and fires each of them
   * @param eventName
   * @param $event
   */
  public fireEvents(eventName: string, $event?: any): void {
    this.listeners[eventName].forEach(listener => {
      listener.call(this, $event);
    });
  }

  /**
   * @name handleKeydown
   * @desc handles action when the user hits a keyboard key
   * @param data
   */
  public handleKeydown(data: any): void {
    const event = data.event;
    switch (KEY_PRESS_ACTIONS[event.key]) {
      case ACTIONS_KEYS.DELETE:
        if (this.selectedTag) {
          const index = this.items.indexOf(this.selectedTag);
          this.onRemoveRequested(this.selectedTag, index);
        }
        break;

      case ACTIONS_KEYS.SWITCH_PREV:
        this.moveToTag(data.model, PREV);
        break;

      case ACTIONS_KEYS.SWITCH_NEXT:
        this.moveToTag(data.model, NEXT);
        break;

      case ACTIONS_KEYS.TAB:
        if (event.shiftKey) {
          this.moveToTag(data.model, PREV);
        } else {
          this.moveToTag(data.model, NEXT);
        }
        break;
      default:
        return;
    }
    // prevent default behaviour
    event.preventDefault();
  }

  public onFormSubmit(): void {
    this.addTag(this.formValue);
  }

  /**
   * @name setInputValue
   * @param value
   */
  public setInputValue(value: string, emitEvent = true): void {
    const control = this.getControl();

    // update form value with the transformed item
    control?.setValue(value, { emitEvent });
  }

  /**
   * @name focus
   * @param applyFocus
   */
  public focus(applyFocus = false): void {
    this.selectItem(undefined);
    if (applyFocus) {
      this.inputForm?.focus();
    }
  }

  /**
   * @name blur
   */
  public blur(): void {
    this.onTouched();
  }

  /**
   * @name hasErrors
   */
  public hasErrors(): boolean {
    return this.inputForm ? this.inputForm.hasErrors() : false;
  }

  /**
   * @name isInputFocused
   */
  public isInputFocused(): boolean {
    return this.inputForm ? this.inputForm.isInputFocused() : false;
  }

  /**
   * @name formValue
   */
  public get formValue(): string {
    return this.inputForm?.inputText.trim() as string;
  }

  /**
   * @name onTagBlurred
   * @param changedElement {ITag}
   * @param index {number}
   */
  public onTagBlurred(changedElement: ITag, index: number): void {
    this.items[index] = changedElement;
    this.blur();
  }

  /**
   * @name trackByIndex
   * @param items
   */
  public trackByIndex(index: number): number {
    return index;
  }

  /**
   *
   * @param tag
   * @param isFromAutocomplete
   */
  public isTagValid = (tagName: string): boolean => {
    const dupe = this.findDupe(tagName);
    // if so, give a visual cue and return false
    if (dupe) {
      const model = this.tags.find(item => this.getItemValue(item.model) === this.getItemValue(dupe));
      if (model) {
        model.blink();
      }
    }
    return !dupe;
  };

  /**
   * @name removeItem
   * @desc removes an item from the array of the model
   * @param tag {ITag}
   * @param index {number}
   */
  public removeItem(tag: ITag, index: number): void {
    this.items = this.getItemsWithout(index);
    // if the removed tag was selected, set it as undefined
    if (this.selectedTag === tag) {
      this.selectItem(undefined);
    }
    // focus input
    this.focus(true);
    // emit remove event
    this.onRemove.emit(tag);
  }

  /**
   * @name onAddingRequested
   * @param fromAutocomplete {boolean}
   * @param tag {ITag}
   * @param index? {number}
   * @param giveupFocus? {boolean}
   */
  public onAddingRequested(tag: ITag, index?: number, giveupFocus?: boolean): Promise<ITag> {
    return new Promise(resolve => {
      const subscribeFn = (model: ITag): void => {
        this.addItem(model, index, giveupFocus);
        resolve(tag);
      };
      this.onAdding ? this.onAdding(tag).pipe(first()).subscribe(subscribeFn) : subscribeFn(tag);
    });
  }

  protected addTag(tagName: string): void {
    if (this.isTagValid(tagName)) {
      this.isLoading = true;
      let tag: ITag;
      this.tagService.findByName(tagName).subscribe(
        (data: HttpResponse<ITag>) => {
          this.isLoading = false;
          if (data.body) {
            this.onAddingRequested(data.body);
          } else if (data.status === 204) {
            this.isSaving = true;
            tag = new Tag(undefined, tagName);
            this.subscribeToSaveResponse(this.tagService.create(tag));
          }
        },
        () => {
          this.isLoading = false;
        }
      );
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITag>>): void {
    result
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe(
        data => {
          this.onSaveSuccess(data.body!);
        },
        () => this.onSaveError()
      );
  }

  protected onSaveSuccess(savedTag: ITag): void {
    this.onAddingRequested(savedTag);
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  /**
   * @name moveToTag
   * @param item
   * @param direction
   */
  private moveToTag(item: ITag, direction: string): void {
    const isLast = this.isLastTag(item);
    const isFirst = this.isFirstTag(item);
    const stopSwitch = (direction === NEXT && isLast) || (direction === PREV && isFirst);
    if (stopSwitch) {
      this.focus(true);
      return;
    }

    const offset = direction === NEXT ? 1 : -1;
    const index = this.getTagIndex(item) + offset;
    const tag = this.getTagAtIndex(index);

    return tag.select.call(tag);
  }

  /**
   * @name isFirstTag
   * @param item {ITag}
   */
  private isFirstTag(item: ITag): boolean {
    return this.tags.first.model === item;
  }

  /**
   * @name isLastTag
   * @param item {ITag}
   */
  private isLastTag(item: ITag): boolean {
    return this.tags.last.model === item;
  }

  /**
   * @name getTagIndex
   * @param item
   */
  private getTagIndex(item: ITag): number {
    const tags = this.tags.toArray();

    return tags.findIndex(tag => tag.model === item);
  }

  /**
   * @name getTagAtIndex
   * @param index
   */
  private getTagAtIndex(index: number): TagComponent {
    const tags = this.tags.toArray();

    return tags[index];
  }

  /**
   * @name getControl
   */
  private getControl(): FormControl | undefined {
    return this.inputForm?.value;
  }

  /**
   * @name addItem
   * @desc adds the current text model to the items array
   * @param fromAutocomplete {boolean}
   * @param item {ITag}
   * @param index? {number}
   * @param giveupFocus? {boolean}
   */
  private addItem(tag: ITag, index?: number, giveupFocus?: boolean): Promise<ITag> {
    return new Promise<ITag>((resolve, reject) => {
      /**
       * @name reset
       */
      const reset = (): void => {
        // reset control and focus input
        this.setInputValue('');
        if (giveupFocus) {
          this.focus(false);
        } else {
          this.focus(true);
        }
        resolve(tag);
      };

      const appendItem = (): void => {
        this.appendTag(tag, index);
        this.onAdd.emit({ tag, index });
      };

      const status = this.inputForm?.form.status;
      const isTagValid = this.isTagValid(tag.tagName!);
      const onValidationError = (): void => {
        this.onValidationError.emit(tag);
        return reject();
      };

      if (status === 'VALID' && isTagValid) {
        appendItem();
        return reset();
      }

      if (status === 'INVALID' || !isTagValid) {
        reset();
        return onValidationError();
      }
      if (status === 'PENDING') {
        const statusUpdate$ = this.inputForm?.form.statusChanges;
        if (statusUpdate$) {
          return statusUpdate$
            .pipe(
              filter(statusUpdate => statusUpdate !== 'PENDING'),
              first()
            )
            .subscribe(statusUpdate => {
              if (statusUpdate === 'VALID') {
                appendItem();
                return reset();
              } else {
                reset();
                return onValidationError();
              }
            });
        }
      }
    });
  }

  /**
   * @name setupSeparatorKeysListener
   */
  private setupSeparatorKeysListener(): void {
    const useSeparatorKeys = this.separatorKeys.length > 0;
    const listener = ($event: KeyboardEvent): void => {
      const hasKeyCode = this.separatorKeys.indexOf($event.key) >= 0;

      if (hasKeyCode) {
        $event.preventDefault();
        this.addTag(this.formValue);
      }
    };

    this.listen.call(this, KEYDOWN, listener, useSeparatorKeys);
  }

  /**
   * @name setUpKeypressListeners
   */
  private setUpKeypressListeners(): void {
    const listener = ($event: KeyboardEvent): void => {
      let isCorrectKey = $event.key === 'ArrowLeft' || $event.key === 'Backspace';
      if (isCorrectKey && this.inputForm?.inputText.length === 0 && this.items.length) {
        this.tags.last.select.call(this.tags.last);
      }

      isCorrectKey = $event.key === 'ArrowRight';
      if (isCorrectKey && this.inputForm?.inputText.length === 0 && this.items.length) {
        this.tags.first.select.call(this.tags.first);
      }
    };

    // setting up the keypress listeners
    this.listen.call(this, KEYDOWN, listener);
  }

  /**
   * @name setUpKeydownListeners
   */
  private setUpInputKeydownListeners(): void {
    this.inputForm?.onKeydown.subscribe(event => {
      if (event.key === 'Backspace' && this.inputForm?.inputText.length === 0) {
        event.preventDefault();
      }
    });
  }

  /**
   * @name setUpOnBlurSubscriber
   */
  private setUpOnBlurSubscriber(): void {
    const filterFn = (): boolean => !!this.formValue;

    this.inputForm?.onBlur.pipe(debounceTime(100), filter(filterFn)).subscribe(() => {
      this.setInputValue('');
    });
  }

  /**
   * @name findDupe
   * @param tag
   * @param isFromAutocomplete
   */
  private findDupe(tagName: string): ITag | undefined {
    return this.items.find(item => this.getItemDisplay(item) === tagName);
  }

  private listen(listenerType: string, action: ($event: KeyboardEvent) => any, condition = true): void {
    // if the event provided does not exist, throw an error
    if (!Object.prototype.hasOwnProperty.call(this.listeners, listenerType)) {
      throw new Error('The event entered may be wrong');
    }

    // if a condition is present and is false, exit early
    if (!condition) {
      return;
    }

    // fire listener
    this.listeners[listenerType].push(action);
  }
}
