import { Format } from 'app/shared/model/enumerations/format.model';

export interface IAttachment {
  id?: number;
  dataContentType?: string;
  data?: any;
  format?: Format;
  noteId?: number;
}

export class Attachment implements IAttachment {
  constructor(public id?: number, public dataContentType?: string, public data?: any, public format?: Format, public noteId?: number) {}
}
