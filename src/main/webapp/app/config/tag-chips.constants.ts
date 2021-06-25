import { Observable } from 'rxjs';
import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';

import { ITag } from 'app/entities/tag/tag.model';

// default value constants
export const PLACEHOLDER = 'noticeMeApp.note.placeholder.tag_1';
export const SECONDARY_PLACEHOLDER = 'noticeMeApp.note.placeholder.tag_2';
export const APP_THEME = 'noticeme-theme';

// <tag-input> constants
export const KEYDOWN = 'keydown';
export const KEYUP = 'keyup';
export const FOCUS = 'focus';
export const MAX_ITEMS_WARNING = 'The number of items specified was greater than the property max-items.';

export const ACTIONS_KEYS = {
  DELETE: 'DELETE',
  SWITCH_PREV: 'SWITCH_PREV',
  SWITCH_NEXT: 'SWITCH_NEXT',
  TAB: 'TAB',
};

export const KEY_PRESS_ACTIONS = {
  8: ACTIONS_KEYS.DELETE,
  46: ACTIONS_KEYS.DELETE,
  37: ACTIONS_KEYS.SWITCH_PREV,
  39: ACTIONS_KEYS.SWITCH_NEXT,
  9: ACTIONS_KEYS.TAB,
};

export const DRAG_AND_DROP_KEY = 'Text';
export const NEXT = 'NEXT';
export const PREV = 'PREV';

export interface TagInputOptions {
  separatorKeyCodes: number[];
  placeholder: string;
  secondaryPlaceholder: string;
  validators: ValidatorFn[];
  asyncValidators: AsyncValidatorFn[];
  errorMessages: { [key: string]: string };
  theme: string;
  inputId: string | null;
  inputClass: string;
  disable: boolean;
  onRemoving?: (tag: ITag) => Observable<ITag>;
  onAdding?: (tag: ITag) => Observable<ITag>;
}

export const defaults = {
  tagInput: <TagInputOptions>{
    separatorKeyCodes: [],
    placeholder: PLACEHOLDER,
    secondaryPlaceholder: SECONDARY_PLACEHOLDER,
    validators: [],
    asyncValidators: [],
    errorMessages: {},
    theme: APP_THEME,
    inputId: null,
    inputClass: '',
    disable: false,
    onRemoving: undefined,
    onAdding: undefined,
  },
};
