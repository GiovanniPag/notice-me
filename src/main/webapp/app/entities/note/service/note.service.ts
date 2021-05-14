import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { INote, getNoteIdentifier } from '../note.model';

export type EntityResponseType = HttpResponse<INote>;
export type EntityArrayResponseType = HttpResponse<INote[]>;

@Injectable({ providedIn: 'root' })
export class NoteService {
  public resourceUrl = this.applicationConfigService.getEndpointFor('api/notes');

  constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(note: INote): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(note);
    return this.http
      .post<INote>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(note: INote): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(note);
    return this.http
      .put<INote>(`${this.resourceUrl}/${getNoteIdentifier(note) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(note: INote): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(note);
    return this.http
      .patch<INote>(`${this.resourceUrl}/${getNoteIdentifier(note) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<INote>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<INote[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addNoteToCollectionIfMissing(noteCollection: INote[], ...notesToCheck: (INote | null | undefined)[]): INote[] {
    const notes: INote[] = notesToCheck.filter(isPresent);
    if (notes.length > 0) {
      const noteCollectionIdentifiers = noteCollection.map(noteItem => getNoteIdentifier(noteItem)!);
      const notesToAdd = notes.filter(noteItem => {
        const noteIdentifier = getNoteIdentifier(noteItem);
        if (noteIdentifier == null || noteCollectionIdentifiers.includes(noteIdentifier)) {
          return false;
        }
        noteCollectionIdentifiers.push(noteIdentifier);
        return true;
      });
      return [...notesToAdd, ...noteCollection];
    }
    return noteCollection;
  }

  protected convertDateFromClient(note: INote): INote {
    return Object.assign({}, note, {
      date: note.date?.isValid() ? note.date.toJSON() : undefined,
      alarm: note.alarm?.isValid() ? note.alarm.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.date = res.body.date ? dayjs(res.body.date) : undefined;
      res.body.alarm = res.body.alarm ? dayjs(res.body.alarm) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((note: INote) => {
        note.date = note.date ? dayjs(note.date) : undefined;
        note.alarm = note.alarm ? dayjs(note.alarm) : undefined;
      });
    }
    return res;
  }
}
