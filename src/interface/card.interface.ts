import { IColumn } from "./column.interface";
import { IComment } from "./comment.interface";
import { IMember } from "./member.interface";

export interface ICard {
  id: number;
  title: string;
  textDescription: string;
  idMemberCreator: Pick<IMember, "id">;
  column: Pick<IColumn, "id">;
  position: number;
  uuid: string;

  labels: number[];
  comments: IComment[];
}
