import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import * as dayjs from 'dayjs';

export function MinDateValidator(minDate: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null) {
      return null;
    }
    const controlDate = dayjs(control.value, DATE_TIME_FORMAT);
    if (!controlDate.isValid()) {
      return null;
    }
    const validationDate = dayjs(minDate, DATE_TIME_FORMAT);
    return controlDate.isBefore(validationDate) ? { invalidDate: { value: control.value } } : null;
  };
}
