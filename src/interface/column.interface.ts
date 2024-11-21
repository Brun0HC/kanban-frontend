import { ICard } from "./card.interface";
import { IKanban } from "./kanban.interace";

export interface IColumn {
  id: number;
  name: string;
  idKanban: Pick<IKanban, "id">;
  position: number;

  cards: ICard[];

  uuid: string;
}
