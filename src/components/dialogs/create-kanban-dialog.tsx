import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { IKanban } from "@/interface/kanban.interace";
import { Input } from "../ui/input";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(3, "Name is too short"),
  image: z.string(),
});

type CreateKanbanDialogProps = {
  kanban?: IKanban;
  children: ReactNode;
};

export function CreateKanbanDialog({
  children,
  kanban,
}: CreateKanbanDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const inputDialogCloseRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: kanban?.name || "",
      image: kanban?.image || "",
    },
  });

  const mutationCreateKanban = useMutation({
    mutationKey: ["createOrUpdateKanban"],
    onSuccess: () => {
      if (kanban?.id)
        queryClient.invalidateQueries({ queryKey: ["kanban", kanban.id] });

      queryClient.invalidateQueries({ queryKey: ["kanbans"] });
    },
    mutationFn: async (data: { name: string; image: string }) => {
      if (!kanban?.id) await api.post("/kanban/kanban", data);
      else if (kanban?.id) await api.patch(`kanban/kanban/${kanban.id}/update`);
    },
  });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    mutationCreateKanban.mutate(data);
    form.reset();
    inputDialogCloseRef.current?.click();

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  useEffect(() => {
    if (kanban) {
      form.setValue("name", kanban.name || "");
      form.setValue("image", kanban.image || "");
    }
  }, [form, kanban]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="text-zinc-50">
        <DialogHeader>
          <DialogTitle>{kanban ? "Update" : "Create"} Kanban</DialogTitle>
          <DialogDescription>
            {kanban ? "Update" : "Create a new"} kanban board to organize your
            tasks.
          </DialogDescription>

          <DialogClose ref={inputDialogCloseRef} />
        </DialogHeader>

        <div className="">
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="Enter name kanban"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter link image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit">
                {kanban ? "Update" : "Create"} Kanban
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
