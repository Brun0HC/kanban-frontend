import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Pencil, Trash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ILabel } from "@/interface/label.interface";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { useKanbanContext } from "@/contexts/kanban.context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type LabelPopoverProps = {
  card: number;
  cardLabels: number[];
  labels: ILabel[];
};

const schema = z.object({
  text: z.string(),
  color: z.string().default("#ffffff"),
});

export function LabelPopover({ card, labels, cardLabels }: LabelPopoverProps) {
  const { kanban } = useKanbanContext();
  const queryClient = useQueryClient();
  const [createOrUpdateLabel, setCreateOrUpdateLabel] = useState<
    boolean | number
  >(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { text: "", color: "#ffffff" },
  });

  const mutationCardLabel = useMutation({
    mutationFn: async (label: number) => {
      if (!cardLabels.includes(label)) {
        await api.post("/kanban/card/linkCardLabel", {
          id_card: card,
          id_label: label,
        });
      } else {
        await api.post("/kanban/card/unlinkCardLabel", {
          id_card: card,
          id_label: label,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      });
    },
  });

  const mutationCreateLabel = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: z.infer<typeof schema>) => {
      if (typeof createOrUpdateLabel === "number") {
        await api.patch(`/kanban/label/${createOrUpdateLabel}`, {
          ...data,
          idKanban: kanban?.id,
        });
      } else if (typeof createOrUpdateLabel === "boolean") {
        await api.post(`/kanban/label`, {
          ...data,
          idKanban: String(kanban?.id),
        });
      }
    },
  });

  useEffect(() => {
    if (
      typeof createOrUpdateLabel === "number" &&
      !labels.map((l) => l.id).includes(createOrUpdateLabel)
    ) {
      setCreateOrUpdateLabel(false);
      form.reset();
      form.setValue("color", "#ffffff");
    }
  }, [createOrUpdateLabel, form, labels]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full" variant="outline">
          Label
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <Command>
            <CommandInput placeholder="Search label" />
            <CommandList>
              <CommandEmpty>No labels found</CommandEmpty>
              {labels.map((label: ILabel) => {
                if (!labels) return null;
                return (
                  <CommandItem
                    disabled={mutationCardLabel.isPending}
                    key={label.id}
                  >
                    <div className="flex items-center flex-row gap-4 w-full">
                      <Checkbox
                        id={String(label.id)}
                        onClick={() => mutationCardLabel.mutate(label.id)}
                        checked={cardLabels.includes(label.id)}
                      />
                      <Label
                        onClick={() => mutationCardLabel.mutate(label.id)}
                        htmlFor={String(label.id)}
                        title={label.text}
                        className="w-full overflow-hidden text-ellipsis"
                      >
                        {label.text}
                      </Label>
                      <div
                        onClick={() => {
                          form.setValue("text", label.text);
                          form.setValue("color", label.color);
                          console.log(label.color);
                          setCreateOrUpdateLabel(label.id);
                        }}
                        className="hover:bg-zinc-600 cursor-pointer p-1.5 rounded-md"
                      >
                        <Pencil className="size-4 " />
                      </div>
                      <div
                        onClick={() => {
                          api.delete(
                            `/kanban/label/${label.id}/delete?kanban=${kanban?.id}`
                          );
                          queryClient.invalidateQueries({
                            queryKey: ["kanban", String(kanban?.id)],
                          });
                        }}
                        className="hover:bg-zinc-600 cursor-pointer p-1.5 rounded-md"
                      >
                        <Trash className="size-4 hover:bg-zinc-600 cursor-pointer" />
                      </div>

                      <figure
                        className="size-6 aspect-square rounded-md ml-auto"
                        style={{ backgroundColor: label.color }}
                      />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>

          {!createOrUpdateLabel && (
            <Button
              onClick={() => setCreateOrUpdateLabel(true)}
              className="w-full"
            >
              Create
            </Button>
          )}
          {createOrUpdateLabel && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  mutationCreateLabel.mutate(data);
                  form.reset();
                  form.setValue("color", "#ffffff");

                  setCreateOrUpdateLabel(false);
                  queryClient.invalidateQueries({
                    queryKey: ["kanban", String(kanban?.id)],
                  });
                })}
                className="space-y-2"
              >
                <div className="flex flex-row gap-2 items-center">
                  <FormField
                    name="text"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Label name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="color"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="grid place-items-center">
                        <FormControl className="rounded-md overflow-hidden">
                          <input className="size-8" type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button className="w-full" type="submit">
                  {typeof createOrUpdateLabel === "number"
                    ? "Update"
                    : "Create"}
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setCreateOrUpdateLabel(false);
                    form.reset();
                    form.setValue("color", "#ffffff");
                  }}
                >
                  Cancel
                </Button>
              </form>
            </Form>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
