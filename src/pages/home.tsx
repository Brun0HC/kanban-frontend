import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEffect, useRef, useState } from "react";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CreateKanbanDialog } from "@/components/dialogs/create-kanban-dialog";
import { IKanban } from "@/interface/kanban.interace";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";

type IKanbanResponse = {
  id: number;
  name: string;
  imagem: string;
  idMemberCreator: number;
  memberCreator: string;
  emailCreator: string;
};

type IResponse = {
  kanbans: IKanbanResponse[];
};

export function HomePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const buttonEditKanbanRef = useRef<HTMLButtonElement>(null);

  const isMutatingCreateOrUpdateKanban = useIsMutating({
    mutationKey: ["createOrUpdateKanban"],
  });

  const [editKanban, setEditKanban] = useState<IKanban>();

  const { data } = useQuery({
    initialData: [],
    queryKey: ["kanbans"],
    queryFn: async () => {
      const { data } = await api.get<IResponse>("/kanban/kanban");
      return data.kanbans;
    },
  });

  const deleteKanbanMutation = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanbans"] });
    },
    mutationFn: async (id: number) => {
      await api.delete(`/kanban/kanban/${id}`);
    },
  });

  useEffect(() => {
    if (editKanban) buttonEditKanbanRef.current?.click();
  }, [editKanban]);

  useEffect(() => {
    if (isMutatingCreateOrUpdateKanban === 1) setEditKanban(undefined);
  }, [isMutatingCreateOrUpdateKanban]);

  return (
    <section className="w-full h-[92vh]">
      <CreateKanbanDialog kanban={editKanban}>
        <Button ref={buttonEditKanbanRef} className="hidden" />
      </CreateKanbanDialog>

      <div className="px-6 flex flex-row flex-wrap py-8 gap-4">
        {data.map((kanban) => (
          <ContextMenu key={kanban.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => navigate(`/board/${kanban.id}`)}
                className="relative size-72 aspect-square overflow-hidden grid place-items-center cursor-pointer"
              >
                <h1 className="z-10 text-4xl font-bold">{kanban.name}</h1>
                <img
                  key={kanban.id}
                  src={kanban.imagem}
                  className="aspect-square w-full absolute top-0 right-0 rounded-md brightness-[0.25]"
                />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setEditKanban({
                    id: kanban.id,
                    name: kanban.name,
                    imagem: kanban.imagem,
                    idMemberCreator: { id: kanban.idMemberCreator },
                  });
                }}
              >
                Edit
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["kanban", String(kanban.id)],
                  });
                  deleteKanbanMutation.mutate(kanban.id);
                }}
                className="bg-red-500"
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </section>
  );
}
