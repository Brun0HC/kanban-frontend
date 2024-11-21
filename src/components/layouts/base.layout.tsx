import { NavbarLayout } from "./fragments/navbar/navbar.layout";
import { Outlet } from "react-router-dom";

export function BaseLayout() {
  return (
    <div className="w-full h-full max-h-full box-border flex flex-col">
      <NavbarLayout />
      <div className="h-full w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
