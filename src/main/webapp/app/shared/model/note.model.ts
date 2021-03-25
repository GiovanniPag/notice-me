import { Moment } from 'moment';
import { IAttachment } from 'app/shared/model/attachment.model';
import { ITag } from 'app/shared/model/tag.model';
import { IUser } from 'app/core/user/user.model';
import { NoteStatus } from 'app/shared/model/enumerations/note-status.model';

export interface INote {
  id?: number;
  title?: string;
  content?: any;
  date?: Moment;
  alarm?: Moment;
  status?: NoteStatus;
  attachments?: IAttachment[];
  ownerId?: number;
  tags?: ITag[];
  collaborators?: IUser[];
}

export class Note implements INote {
  constructor(
    public id?: number,
    public title?: string,
    public content?: any,
    public date?: Moment,
    public alarm?: Moment,
    public status?: NoteStatus,
    public attachments?: IAttachment[],
    public ownerId?: number,
    public tags?: ITag[],
    public collaborators?: IUser[]
  ) {}
}
