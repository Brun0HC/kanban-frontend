import { Card, CardContent, CardHeader } from "./ui/card";

import { Draggable } from "@hello-pangea/dnd";
import { ILabel } from "@/interface/label.interface";

type TaskCardComponentProps = {
  id: number;
  uuid: string;
  title: string;
  cardLabels: number[];
  labels: ILabel[];
  position: number;
};

export function TaskCardComponent({
  uuid,
  title,
  cardLabels,
  labels,
  position,
}: TaskCardComponentProps) {
  const ls = labels.filter((label) => cardLabels.includes(label.id));

  return (
    <Draggable key={uuid} draggableId={String(uuid)} index={position}>
      {(provided) => (
        <Card
          title={title}
          className="py-2 px-3 space-y-2 w-full !bg-zinc-900"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {ls.length > 0 && (
            <CardHeader className="p-0 ">
              <div className="flex flex-row flex-wrap gap-2">
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
            </CardHeader>
          )}
          <CardContent className="p-0 ">
            <h4 className="text-base font-semibold cursor-text">{title}</h4>
          </CardContent>
          {/* <CardFooter className="p-0"></CardFooter> */}
        </Card>
      )}
    </Draggable>
  );
}
