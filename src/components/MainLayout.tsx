import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function MainLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Spacer for mobile header */}
        <div className="h-14 lg:hidden" aria-hidden="true" />
        <AppHeader />
        <main 
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"
          role="main"
          id="main-content"
        >
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
