import { IMember } from "./member.interface";

export interface IKanban {
  id: number;
  name: string;
  imagem: string;
  idMemberCreator: Pick<IMember, "id">;
}
