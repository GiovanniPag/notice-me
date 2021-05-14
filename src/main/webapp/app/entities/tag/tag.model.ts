import { IUser } from 'app/entities/user/user.model';
import { INote } from 'app/entities/note/note.model';

export interface ITag {
  id?: number;
  tagName?: string;
  owner?: IUser;
  entries?: INote[] | null;
}

export class Tag implements ITag {
  constructor(public id?: number, public tagName?: string, public owner?: IUser, public entries?: INote[] | null) {}
}

export function getTagIdentifier(tag: ITag): number | undefined {
  return tag.id;
}
