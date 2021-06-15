import { element, by, ElementFinder } from 'protractor';

export class AttachmentComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-attachment div table .btn-danger'));
  title = element.all(by.css('jhi-attachment div h2#page-heading span')).first();
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

export class AttachmentUpdatePage {
  pageTitle = element(by.id('jhi-attachment-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));

  idInput = element(by.id('field_id'));
  dataInput = element(by.id('file_data'));

  noteSelect = element(by.id('field_note'));

  async getPageTitle(): Promise<string> {
    return this.pageTitle.getAttribute('jhiTranslate');
  }

  async setIdInput(id: string): Promise<void> {
    await this.idInput.sendKeys(id);
  }

  async getIdInput(): Promise<string> {
    return await this.idInput.getAttribute('value');
  }

  async setDataInput(data: string): Promise<void> {
    await this.dataInput.sendKeys(data);
  }

  async getDataInput(): Promise<string> {
    return await this.dataInput.getAttribute('value');
  }

  async noteSelectLastOption(): Promise<void> {
    await this.noteSelect.all(by.tagName('option')).last().click();
  }

  async noteSelectOption(option: string): Promise<void> {
    await this.noteSelect.sendKeys(option);
  }

  getNoteSelect(): ElementFinder {
    return this.noteSelect;
  }

  async getNoteSelectedOption(): Promise<string> {
    return await this.noteSelect.element(by.css('option:checked')).getText();
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

export class AttachmentDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-attachment-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-attachment'));

  async getDialogTitle(): Promise<string> {
    return this.dialogTitle.getAttribute('jhiTranslate');
  }

  async clickOnConfirmButton(): Promise<void> {
    await this.confirmButton.click();
  }
}
