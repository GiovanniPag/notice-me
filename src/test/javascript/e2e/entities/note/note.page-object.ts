import { element, by, ElementFinder } from 'protractor';

export class NoteComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-note div table .btn-danger'));
  title = element.all(by.css('jhi-note div h2#page-heading span')).first();
  noResult = element(by.id('no-result'));
  entities = element(by.id('entities'));

  async clickOnCreateButton(): Promise<void> {
    await this.createButton.click();
  }

  async clickOnLastDeleteButton(): Promise<void> {
    await this.deleteButtons.last().click();
  }

  async countDeleteButtons(): Promise<number> {
    return this.deleteButtons.count();
  }

  async getTitle(): Promise<string> {
    return this.title.getAttribute('jhiTranslate');
  }
}

export class NoteUpdatePage {
  pageTitle = element(by.id('jhi-note-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));

  titleInput = element(by.id('field_title'));
  contentInput = element(by.id('field_content'));
  dateInput = element(by.id('field_date'));
  alarmInput = element(by.id('field_alarm'));
  statusSelect = element(by.id('field_status'));

  ownerSelect = element(by.id('field_owner'));
  tagSelect = element(by.id('field_tag'));
  collaboratorSelect = element(by.id('field_collaborator'));

  async getPageTitle(): Promise<string> {
    return this.pageTitle.getAttribute('jhiTranslate');
  }

  async setTitleInput(title: string): Promise<void> {
    await this.titleInput.sendKeys(title);
  }

  async getTitleInput(): Promise<string> {
    return await this.titleInput.getAttribute('value');
  }

  async setContentInput(content: string): Promise<void> {
    await this.contentInput.sendKeys(content);
  }

  async getContentInput(): Promise<string> {
    return await this.contentInput.getAttribute('value');
  }

  async setDateInput(date: string): Promise<void> {
    await this.dateInput.sendKeys(date);
  }

  async getDateInput(): Promise<string> {
    return await this.dateInput.getAttribute('value');
  }

  async setAlarmInput(alarm: string): Promise<void> {
    await this.alarmInput.sendKeys(alarm);
  }

  async getAlarmInput(): Promise<string> {
    return await this.alarmInput.getAttribute('value');
  }

  async setStatusSelect(status: string): Promise<void> {
    await this.statusSelect.sendKeys(status);
  }

  async getStatusSelect(): Promise<string> {
    return await this.statusSelect.element(by.css('option:checked')).getText();
  }

  async statusSelectLastOption(): Promise<void> {
    await this.statusSelect.all(by.tagName('option')).last().click();
  }

  async ownerSelectLastOption(): Promise<void> {
    await this.ownerSelect.all(by.tagName('option')).last().click();
  }

  async ownerSelectOption(option: string): Promise<void> {
    await this.ownerSelect.sendKeys(option);
  }

  getOwnerSelect(): ElementFinder {
    return this.ownerSelect;
  }

  async getOwnerSelectedOption(): Promise<string> {
    return await this.ownerSelect.element(by.css('option:checked')).getText();
  }

  async tagSelectLastOption(): Promise<void> {
    await this.tagSelect.all(by.tagName('option')).last().click();
  }

  async tagSelectOption(option: string): Promise<void> {
    await this.tagSelect.sendKeys(option);
  }

  getTagSelect(): ElementFinder {
    return this.tagSelect;
  }

  async getTagSelectedOption(): Promise<string> {
    return await this.tagSelect.element(by.css('option:checked')).getText();
  }

  async collaboratorSelectLastOption(): Promise<void> {
    await this.collaboratorSelect.all(by.tagName('option')).last().click();
  }

  async collaboratorSelectOption(option: string): Promise<void> {
    await this.collaboratorSelect.sendKeys(option);
  }

  getCollaboratorSelect(): ElementFinder {
    return this.collaboratorSelect;
  }

  async getCollaboratorSelectedOption(): Promise<string> {
    return await this.collaboratorSelect.element(by.css('option:checked')).getText();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  getSaveButton(): ElementFinder {
    return this.saveButton;
  }
}

export class NoteDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-note-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-note'));

  async getDialogTitle(): Promise<string> {
    return this.dialogTitle.getAttribute('jhiTranslate');
  }

  async clickOnConfirmButton(): Promise<void> {
    await this.confirmButton.click();
  }
}
