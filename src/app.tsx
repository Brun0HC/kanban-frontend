import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppRoutes } from "./routes";
import { FilterProvider } from "./contexts/filters.context";
import { ThemeProvider } from "./contexts/theme.context";

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <FilterProvider>
          <AppRoutes />
        </FilterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
