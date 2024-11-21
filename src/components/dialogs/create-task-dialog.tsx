import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ReactNode, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { api } from "@/services/api";
import { faker } from "@faker-js/faker";
import { useForm } from "react-hook-form";
import { useKanbanContext } from "@/contexts/kanban.context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type CreateTaskDialogProps = {
  column: number;
  children: ReactNode;
};

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  textDescription: z.string(),
});

export function CreateTaskDialog({ children, column }: CreateTaskDialogProps) {
  const queryClient = useQueryClient();
  const buttonCloseRef = useRef<HTMLButtonElement>(null);
  const { kanban } = useKanbanContext();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      textDescription: "",
    },
  });

  const mutation = useMutation({
    onSuccess: () =>
      queryClient.refetchQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: z.infer<typeof schema>) => {
      await api.post(`/kanban/card`, {
        uuid: faker.string.uuid(),
        title: data.title,
        textDescription: data.textDescription,
        column: column,
      });
    },
  });

  async function handleSubmit(data: z.infer<typeof schema>) {
    await mutation.mutateAsync(data);
    form.reset();
    buttonCloseRef.current?.click();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogClose ref={buttonCloseRef}></DialogClose>
      <DialogContent className="text-zinc-50">
        <DialogHeader>
          <DialogTitle>Create a new Task</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title*</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="textDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
