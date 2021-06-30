/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, Input, Output, EventEmitter, ElementRef, HostListener, HostBinding } from '@angular/core';

import { ITag } from '../../tag.model';

@Component({
  selector: 'jhi-tag-chip',
  templateUrl: './tag.template.html',
  styleUrls: ['./tag-component.style.scss'],
})
export class TagComponent {
  /**
   * @name model {ITag}
   */
  @Input()
  public model!: ITag;

  /**
   * @name index {number}
   */
  @Input()
  public index!: number;

  /**
   * @name disabled
   */
  @Input()
  public disabled = false;

  /**
   * @name onSelect
   */
  @Output()
  public onSelect: EventEmitter<ITag> = new EventEmitter<ITag>();

  /**
   * @name onRemove
   */
  @Output()
  public onRemove: EventEmitter<ITag> = new EventEmitter<ITag>();

  /**
   * @name onBlur
   */
  @Output()
  public onBlur: EventEmitter<ITag> = new EventEmitter<ITag>();

  /**
   * @name onKeyDown
   */
  @Output()
  public onKeyDown: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @name moving
   */
  @HostBinding('class.moving')
  public moving!: boolean;

  constructor(public element: ElementRef) {}

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
    this.onRemove.emit(this.model);
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
    setTimeout(() => {
      classList.remove('blink');
    }, 50);
  }

  /**
   * @name onBlurred
   * @param event
   */
  public onBlurred(): void {
    this.onBlur.emit(this.model);
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
