import { createContext, useContext, useEffect, useState } from "react";

import { IColumn } from "@/interface/column.interface";
import { IKanban } from "@/interface/kanban.interace";
import { ILabel } from "@/interface/label.interface";
import { Outlet } from "react-router-dom";
import { api } from "@/services/api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type ILabelResponse = {
  id: number;
  text: string;
  color: string;
};

type IKanbanReponse = {
  id: number;
  name: string;
  imagem: string;
  idMemberCreator: number;
  memberCreator: string;
  emailCreator: string;
  memberRole: { role: string }[];
  labels: ILabelResponse[];
};

type ICardLabelResponse = {
  label__id: number;
  label__text: string;
  label__color: string;
};

type ICardCommentResponse = {
  id: number;
  text: string;
  idMember_id: number;
  idCard_id: number;
  createdAt: string;
};

type ICardMemberResponse = {
  member__id: number;
  member__name: string;
  member__email: string;
};

type ICardResponse = {
  id: number;
  uuid: string;
  title: string;
  position: number;
  textDescription: string;
  creator: number;
  creator_email: string;
  labels: ICardLabelResponse[];
  members: ICardMemberResponse[];
  comments: ICardCommentResponse[];
};

type IColumnReponse = {
  id: number;
  uuid: string;
  name: string;
  idKanban: number;
  position: number;
  items: ICardResponse[];
};

export type IReponse = {
  kanban: IKanbanReponse;
  columns: IColumnReponse[];
};

type TKanbanContext = {
  columns: IColumn[];
  kanban?: IKanban;
  labels: ILabel[];
  updateColumns: React.Dispatch<React.SetStateAction<IColumn[]>>;
};

const KanbanContext = createContext<TKanbanContext | undefined>(undefined);

export function KanbanContextProvider() {
  const params = useParams();
  const [columns, setColumns] = useState<IColumn[]>([]);
  const { id } = params;

  const { data } = useQuery({
    enabled: !!id,
    queryKey: ["kanban", id],
    // refetchInterval: 5000,

    queryFn: async () => {
      const { data } = await api.get<IReponse>(`/kanban/kanban/${id}`);

      const kanban: IKanban = {
        id: data.kanban.id,
        idMemberCreator: { id: data.kanban.idMemberCreator },
        imagem: data.kanban.imagem,
        name: data.kanban.name,
      };

      const columns: IColumn[] = data.columns.map((col) => ({
        id: col.id,
        uuid: col.uuid,
        name: col.name,
        idKanban: { id: col.idKanban },
        position: col.position,
        cards: col.items.map((card) => ({
          id: card.id,
          uuid: card.uuid,
          title: card.title,
          position: card.position,
          textDescription: card.textDescription,
          column: { id: col.id },
          labels: card.labels.map((label) => label.label__id),
          comments: card.comments.map((comment) => ({
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            idMember: { id: comment.idMember_id },
            idCard: { id: comment.idCard_id },
          })),
          idMemberCreator: { id: card.creator },
        })),
      }));

      const labels: ILabel[] = data.kanban.labels.map((label) => ({
        idKanban: { id: data.kanban.id },
        id: label.id,
        text: label.text,
        color: label.color,
      }));

      return {
        kanban: kanban,
        columns: columns,
        labels: labels,
      };
    },
  });

  useEffect(() => {
    if (data?.columns) setColumns(data.columns);
  }, [data?.columns]);

  return (
    <KanbanContext.Provider
      value={{
        columns: columns || [],
        kanban: data?.kanban,
        labels: data?.labels || [],
        updateColumns: setColumns,
      }}
    >
      <Outlet />
    </KanbanContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKanbanContext() {
  const context = useContext(KanbanContext);

  if (!context) {
    throw new Error("useKanbanContext must be used within an KanbanContext");
  }

  return context;
}
