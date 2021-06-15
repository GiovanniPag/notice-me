import { INote } from 'app/entities/note/note.model';

export interface IAttachment {
  id?: number;
  dataContentType?: string;
  data?: string;
  note?: INote | null;
}

export class Attachment implements IAttachment {
  constructor(public id?: number, public dataContentType?: string, public data?: string, public note?: INote | null) {}
}

export function getAttachmentIdentifier(attachment: IAttachment): number | undefined {
  return attachment.id;
}
