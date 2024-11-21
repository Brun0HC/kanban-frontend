import { ICard } from "./card.interface";
import { IMember } from "./member.interface";

export interface IComment {
  id: number;
  text: string;
  idMember: Pick<IMember, "id">;
  idCard: Pick<ICard, "id">;
  createdAt: string;
}
