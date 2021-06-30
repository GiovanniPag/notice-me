import { ControlValueAccessor } from '@angular/forms';
import { Directive } from '@angular/core';
import { ITag } from 'app/entities/tag/tag.model';

@Directive()
export class TagInputAccessorDirective implements ControlValueAccessor {
  private _items: ITag[] = [];
  private _onTouchedCallback: (() => void) | undefined;
  private _onChangeCallback: ((items: ITag[]) => void) | undefined;

  public get items(): ITag[] {
    return this._items;
  }

  public set items(items: ITag[]) {
    this._items = items;
    this._onChangeCallback?.(this._items);
  }

  public onTouched(): void {
    this._onTouchedCallback?.();
  }

  public registerOnChange(fn: (items: ITag[]) => void): void {
    this._onChangeCallback = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouchedCallback = fn;
  }

  public writeValue(items: ITag[] | undefined): void {
    this._items = items ?? [];
  }

  /**
   * @name getItemValue
   * @param item
   * @param fromDropdown
   */
  public getItemValue(item: ITag): number {
    return item.id!;
  }

  /**
   * @name getItemDisplay
   * @param item
   * @param fromDropdown
   */
  public getItemDisplay(item: ITag): string {
    return item.tagName!;
  }

  /**
   * @name getItemsWithout
   * @param index
   */
  protected getItemsWithout(posToRemove: number): ITag[] {
    return this.items.filter(item => item.id !== this.items[posToRemove].id);
  }
}
