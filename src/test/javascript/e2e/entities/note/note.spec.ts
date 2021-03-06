import { browser, ExpectedConditions as ec /* , protractor, promise */ } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import {
  NoteComponentsPage,
  /* NoteDeleteDialog, */
  NoteUpdatePage,
} from './note.page-object';

const expect = chai.expect;

describe('Note e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let noteComponentsPage: NoteComponentsPage;
  let noteUpdatePage: NoteUpdatePage;
  /* let noteDeleteDialog: NoteDeleteDialog; */
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing(username, password);
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Notes', async () => {
    await navBarPage.goToEntity('note');
    noteComponentsPage = new NoteComponentsPage();
    await browser.wait(ec.visibilityOf(noteComponentsPage.title), 5000);
    expect(await noteComponentsPage.getTitle()).to.eq('noticeMeApp.note.home.title');
    await browser.wait(ec.or(ec.visibilityOf(noteComponentsPage.entities), ec.visibilityOf(noteComponentsPage.noResult)), 1000);
  });

  it('should load create Note page', async () => {
    await noteComponentsPage.clickOnCreateButton();
    noteUpdatePage = new NoteUpdatePage();
    expect(await noteUpdatePage.getPageTitle()).to.eq('noticeMeApp.note.home.createOrEditLabel');
    await noteUpdatePage.cancel();
  });

  /* it('should create and save Notes', async () => {
        const nbButtonsBeforeCreate = await noteComponentsPage.countDeleteButtons();

        await noteComponentsPage.clickOnCreateButton();

        await promise.all([
            noteUpdatePage.setTitleInput('title'),
            noteUpdatePage.setContentInput('content'),
            noteUpdatePage.setLastUpdateDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
            noteUpdatePage.setAlarmDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
            noteUpdatePage.statusSelectLastOption(),
            noteUpdatePage.ownerSelectLastOption(),
            // noteUpdatePage.tagSelectLastOption(),
            // noteUpdatePage.collaboratorSelectLastOption(),
        ]);

        expect(await noteUpdatePage.getTitleInput()).to.eq('title', 'Expected Title value to be equals to title');
        expect(await noteUpdatePage.getContentInput()).to.eq('content', 'Expected Content value to be equals to content');
        expect(await noteUpdatePage.getLastUpdateDateInput()).to.contain('2001-01-01T02:30', 'Expected lastUpdateDate value to be equals to 2000-12-31');
        expect(await noteUpdatePage.getAlarmDateInput()).to.contain('2001-01-01T02:30', 'Expected alarmDate value to be equals to 2000-12-31');

        await noteUpdatePage.save();
        expect(await noteUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

        expect(await noteComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
    }); */

  /* it('should delete last Note', async () => {
        const nbButtonsBeforeDelete = await noteComponentsPage.countDeleteButtons();
        await noteComponentsPage.clickOnLastDeleteButton();

        noteDeleteDialog = new NoteDeleteDialog();
        expect(await noteDeleteDialog.getDialogTitle())
            .to.eq('noticeMeApp.note.delete.question');
        await noteDeleteDialog.clickOnConfirmButton();
        await browser.wait(ec.visibilityOf(noteComponentsPage.title), 5000);

        expect(await noteComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
    }); */

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
