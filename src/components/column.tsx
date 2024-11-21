import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Ellipsis, Pencil, Plus } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "./ui/button";
import { CreateTaskDialog } from "./dialogs/create-task-dialog";
import { Droppable } from "@hello-pangea/dnd";
import { api } from "@/services/api";
import { useKanbanContext } from "@/contexts/kanban.context";

type ColumnComponentProps = {
  id: number;
  uuid: string;
  title: string;
  position: number;
  children?: ReactNode;
};

export function ColumnComponent({
  id,
  uuid,
  title,
  children,
}: ColumnComponentProps) {
  const { kanban } = useKanbanContext();
  const queryClient = useQueryClient();
  const buttonCreateCardRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLHeadingElement>(null);

  const mutationDeleteColumn = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async () => {
      await api.delete(`/kanban/column/${id}`);
    },
  });

  const mutationUpdateColumn = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: { id: number; name: string }) => {
      await api.patch(`/kanban/column/${data.id}`, data);
    },
  });

  useEffect(() => {
    function keyEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();

      if (
        titleInputRef.current &&
        titleInputRef.current.contentEditable === "true"
      )
        titleInputRef.current.contentEditable = "false";
    }

    document.addEventListener("keydown", keyEsc);
    return () => document.removeEventListener("keydown", keyEsc);
  }, []);

  return (
    <Card className="max-h-[90vh] h-min py-2 p-0 w-72 group">
      <CardHeader className="flex flex-row items-center p-0 justify-center px-3 gap-2 py-1">
        <div
          ref={titleInputRef}
          // contentEditable
          suppressContentEditableWarning
          // onClick={(e) => {
          //   e.currentTarget.contentEditable = "true";
          //   e.currentTarget.focus();
          // }}
          onBlur={(e) => {
            e.currentTarget.contentEditable = "false";
            if (!e.currentTarget.textContent) return;
            if (e.currentTarget.textContent === title) return;

            mutationUpdateColumn.mutate({
              id,
              name: e.currentTarget.textContent,
            });
          }}
          className="text-zinc-50 text-start text-lg font-semibold w-full px-4"
        >
          {title}
        </div>
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              if (titleInputRef.current) {
                titleInputRef.current.contentEditable = "true";
                titleInputRef.current.focus();
              }
            }}
            variant="ghost"
            className="p-0 size-6 aspect-square "
          >
            <Pencil className="size-4 cursor-pointer" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="p-0 size-6 aspect-square " variant="ghost">
                <Ellipsis className="size-4 cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  if (buttonCreateCardRef.current) {
                    buttonCreateCardRef.current.click();
                  }
                }}
              >
                Create Card
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => mutationDeleteColumn.mutate()}
                className="bg-red-500 hover:bg-red-700"
              >
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <div className="h-px w-full bg-zinc-50/10" />

      <CardContent className="w-full p-0 overflow-y-auto max-h-[78vh]">
        <Droppable key={uuid} droppableId={String(uuid)} type="card">
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className="p-2 space-y-2"
            >
              {children}

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>

      <CardFooter className="px-2 py-2 mt-auto">
        <CreateTaskDialog column={id}>
          <Button
            ref={buttonCreateCardRef}
            size="sm"
            variant="ghost"
            className="w-full text-start mt-auto"
          >
            <span className="w-full text-start flex flex-row items-center gap-2">
              <Plus className="size-4" />
              Add Card
            </span>
          </Button>
        </CreateTaskDialog>
      </CardFooter>
    </Card>
  );
}
