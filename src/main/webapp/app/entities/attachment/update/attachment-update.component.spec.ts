jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { AttachmentService } from '../service/attachment.service';
import { IAttachment, Attachment } from '../attachment.model';
import { INote } from 'app/entities/note/note.model';
import { NoteService } from 'app/entities/note/service/note.service';

import { AttachmentUpdateComponent } from './attachment-update.component';

describe('Component Tests', () => {
  describe('Attachment Management Update Component', () => {
    let comp: AttachmentUpdateComponent;
    let fixture: ComponentFixture<AttachmentUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let attachmentService: AttachmentService;
    let noteService: NoteService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [AttachmentUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(AttachmentUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(AttachmentUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      attachmentService = TestBed.inject(AttachmentService);
      noteService = TestBed.inject(NoteService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call Note query and add missing value', () => {
        const attachment: IAttachment = { id: 456 };
        const note: INote = { id: 45016 };
        attachment.note = note;

        const noteCollection: INote[] = [{ id: 97238 }];
        spyOn(noteService, 'query').and.returnValue(of(new HttpResponse({ body: noteCollection })));
        const additionalNotes = [note];
        const expectedCollection: INote[] = [...additionalNotes, ...noteCollection];
        spyOn(noteService, 'addNoteToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ attachment });
        comp.ngOnInit();

        expect(noteService.query).toHaveBeenCalled();
        expect(noteService.addNoteToCollectionIfMissing).toHaveBeenCalledWith(noteCollection, ...additionalNotes);
        expect(comp.notesSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const attachment: IAttachment = { id: 456 };
        const note: INote = { id: 60929 };
        attachment.note = note;

        activatedRoute.data = of({ attachment });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(attachment));
        expect(comp.notesSharedCollection).toContain(note);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const attachment = { id: 123 };
        spyOn(attachmentService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ attachment });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: attachment }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(attachmentService.update).toHaveBeenCalledWith(attachment);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const attachment = new Attachment();
        spyOn(attachmentService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ attachment });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: attachment }));
        saveSubject.complete();

        // THEN
        expect(attachmentService.create).toHaveBeenCalledWith(attachment);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const attachment = { id: 123 };
        spyOn(attachmentService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ attachment });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(attachmentService.update).toHaveBeenCalledWith(attachment);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackNoteById', () => {
        it('Should return tracked Note primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackNoteById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });
  });
});
