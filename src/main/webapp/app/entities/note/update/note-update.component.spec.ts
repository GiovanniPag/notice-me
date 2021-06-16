jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { NoteService } from '../service/note.service';
import { INote, Note } from '../note.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';

import { NoteUpdateComponent } from './note-update.component';

describe('Component Tests', () => {
  describe('Note Management Update Component', () => {
    let comp: NoteUpdateComponent;
    let fixture: ComponentFixture<NoteUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let noteService: NoteService;
    let userService: UserService;
    let tagService: TagService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [NoteUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(NoteUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(NoteUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      noteService = TestBed.inject(NoteService);
      userService = TestBed.inject(UserService);
      tagService = TestBed.inject(TagService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call User query and add missing value', () => {
        const note: INote = { id: 456 };
        const owner: IUser = { id: 13820 };
        note.owner = owner;
        const collaborators: IUser[] = [{ id: 8136 }];
        note.collaborators = collaborators;

        const userCollection: IUser[] = [{ id: 62330 }];
        spyOn(userService, 'query').and.returnValue(of(new HttpResponse({ body: userCollection })));
        const additionalUsers = [owner, ...collaborators];
        const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
        spyOn(userService, 'addUserToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ note });
        comp.ngOnInit();

        expect(userService.query).toHaveBeenCalled();
        expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(userCollection, ...additionalUsers);
        expect(comp.usersSharedCollection).toEqual(expectedCollection);
      });

      it('Should call Tag query and add missing value', () => {
        const note: INote = { id: 456 };
        const tags: ITag[] = [{ id: 65912 }];
        note.tags = tags;

        const tagCollection: ITag[] = [{ id: 1485 }];
        spyOn(tagService, 'query').and.returnValue(of(new HttpResponse({ body: tagCollection })));
        const additionalTags = [...tags];
        const expectedCollection: ITag[] = [...additionalTags, ...tagCollection];
        spyOn(tagService, 'addTagToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ note });
        comp.ngOnInit();

        expect(tagService.query).toHaveBeenCalled();
        expect(tagService.addTagToCollectionIfMissing).toHaveBeenCalledWith(tagCollection, ...additionalTags);
        expect(comp.tagsSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const note: INote = { id: 456 };
        const owner: IUser = { id: 48385 };
        note.owner = owner;
        const collaborators: IUser = { id: 2487 };
        note.collaborators = [collaborators];
        const tags: ITag = { id: 77949 };
        note.tags = [tags];

        activatedRoute.data = of({ note });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(note));
        expect(comp.usersSharedCollection).toContain(owner);
        expect(comp.usersSharedCollection).toContain(collaborators);
        expect(comp.tagsSharedCollection).toContain(tags);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const note = { id: 123 };
        spyOn(noteService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ note });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: note }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(noteService.update).toHaveBeenCalledWith(note);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const note = new Note();
        spyOn(noteService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ note });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: note }));
        saveSubject.complete();

        // THEN
        expect(noteService.create).toHaveBeenCalledWith(note);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const note = { id: 123 };
        spyOn(noteService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ note });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(noteService.update).toHaveBeenCalledWith(note);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackUserById', () => {
        it('Should return tracked User primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackUserById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });

      describe('trackTagById', () => {
        it('Should return tracked Tag primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackTagById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });

    describe('Getting selected relationships', () => {
      describe('getSelectedUser', () => {
        it('Should return option if no User is selected', () => {
          const option = { id: 123 };
          const result = comp.getSelectedUser(option);
          expect(result === option).toEqual(true);
        });

        it('Should return selected User for according option', () => {
          const option = { id: 123 };
          const selected = { id: 123 };
          const selected2 = { id: 456 };
          const result = comp.getSelectedUser(option, [selected2, selected]);
          expect(result === selected).toEqual(true);
          expect(result === selected2).toEqual(false);
          expect(result === option).toEqual(false);
        });

        it('Should return option if this User is not selected', () => {
          const option = { id: 123 };
          const selected = { id: 456 };
          const result = comp.getSelectedUser(option, [selected]);
          expect(result === option).toEqual(true);
          expect(result === selected).toEqual(false);
        });
      });

      describe('getSelectedTag', () => {
        it('Should return option if no Tag is selected', () => {
          const option = { id: 123 };
          const result = comp.getSelectedTag(option);
          expect(result === option).toEqual(true);
        });

        it('Should return selected Tag for according option', () => {
          const option = { id: 123 };
          const selected = { id: 123 };
          const selected2 = { id: 456 };
          const result = comp.getSelectedTag(option, [selected2, selected]);
          expect(result === selected).toEqual(true);
          expect(result === selected2).toEqual(false);
          expect(result === option).toEqual(false);
        });

        it('Should return option if this Tag is not selected', () => {
          const option = { id: 123 };
          const selected = { id: 456 };
          const result = comp.getSelectedTag(option, [selected]);
          expect(result === option).toEqual(true);
          expect(result === selected).toEqual(false);
        });
      });
    });
  });
});
