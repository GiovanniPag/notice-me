import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NoticeMeSharedLibsModule } from './shared-libs.module';
import { FindLanguageFromKeyPipe } from './language/find-language-from-key.pipe';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';
import { LoginComponent } from './login/login.component';
import { loginRoute } from './login/login.route';
import { HasAnyAuthorityDirective } from './auth/has-any-authority.directive';

@NgModule({
  imports: [NoticeMeSharedLibsModule, RouterModule.forChild([loginRoute])],
  declarations: [FindLanguageFromKeyPipe, AlertComponent, AlertErrorComponent, LoginComponent, HasAnyAuthorityDirective],
  entryComponents: [LoginComponent],
  exports: [
    NoticeMeSharedLibsModule,
    FindLanguageFromKeyPipe,
    AlertComponent,
    AlertErrorComponent,
    LoginComponent,
    HasAnyAuthorityDirective,
  ],
})
export class NoticeMeSharedModule {}
