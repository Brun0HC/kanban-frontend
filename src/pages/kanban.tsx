import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColumnComponent } from "@/components/column";
import { ICard } from "@/interface/card.interface";
import { IColumn } from "@/interface/column.interface";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { TaskCardComponent } from "@/components/task";
import { TaskDialog } from "@/components/dialogs/task-dialog";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { useFilterCardsKanban } from "@/contexts/filters.context";
import { useForm } from "react-hook-form";
import { useKanbanContext } from "@/contexts/kanban.context";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function KanbanPage() {
  const { filterCardsKanban } = useFilterCardsKanban();
  const { kanban, columns, labels, updateColumns } = useKanbanContext();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id;

  const [selectedCard, setSelectedCard] = useState<ICard>();

  const cards = columns
    .flatMap((column) => column.cards)
    .flat()
    .filter((card) => {
      if (filterCardsKanban.label.length === 0 && filterCardsKanban.name === "")
        return card;

      if (filterCardsKanban.label.length > 0)
        return card.labels.some((label) =>
          filterCardsKanban.label.includes(label)
        );

      if (filterCardsKanban.name !== "")
        return card.title
          .toLocaleLowerCase()
          .includes(filterCardsKanban.name.toLocaleLowerCase());

      return null;
    });

  const mutitonUpdateCard = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (card: ICard) => {
      await api.patch(`/kanban/card/${card.id}`, {
        title: card.title,
        textDescription: card.textDescription,
        column: card.column.id,
        position: card.position,
      });
    },
  });

  const mutationUpdateColumn = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: Partial<IColumn> & { id: number }) => {
      await api.patch(`/kanban/column/${data.id}`, {
        position: data.position,
      });
    },
  });

  useEffect(() => {
    if (!selectedCard) return;

    const cards =
      columns.flatMap((column) => column.cards.flatMap((card) => card.id)) ||
      [];
    if (!cards.includes(selectedCard.id)) {
      setSelectedCard(undefined);
    } else {
      setSelectedCard(
        columns
          .flatMap((column) => column.cards)
          .find((card) => card.id === selectedCard.id)
      );
    }
  }, [columns, selectedCard]);

  useEffect(() => {}, [filterCardsKanban]);

  if (!id) return null;

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const { destination: des, source: src, type } = result;

    if (des.droppableId === src.droppableId && des.index === src.index) return;

    if (type === "column") {
      let newColumns: IColumn[] = [...columns];

      const column = newColumns.find(
        (column) => column.uuid === result.draggableId
      );

      if (!column) {
        console.error("Column not found");
        return;
      }

      newColumns = newColumns.filter(
        (column) => column.uuid !== result.draggableId
      );

      newColumns = newColumns.map((c, i) => {
        return { ...c, position: i };
      });

      newColumns = newColumns.map((c) => {
        if (c.position >= des.index) return { ...c, position: c.position + 1 };
        return c;
      });

      newColumns.push({ ...column, position: des.index });

      newColumns = newColumns.sort((a, b) => a.position - b.position);
      const c = newColumns.find((c) => c.id === column.id);
      if (c) mutationUpdateColumn.mutate({ id: c.id, position: c.position });

      updateColumns(newColumns);
    }

    if (type === "card") {
      const newColumns = [...columns];

      const sourceColumn = newColumns.find(
        (column) => column.uuid === src.droppableId
      );

      if (!sourceColumn) {
        console.error("Source column not found");
        return;
      }

      const destinationColumn = newColumns.find(
        (column) => column.uuid === des?.droppableId
      );

      if (!destinationColumn) {
        console.error("Destination column not found");
        return;
      }

      const card = sourceColumn?.cards.find(
        (card) => card.uuid === result.draggableId
      );

      if (!card) {
        console.error("Card not found");
        return;
      }

      if (sourceColumn.uuid === destinationColumn.uuid) {
        const newCards = sourceColumn.cards.map((c) => {
          if (c.uuid === card.uuid) return { ...c, position: des.index };
          if (c.position >= des.index && c.position < src.index)
            return { ...c, position: c.position + 1 };
          if (c.position <= des.index && c.position > src.index)
            return { ...c, position: c.position - 1 };

          return c;
        });
        sourceColumn.cards = newCards.sort((a, b) => a.position - b.position);

        const c = destinationColumn.cards.find((c) => c.uuid === card.uuid);
        if (c) mutitonUpdateCard.mutate(c);
      } else if (sourceColumn.uuid !== destinationColumn.uuid) {
        sourceColumn.cards = sourceColumn.cards.filter(
          (c) => c.uuid !== card.uuid
        );
        sourceColumn.cards = sourceColumn.cards.map((c, i) => ({
          ...c,
          position: i,
        }));

        destinationColumn.cards = destinationColumn.cards.map((c) => {
          if (c.position >= des.index)
            return { ...c, position: c.position + 1 };

          return c;
        });

        destinationColumn.cards.push({
          ...card,
          position: des.index,
          column: { id: destinationColumn.id },
        });
        destinationColumn.cards = destinationColumn.cards.sort(
          (a, b) => a.position - b.position
        );

        destinationColumn.cards = destinationColumn.cards.map((c, index) => ({
          ...c,
          position: index,
        }));

        const c = destinationColumn.cards.find((c) => c.uuid === card.uuid);
        if (c) mutitonUpdateCard.mutate(c);
      }

      updateColumns(newColumns);
    }
  }

  return (
    <div className="relative z-10 h-full overflow-hidden w-full">
      <img
        src={kanban?.imagem}
        className="absolute top-0 aspect-video object-cover h-screen -z-10 w-screen brightness-[.45]"
      />

      <DragDropContext enableDefaultSensors onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal" type="column">
          {(provided, droppableSnaphost) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full flex-row gap-4 w-min p-4 max-w-full overflow-hidden overflow-x-auto relative z-10"
            >
              <TaskDialog
                card={selectedCard}
                labels={labels || []}
                onClose={() => setSelectedCard(undefined)}
              />
              {columns.map((column) => {
                if (!column) return null;
                return (
                  <Draggable
                    key={column.uuid}
                    draggableId={column.uuid}
                    index={column.position}
                  >
                    {(provided) => (
                      <div
                        className=""
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ColumnComponent
                          key={column.uuid}
                          id={column.id}
                          uuid={column.uuid}
                          title={column.name}
                          position={column.position}
                        >
                          <>
                            {column.cards.map((card) => {
                              if (!card) return null;
                              if (!cards.includes(card)) return null;

                              return (
                                <div
                                  key={card.uuid}
                                  onClick={() => setSelectedCard(card)}
                                >
                                  <TaskCardComponent
                                    id={card.id}
                                    uuid={card.uuid}
                                    title={card.title}
                                    labels={labels || []}
                                    cardLabels={card.labels}
                                    position={card.position}
                                  />
                                </div>
                              );
                            })}
                          </>
                        </ColumnComponent>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              <div
                className={cn(droppableSnaphost.isDraggingOver && "invisible")}
              >
                <CreateNewColumnComponent />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

const schema = z.object({
  name: z.string().min(3, "Column must be at least 3 characters"),
});

function CreateNewColumnComponent() {
  const { kanban } = useKanbanContext();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const [create, setCreate] = useState<boolean>(false);

  const mutation = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: z.infer<typeof schema>) => {
      await api.post("kanban/column", {
        uuid: faker.string.uuid(),
        name: data.name,
        idKanban: kanban?.id,
      });
    },
  });

  async function handleSubmit(data: z.infer<typeof schema>) {
    mutation.mutate(data);
    form.reset();
    setCreate(false);
  }

  useEffect(() => {
    function pressEspaceKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();

      form.reset();
      setCreate(false);
    }

    document.addEventListener("keydown", pressEspaceKey);
    return () => document.removeEventListener("keydown", pressEspaceKey);
  }, [form]);

  useEffect(() => {
    if (create) form.setFocus("name");
  }, [create, form]);

  return (
    <Card className="border h-min rounded-md w-72 py-2 px-4">
      {create && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Column name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              className="w-full"
              type="submit"
            >
              Create
            </Button>
            <Button
              disabled={form.formState.isSubmitting}
              onClick={() => setCreate(false)}
              variant="destructive"
              className="w-full"
              type="button"
            >
              Cancel
            </Button>
          </form>
        </Form>
      )}
      {!create && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCreate(true)}
        >
          <Plus className="size-4" />
          Create new column
        </Button>
      )}
    </Card>
  );
}
