import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HighlightPipe } from './core/pipes/highlight.pipe';
import { DragProvider } from './core/providers/drag-provider';
import { OptionsProvider, Options } from './core/providers/options-provider';
import { TagInputComponent } from './components/tag-input/tag-input.component';
import { DeleteIconComponent } from './components/icon/icon';
import { TagComponent } from './components/tag/tag.component';
import { TagChipsFormComponent } from './components/tag-chips-form/tag-chips-form.component';
import { TagInputDropdown } from './components/dropdown/tag-input-dropdown.component';
import { TagRipple } from './components/tag/tag-ripple.component';
import { TranslateModule } from '@ngx-translate/core';

const optionsProvider = new OptionsProvider();

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  declarations: [TagInputComponent, DeleteIconComponent, TagChipsFormComponent, TagComponent, HighlightPipe, TagInputDropdown, TagRipple],
  exports: [TagInputComponent, DeleteIconComponent, TagChipsFormComponent, TagComponent, HighlightPipe, TagInputDropdown, TagRipple],
  providers: [DragProvider, { provide: COMPOSITION_BUFFER_MODE, useValue: false }],
})
export class TagInputModule {
  /**
   * @name withDefaults
   * @param options {Options}
   */
  public static withDefaults(options: Options): void {
    optionsProvider.setOptions(options);
  }
}
