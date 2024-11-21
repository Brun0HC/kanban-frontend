import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { BaseLayout } from "./components/layouts/base.layout";
import { HomePage } from "./pages/home";
import { KanbanContextProvider } from "./contexts/kanban.context";
import { KanbanPage } from "./pages/kanban";
import { ProfilePage } from "./pages/profile";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KanbanContextProvider />}>
          <Route path="/" element={<BaseLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/board/:id" element={<KanbanPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
