import { ReactNode, createContext, useContext, useState } from "react";

type TFilters = {
  name: string;
  label: number[];
};

type TFilterContext = {
  filterCardsKanban: TFilters;
  setNameFilter: (name: string) => void;
  addLabelFilter: (label: number) => void;
  removeLabelFilter: (label: number) => void;
  clearFilters: () => void;
};

const FilterCardsKanbanContext = createContext<TFilterContext | undefined>({
  filterCardsKanban: {
    name: "",
    label: [],
  },
  setNameFilter: () => {},
  addLabelFilter: () => {},
  removeLabelFilter: () => {},
  clearFilters: () => {},
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterCardsKanban, setFilterCardsKanban] = useState<TFilters>({
    name: "",
    label: [],
  });

  const setNameFilter = (name: string) => {
    setFilterCardsKanban((prev) => ({ ...prev, name }));
  };

  const addLabelFilter = (label: number) => {
    setFilterCardsKanban((prev) => ({
      ...prev,
      label: [...prev.label, label],
    }));
  };

  const removeLabelFilter = (label: number) => {
    setFilterCardsKanban((prev) => ({
      ...prev,
      label: prev.label?.filter((l) => l !== label),
    }));
  };

  const clearFilters = () => {
    setFilterCardsKanban({
      name: "",
      label: [],
    });
  };

  return (
    <FilterCardsKanbanContext.Provider
      value={{
        filterCardsKanban,
        setNameFilter,
        addLabelFilter,
        removeLabelFilter,
        clearFilters,
      }}
    >
      {children}
    </FilterCardsKanbanContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilterCardsKanban() {
  const context = useContext(FilterCardsKanbanContext);

  if (!context) {
    throw new Error(
      "useFilterCardsKanban must be used within a FilterProvider"
    );
  }

  return context;
}
