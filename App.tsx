import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Recommendations from "@/pages/recommendations";
import AIRecommendations from "@/pages/ai-recommendations";
import SystemHealthPage from "@/pages/system-health";
import Settings from "@/pages/settings";
import CostAnalysis from "@/pages/cost-analysis";
import Reports from "@/pages/reports";
import PanelsPage from "@/pages/panels";
import PanelDetailPage from "@/pages/panel-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/panels" component={PanelsPage} />
      <Route path="/panels/:id" component={PanelDetailPage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/ai-recommendations" component={AIRecommendations} />
      <Route path="/system-health" component={SystemHealthPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/cost-analysis" component={CostAnalysis} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="solar-optimizer-theme">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="glass-header p-4">
                  <div className="flex items-center justify-between">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto max-w-screen-2xl">
                    <Router />
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;