/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, Input, Output, EventEmitter, ElementRef, HostListener, HostBinding, ChangeDetectorRef, Renderer2 } from '@angular/core';

import { TagModel } from '../../core/accessor';

// mocking navigator
const navigator =
  typeof window !== 'undefined'
    ? window.navigator
    : {
        userAgent: 'Chrome',
        vendor: 'Google Inc',
      };

const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

@Component({
  selector: 'jhi-tag-chip',
  templateUrl: './tag.template.html',
  styleUrls: ['./tag-component.style.scss'],
})
export class TagComponent {
  /**
   * @name model {TagModel}
   */
  @Input()
  public model: TagModel;

  /**
   * @name displayBy {string}
   */
  @Input()
  public displayBy: string;

  /**
   * @name identifyBy {string}
   */
  @Input()
  public identifyBy: string;

  /**
   * @name index {number}
   */
  @Input()
  public index: number;

  /**
   * @name disabled
   */
  @Input()
  public disabled = false;

  /**
   * @name canAddTag
   */
  @Input()
  public canAddTag: (tag: TagModel) => boolean;

  /**
   * @name onSelect
   */
  @Output()
  public onSelect: EventEmitter<TagModel> = new EventEmitter<TagModel>();

  /**
   * @name onRemove
   */
  @Output()
  public onRemove: EventEmitter<TagModel> = new EventEmitter<TagModel>();

  /**
   * @name onBlur
   */
  @Output()
  public onBlur: EventEmitter<TagModel> = new EventEmitter<TagModel>();

  /**
   * @name onKeyDown
   */
  @Output()
  public onKeyDown: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @name moving
   */
  @HostBinding('class.moving')
  public moving: boolean;

  constructor(public element: ElementRef, public renderer: Renderer2, private cdRef: ChangeDetectorRef) {}

  /**
   * @name select
   */
  public select($event?: MouseEvent): void {
    if (this.disabled) {
      return;
    }

    if ($event) {
      $event.stopPropagation();
    }

    this.focus();

    this.onSelect.emit(this.model);
  }

  /**
   * @name remove
   */
  public remove($event: MouseEvent): void {
    $event.stopPropagation();
    this.onRemove.emit(this);
  }

  /**
   * @name focus
   */
  public focus(): void {
    this.element.nativeElement.focus();
  }

  public move(): void {
    this.moving = true;
  }

  /**
   * @name keydown
   * @param event
   */
  @HostListener('keydown', ['$event'])
  public keydown(event: EventLike): void {
    this.onKeyDown.emit({ event, model: this.model });
  }

  /**
   * @name blink
   */
  public blink(): void {
    const classList = this.element.nativeElement.classList;
    classList.add('blink');

    setTimeout(() => classList.remove('blink'), 50);
  }

  /**
   * @name onBlurred
   * @param event
   */
  public onBlurred(event: any): void {
    const value: string = event.target.innerText;
    const result = typeof this.model === 'string' ? value : { ...this.model, [this.displayBy]: value };

    this.onBlur.emit(result);
  }

  /**
   * @name getDisplayValue
   * @param item
   */
  public getDisplayValue(item: TagModel): string {
    return typeof item === 'string' ? item : item[this.displayBy];
  }

  /**
   * @name isDeleteIconVisible
   */
  public isDeleteIconVisible(): boolean {
    return !this.disabled;
  }
}

interface EventLike {
  preventDefault(): void;
  keyCode: number;
}
