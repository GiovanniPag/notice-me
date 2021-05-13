import { INote } from 'app/shared/model/note.model';

export interface ITag {
  id?: number;
  tagName?: string;
  ownerId?: number;
  entries?: INote[];
}

export class Tag implements ITag {
  constructor(public id?: number, public tagName?: string, public ownerId?: number, public entries?: INote[]) {}
}
