import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JhiDataUtils } from 'ng-jhipster';

import { NoticeMeTestModule } from '../../../test.module';
import { NoteDetailComponent } from 'app/entities/note/note-detail.component';
import { Note } from 'app/shared/model/note.model';

describe('Component Tests', () => {
  describe('Note Management Detail Component', () => {
    let comp: NoteDetailComponent;
    let fixture: ComponentFixture<NoteDetailComponent>;
    let dataUtils: JhiDataUtils;
    const route = ({ data: of({ note: new Note(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [NoticeMeTestModule],
        declarations: [NoteDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }],
      })
        .overrideTemplate(NoteDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(NoteDetailComponent);
      comp = fixture.componentInstance;
      dataUtils = fixture.debugElement.injector.get(JhiDataUtils);
    });

    describe('OnInit', () => {
      it('Should load note on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.note).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });

    describe('byteSize', () => {
      it('Should call byteSize from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'byteSize');
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.byteSize(fakeBase64);

        // THEN
        expect(dataUtils.byteSize).toBeCalledWith(fakeBase64);
      });
    });

    describe('openFile', () => {
      it('Should call openFile from JhiDataUtils', () => {
        // GIVEN
        spyOn(dataUtils, 'openFile');
        const fakeContentType = 'fake content type';
        const fakeBase64 = 'fake base64';

        // WHEN
        comp.openFile(fakeContentType, fakeBase64);

        // THEN
        expect(dataUtils.openFile).toBeCalledWith(fakeContentType, fakeBase64);
      });
    });
  });
});
