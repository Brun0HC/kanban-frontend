import { IMember } from "./member.interface";

export interface IKanban {
  id: number;
  name: string;
  image: string;
  idMemberCreator: Pick<IMember, "id">;
}
