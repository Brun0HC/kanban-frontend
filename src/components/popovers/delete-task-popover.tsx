import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { api } from "@/services/api";
import { useKanbanContext } from "@/contexts/kanban.context";

export function DeleteTaskPopover({ card }: { card: number }) {
  const queryClient = useQueryClient();
  const { kanban } = useKanbanContext();

  const mutationDeleteCard = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async () => {
      await api.delete(`/kanban/card/${card}`);
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full" variant="destructive">
          Delete
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onInteractOutside={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex flex-col w-full gap-2">
          <p className="pb-3 font-semibold text-lg text-center">
            Are you sure you want to delete this card?
          </p>

          <Button
            onClick={() => mutationDeleteCard.mutate()}
            variant="destructive"
          >
            Yes
          </Button>
          <Button variant="default">No</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
