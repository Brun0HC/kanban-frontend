import { IKanban } from "./kanban.interace";

export interface ILabel {
  id: number;
  text: string;
  color: string;
  idKanban: Pick<IKanban, "id">;
}
