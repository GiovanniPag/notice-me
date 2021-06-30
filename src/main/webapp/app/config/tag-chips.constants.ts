import { Observable } from 'rxjs';
import { ValidatorFn } from '@angular/forms';

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

export const KEY_PRESS_ACTIONS: { [key: string]: string } = {
  Backspace: ACTIONS_KEYS.DELETE,
  Delete: ACTIONS_KEYS.DELETE,
  ArrowLeft: ACTIONS_KEYS.SWITCH_PREV,
  ArrowRight: ACTIONS_KEYS.SWITCH_NEXT,
  Tab: ACTIONS_KEYS.TAB,
};

export const NEXT = 'NEXT';
export const PREV = 'PREV';

export interface TagInputOptions {
  separatorKeyCodes: string[];
  placeholder: string;
  secondaryPlaceholder: string;
  validators: ValidatorFn[];
  errorMessages: { [key: string]: { msg: string; translateValues?: { [key: string]: unknown } } };
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
    errorMessages: {
      maxlength: { msg: 'entity.validation.maxlength', translateValues: { max: 50 } },
      minlength: { msg: 'entity.validation.minlength', translateValues: { min: 1 } },
    },
    theme: APP_THEME,
    inputId: null,
    inputClass: '',
    disable: false,
    onRemoving: undefined,
    onAdding: undefined,
  },
};
