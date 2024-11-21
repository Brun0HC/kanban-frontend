import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { Button } from "../ui/button";
import { DeleteTaskPopover } from "../popovers/delete-task-popover";
import { ICard } from "@/interface/card.interface";
import { ILabel } from "@/interface/label.interface";
import { LabelPopover } from "../popovers/label-popover";
import { Plus } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { api } from "@/services/api";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useKanbanContext } from "@/contexts/kanban.context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type TaskDialogProps = {
  labels: ILabel[];
  card?: ICard;
  onClose: () => void;
};

const schema = z.object({
  comment: z.string(),
});

export function TaskDialog({ onClose, card, labels }: TaskDialogProps) {
  const queryClient = useQueryClient();
  const { kanban } = useKanbanContext();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      comment: "",
    },
  });

  const [addComment, setAddComment] = useState<boolean>(false);
  const [updateComment, setUpdateComment] = useState<number>();

  const titleInputRef = useRef<HTMLHeadingElement>(null);
  const textDescriptionRef = useRef<HTMLDivElement>(null);

  const mutationUpdateCard = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: Partial<ICard> & { id: number }) => {
      await api.patch(`/kanban/card/${data.id}`, data);
    },
  });

  const addOrUpdateCommentMutation = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (data: z.infer<typeof schema> & { id?: number }) => {
      if (!data.id)
        await api.post(`/kanban/comment`, {
          text: data.comment,
          idCard: card?.id,
        });
      else if (data.id)
        await api.patch(
          `/kanban/comment/${data.id}/change?kanban=${kanban?.id}`,
          {
            text: data.comment,
          }
        );
    },
  });

  const deleteCommentMutation = useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["kanban", String(kanban?.id)],
      }),
    mutationFn: async (id: number) => {
      await api.delete(`/kanban/comment/${id}/change?kanban=${kanban?.id}`);
    },
  });

  const ls = labels.filter((label) => card?.labels.includes(label.id));

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className="text-zinc-50 min-w-[40vw]">
        <DialogHeader className="overflow-hidden max-w-[95%]">
          <DialogTitle
            ref={titleInputRef}
            className="overflow-hidden text-ellipsis w-full"
            suppressContentEditableWarning
            onClick={(e) => {
              e.currentTarget.contentEditable = "true";
            }}
            onBlur={(e) => {
              e.currentTarget.contentEditable = "false";
              if (e.currentTarget.textContent === card.title) return;

              mutationUpdateCard.mutate({
                id: card.id,
                title: e.currentTarget.textContent || undefined,
              });
            }}
          >
            {card.title}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex flex-row w-full">
            <div className="grid grid-cols-4 gap-4 w-full">
              <div className="col-span-3 space-y-3">
                <div className="flex flex-row gap-2 flex-wrap">
                  {ls.map((label) => (
                    <div
                      key={label.id}
                      title={label.text}
                      style={{ backgroundColor: label.color }}
                      className="min-h-5 min-w-16 rounded-md  overflow-hidden  grid place-items-center"
                    >
                      <span className="text-xs font-bold text-ellipsis texts text-zinc-50 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                        {label.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h1 className="font-semibold">Description</h1>
                  <div
                    ref={textDescriptionRef}
                    className="text-zinc-50 border rounded-md border-opacity-5 border-zinc-50 px-1.5 py-2 w-full min-h-56 max-h-72 overflow-y-auto"
                    suppressContentEditableWarning
                    contentEditable
                    onClick={(e) => {
                      e.currentTarget.contentEditable = "true";
                      e.currentTarget.focus();
                    }}
                    onBlur={(e) => {
                      e.currentTarget.contentEditable = "false";
                      if (e.target.innerText === card.textDescription) return;

                      mutationUpdateCard.mutate({
                        id: card.id,
                        textDescription: e.target.innerHTML || undefined,
                      });
                    }}
                    dangerouslySetInnerHTML={{
                      __html: card.textDescription,
                    }}
                  />
                </div>

                <div className="overflow-y-auto space-y-2">
                  <div className="flex flex-row items-center w-full">
                    <h1 className="font-semibold">Comments</h1>
                    <Button
                      size="sm"
                      className="ml-auto p-0 aspect-square"
                      variant="ghost"
                      title="Add comment"
                      onClick={() => {
                        setAddComment(true);
                        setUpdateComment(undefined);
                      }}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {card.comments.map((comment) => (
                    <div key={comment.id}>
                      {updateComment === comment.id ? (
                        <Form {...form}>
                          <form
                            className="space-y-2 w-full"
                            onSubmit={form.handleSubmit((data) => {
                              addOrUpdateCommentMutation.mutate({
                                ...data,
                                id: comment.id,
                              });
                              setUpdateComment(undefined);
                              form.reset();
                            })}
                          >
                            <FormField
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder="update a comment"
                                      className="w-full"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="space-x-2 wf">
                              <Button type="submit">Update Comment</Button>
                              <Button
                                onClick={() => {
                                  setUpdateComment(undefined);
                                  form.reset();
                                }}
                                variant="secondary"
                                type="button"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  form.reset();
                                  deleteCommentMutation.mutate(comment.id);
                                }}
                                variant="destructive"
                                type="button"
                                className="ml-auto"
                              >
                                Delete
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div
                          className="flex flex-col gap-0.5 rounded-md border border-zinc-50/5 px-2 py-1.5 text-zinc-400 text-sm"
                          onClick={() => {
                            setAddComment(false);
                            form.reset();
                            setUpdateComment(comment.id);
                            form.setValue("comment", comment.text);
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: comment.text.replace(/\n/g, "<br>"),
                            }}
                          />

                          <div className="w-full">
                            <div className="text-right text-xs text-zinc-500 font-semibold">
                              {moment(comment.createdAt).format(
                                "MMM DD, YYYY h:mm a"
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {addComment && (
                    <Form {...form}>
                      <form
                        className="space-y-2 w-full"
                        onSubmit={form.handleSubmit((data) => {
                          addOrUpdateCommentMutation.mutate(data);
                          setAddComment(false);
                          form.reset();
                        })}
                      >
                        <FormField
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a comment"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button type="submit">Add Comment</Button>
                      </form>
                    </Form>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <LabelPopover
                  card={card.id}
                  cardLabels={card.labels}
                  labels={labels}
                />
                <div className="mt-auto w-full">
                  <DeleteTaskPopover card={card.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
