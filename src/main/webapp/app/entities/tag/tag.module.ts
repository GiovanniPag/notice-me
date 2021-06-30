import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { TagComponent } from './list/tag.component';
import { TagDetailComponent } from './detail/tag-detail.component';
import { TagUpdateComponent } from './update/tag-update.component';
import { TagDeleteDialogComponent } from './delete/tag-delete-dialog.component';
import { TagRoutingModule } from './route/tag-routing.module';
// tag-chips
import { OptionsProvider, Options } from 'app/core/tag/options-provider';
import { TagInputComponent } from './tag-chips/tag-input/tag-input.component';
import { TagComponent as TagChipsComponent } from './tag-chips/tag/tag.component';
import { TagChipsFormComponent } from './tag-chips/tag-chips-form/tag-chips-form.component';

const optionsProvider = new OptionsProvider();

@NgModule({
  imports: [SharedModule, TagRoutingModule],
  declarations: [
    TagComponent,
    TagDetailComponent,
    TagUpdateComponent,
    TagDeleteDialogComponent,
    TagInputComponent,
    TagChipsFormComponent,
    TagChipsComponent,
  ],
  exports: [TagInputComponent],
  entryComponents: [TagDeleteDialogComponent],
})
export class TagModule {
  /**
   * @name withDefaults
   * @param options {Options}
   */
  public static withDefaults(options: Options): void {
    optionsProvider.setOptions(options);
  }
}
