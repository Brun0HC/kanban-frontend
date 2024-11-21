import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateKanbanDialog } from "@/components/dialogs/create-kanban-dialog";
import { Input } from "@/components/ui/input";
import { useFilterCardsKanban } from "@/contexts/filters.context";
import { useKanbanContext } from "@/contexts/kanban.context";

export function NavbarLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-full flex flex-row py-2 border-b border-zinc-50/10 gap-4 px-4 h-14">
      <CreateKanbanDialog>
        <Button>Create Board</Button>
      </CreateKanbanDialog>

      <div className="invisible ml-auto" />

      {location.pathname !== "/profile" && (
        <Button onClick={() => navigate("/profile")}>Profile</Button>
      )}

      {location.pathname.includes("/board/") && <FilterPopover />}

      <Button onClick={() => navigate("/")}>Back to Home</Button>
    </nav>
  );
}

export function FilterPopover() {
  const { labels } = useKanbanContext();

  const {
    setNameFilter,
    addLabelFilter,
    removeLabelFilter,
    filterCardsKanban,
    clearFilters,
  } = useFilterCardsKanban();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Filter</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <Input
            value={filterCardsKanban.name}
            onChange={(e) => {
              setNameFilter(e.target.value);
            }}
            placeholder="Enter name"
          />
          <Command>
            <CommandInput placeholder="Enter label" />
            <CommandList>
              <CommandEmpty>No labels found</CommandEmpty>
              {labels.map((label) => (
                <CommandItem
                  key={label.id}
                  onSelect={() => {
                    if (filterCardsKanban.label.includes(label.id))
                      removeLabelFilter(label.id);
                    else addLabelFilter(label.id);
                  }}
                >
                  <div className="flex flex-row items-center gap-2 w-full">
                    <Checkbox
                      checked={filterCardsKanban.label.includes(label.id)}
                    />
                    <span>{label.text}</span>
                    <figure
                      style={{ backgroundColor: label.color }}
                      className="size-5 rounded-md ml-auto"
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
          <Button onClick={() => clearFilters()}>Clear filters</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
