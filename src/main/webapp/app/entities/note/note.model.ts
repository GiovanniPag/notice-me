import * as dayjs from 'dayjs';
import { IAttachment } from 'app/entities/attachment/attachment.model';
import { IUser } from 'app/entities/user/user.model';
import { ITag } from 'app/entities/tag/tag.model';
import { NoteStatus } from 'app/entities/enumerations/note-status.model';

export interface INote {
  id?: number;
  title?: string;
  content?: string;
  date?: dayjs.Dayjs;
  alarm?: dayjs.Dayjs | null;
  status?: NoteStatus;
  attachments?: IAttachment[] | null;
  owner?: IUser;
  tags?: ITag[] | null;
  collaborators?: IUser[] | null;
}

export class Note implements INote {
  constructor(
    public id?: number,
    public title?: string,
    public content?: string,
    public date?: dayjs.Dayjs,
    public alarm?: dayjs.Dayjs | null,
    public status?: NoteStatus,
    public attachments?: IAttachment[] | null,
    public owner?: IUser,
    public tags?: ITag[] | null,
    public collaborators?: IUser[] | null
  ) {}
}

export function getNoteIdentifier(note: INote): number | undefined {
  return note.id;
}
