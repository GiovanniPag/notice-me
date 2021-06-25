/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, forwardRef, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

import { AsyncValidatorFn, FormControl, NG_VALUE_ACCESSOR, ValidatorFn } from '@angular/forms';

// rx
import { debounceTime, filter, first } from 'rxjs/operators';

// ng2-tag-input
import { ITag } from 'app/entities/tag/tag.model';
import { TagInputAccessorDirective } from '../../core/accessor';
import * as constants from 'app/config/tag-chips.constants';

import { DragProvider, DraggedTag } from '../../core/providers/drag-provider';

import { TagChipsFormComponent } from '../tag-chips-form/tag-chips-form.component';
import { TagComponent } from '../tag/tag.component';

import { animations } from './animations';
import { defaults } from '../../defaults';

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
  @Input() public separatorKeyCodes: number[] = defaults.tagInput.separatorKeyCodes;

  /**
   * @name placeholder
   * @desc the placeholder of the input text
   */
  @Input() public placeholder: string = defaults.tagInput.placeholder;

  /**
   * @name secondaryPlaceholder
   * @desc placeholder to appear when the input is empty
   */
  @Input() public secondaryPlaceholder: string = defaults.tagInput.secondaryPlaceholder;

  /**
   * @name validators
   * @desc array of Validators that are used to validate the tag before it gets appended to the list
   */
  @Input() public validators: ValidatorFn[] = defaults.tagInput.validators;

  /**
   * @name asyncValidators
   * @desc array of AsyncValidator that are used to validate the tag before it gets appended to the list
   */
  @Input() public asyncValidators: AsyncValidatorFn[] = defaults.tagInput.asyncValidators;

  /**
   * @name errorMessages
   */
  @Input() public errorMessages: { [key: string]: string } = defaults.tagInput.errorMessages;

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
   * @name dragZone
   */
  @Input() public dragZone = 'note_tags';

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
  @Output() public onAdd = new EventEmitter<ITag>();

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
  @ViewChild(TagChipsFormComponent) public inputForm!: TagChipsFormComponent;

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
  public animationMetadata = {
    value: 'in',
    params: { enter: '250ms', leave: '150ms' },
  };

  public errors: string[] = [];

  /**
   * @name listeners
   * @desc array of events that get fired using @fireEvents
   */
  private listeners: { [key: string]: { (fun: any): any }[] } = {
    [constants.KEYDOWN]: <{ (fun: any): any }[]>[],
    [constants.KEYUP]: <{ (fun: any): any }[]>[],
  };

  constructor(public dragProvider: DragProvider) {
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

    const statusChanges$ = this.inputForm.form!.statusChanges;

    statusChanges$.pipe(filter((status: string) => status !== 'PENDING')).subscribe(() => {
      this.errors = this.inputForm.getErrorMessages(this.errorMessages);
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
   * @name onAddingRequested
   * @param fromAutocomplete {boolean}
   * @param tag {ITag}
   * @param index? {number}
   * @param giveupFocus? {boolean}
   */
  public onAddingRequested(fromAutocomplete: boolean, tag: ITag, index?: number, giveupFocus?: boolean): Promise<ITag> {
    return new Promise<ITag>((resolve, reject) => {
      const subscribeFn = (model: ITag): Promise<ITag> => {
        alert('oi');
        return this.addItem(fromAutocomplete, model, index, giveupFocus).then(resolve).catch(reject);
      };
      return this.onAdding ? this.onAdding(tag).pipe(first()).subscribe(subscribeFn, reject) : subscribeFn(tag);
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
   * @name createTag
   * @param model
   */
  public createTag = (model: ITag): ITag => {
    const trim = (val: ITag, key: string): ITag => {
      return typeof val === 'string' ? val.trim() : val[key];
    };

    return {
      ...(typeof model !== 'string' ? model : {}),
      [this.displayBy]: trim(model, this.displayBy),
      [this.identifyBy]: trim(model, this.identifyBy),
    };
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
    const key = event.keyCode || event.which;
    const shiftKey = event.shiftKey || false;

    switch (constants.KEY_PRESS_ACTIONS[key]) {
      case constants.ACTIONS_KEYS.DELETE:
        if (this.selectedTag) {
          const index = this.items.indexOf(this.selectedTag);
          this.onRemoveRequested(this.selectedTag, index);
        }
        break;

      case constants.ACTIONS_KEYS.SWITCH_PREV:
        this.moveToTag(data.model, constants.PREV);
        break;

      case constants.ACTIONS_KEYS.SWITCH_NEXT:
        this.moveToTag(data.model, constants.NEXT);
        break;

      case constants.ACTIONS_KEYS.TAB:
        if (shiftKey) {
          if (this.isFirstTag(data.model)) {
            return;
          }

          this.moveToTag(data.model, constants.PREV);
        } else {
          if (this.isLastTag(data.model) && this.disable) {
            return;
          }

          this.moveToTag(data.model, constants.NEXT);
        }
        break;

      default:
        return;
    }

    // prevent default behaviour
    event.preventDefault();
  }

  public async onFormSubmit(): Promise<ITag> {
    try {
      await this.onAddingRequested(false, this.formValue);
    } catch {
      return;
    }
  }

  /**
   * @name setInputValue
   * @param value
   */
  public setInputValue(value: string, emitEvent = true): void {
    const control = this.getControl();

    // update form value with the transformed item
    control.setValue(value, { emitEvent });
  }

  /**
   * @name focus
   * @param applyFocus
   */
  public focus(applyFocus = false): void {
    if (this.dragProvider.getState('dragging')) {
      return;
    }
    this.selectItem(undefined);
    if (applyFocus) {
      this.inputForm.focus();
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
    return this.inputForm.hasErrors();
  }

  /**
   * @name isInputFocused
   */
  public isInputFocused(): boolean {
    return this.inputForm.isInputFocused();
  }

  /**
   * @name formValue
   */
  public get formValue(): ITag {
    const form = this.inputForm.value;

    return form ? form.value : null;
  }

  /**3
   * @name onDragStarted
   * @param event
   * @param index
   */
  public onDragStarted(event: DragEvent, tag: ITag, index: number): void {
    event.stopPropagation();

    const item = { zone: this.dragZone, tag, index } as DraggedTag;

    this.dragProvider.setSender(this);
    this.dragProvider.setDraggedItem(event, item);
    this.dragProvider.setState({ dragging: true, index });
  }

  /**
   * @name onDragOver
   * @param event
   */
  public onDragOver(event: DragEvent, index?: number): void {
    this.dragProvider.setState({ dropping: true });
    this.dragProvider.setReceiver(this);

    event.preventDefault();
  }

  /**
   * @name onTagDropped
   * @param event
   * @param index
   */
  public onTagDropped(event: DragEvent, index?: number): void {
    const item = this.dragProvider.getDraggedItem(event);

    if (!item || item.zone !== this.dragZone) {
      return;
    }

    this.dragProvider.onTagDropped(item.tag, item.index, index);

    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * @name isDropping
   */
  public isDropping(): boolean {
    const isReceiver = this.dragProvider.receiver === this;
    const isDropping = this.dragProvider.getState('dropping');

    return Boolean(isReceiver && isDropping);
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
   * @name trackBy
   * @param items
   */
  public trackBy(index: number, item: ITag): string {
    return item[this.identifyBy];
  }

  /**
   *
   * @param tag
   * @param isFromAutocomplete
   */
  public isTagValid = (tag: ITag, fromAutocomplete = false): boolean => {
    const selectedItem = this.dropdown ? this.dropdown.selectedItem : undefined;
    const value = this.getItemDisplay(tag).trim();

    if ((selectedItem && !fromAutocomplete) || !value) {
      return false;
    }

    const dupe = this.findDupe(tag, fromAutocomplete);

    // if so, give a visual cue and return false
    if (dupe) {
      const model = this.tags.find(item => this.getItemValue(item.model) === this.getItemValue(dupe));

      if (model) {
        model.blink();
      }
    }

    const isFromAutocomplete = fromAutocomplete;

    const assertions = [
      // 1. there must be no dupe OR dupes are allowed
      !dupe,

      // 3. check item comes from autocomplete
      isFromAutocomplete,
    ];

    return assertions.filter(Boolean).length === assertions.length;
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
   * @name moveToTag
   * @param item
   * @param direction
   */
  private moveToTag(item: ITag, direction: string): void {
    const isLast = this.isLastTag(item);
    const isFirst = this.isFirstTag(item);
    const stopSwitch = (direction === constants.NEXT && isLast) || (direction === constants.PREV && isFirst);

    if (stopSwitch) {
      this.focus(true);
      return;
    }

    const offset = direction === constants.NEXT ? 1 : -1;
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
  private getTagAtIndex(index: number) {
    const tags = this.tags.toArray();

    return tags[index];
  }

  /**
   * @name getControl
   */
  private getControl(): FormControl {
    return this.inputForm.value;
  }

  /**
   * @name addItem
   * @desc adds the current text model to the items array
   * @param fromAutocomplete {boolean}
   * @param item {ITag}
   * @param index? {number}
   * @param giveupFocus? {boolean}
   */
  private addItem(fromAutocomplete = false, item: ITag, index?: number, giveupFocus?: boolean): Promise<ITag> {
    const display = this.getItemDisplay(item);
    const tag = this.createTag(item);

    if (fromAutocomplete) {
      this.setInputValue(this.getItemValue(item, true));
    }

    return new Promise((resolve, reject) => {
      /**
       * @name reset
       */
      const reset = (): void => {
        // reset control and focus input
        this.setInputValue('');

        if (giveupFocus) {
          this.focus(false, false);
        } else {
          // focus input
          this.focus(true, false);
        }

        resolve(display);
      };

      const appendItem = (): void => {
        this.appendTag(tag, index);

        // emit event
        this.onAdd.emit(tag);

        if (!this.dropdown) {
          return;
        }

        this.dropdown.hide();

        if (this.dropdown.showDropdownIfEmpty) {
          this.dropdown.show();
        }
      };

      const status = this.inputForm.form!.status;
      const isTagValid = this.isTagValid(tag, fromAutocomplete);

      const onValidationError = () => {
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
        const statusUpdate$ = this.inputForm.form!.statusChanges;

        return statusUpdate$
          .pipe(
            filter(statusUpdate => statusUpdate !== 'PENDING'),
            first()
          )
          .subscribe(statusUpdate => {
            if (statusUpdate === 'VALID' && isTagValid) {
              appendItem();
              return reset();
            } else {
              reset();
              return onValidationError();
            }
          });
      }
    });
  }

  /**
   * @name setupSeparatorKeysListener
   */
  private setupSeparatorKeysListener(): void {
    const useSeparatorKeys = this.separatorKeyCodes.length > 0 || this.separatorKeys.length > 0;
    const listener = ($event: KeyboardEvent): void => {
      const hasKeyCode = this.separatorKeyCodes.indexOf($event.keyCode) >= 0;
      const hasKey = this.separatorKeys.indexOf($event.key) >= 0;
      // the keyCode of keydown event is 229 when IME is processing the key event.
      const isIMEProcessing = $event.keyCode === 229;

      if (hasKeyCode || (hasKey && !isIMEProcessing)) {
        $event.preventDefault();
        this.onAddingRequested(false, this.formValue).catch(() => {});
      }
    };

    this.listen.call(this, constants.KEYDOWN, listener, useSeparatorKeys);
  }

  /**
   * @name setUpKeypressListeners
   */
  private setUpKeypressListeners(): void {
    const listener = ($event: KeyboardEvent): void => {
      const isCorrectKey = $event.keyCode === 37 || $event.keyCode === 8;

      if (isCorrectKey && !this.formValue && this.items.length) {
        this.tags.last.select.call(this.tags.last);
      }
    };

    // setting up the keypress listeners
    this.listen.call(this, constants.KEYDOWN, listener);
  }

  /**
   * @name setUpKeydownListeners
   */
  private setUpInputKeydownListeners(): void {
    this.inputForm.onKeydown.subscribe(event => {
      if (event.key === 'Backspace' && this.formValue.trim() === '') {
        event.preventDefault();
      }
    });
  }

  /**
   * @name setUpOnBlurSubscriber
   */
  private setUpOnBlurSubscriber(): void {
    const filterFn = (): boolean => !this.dropdown.isVisible && !!this.formValue;

    this.inputForm.onBlur.pipe(debounceTime(100), filter(filterFn)).subscribe(() => {
      this.setInputValue('');
    });
  }

  /**
   * @name findDupe
   * @param tag
   * @param isFromAutocomplete
   */
  private findDupe(tag: ITag, isFromAutocomplete: boolean): ITag | undefined {
    const identifyBy = isFromAutocomplete ? this.dropdown.identifyBy : this.identifyBy;
    const id = tag[identifyBy];

    return this.items.find(item => this.getItemValue(item) === id);
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
