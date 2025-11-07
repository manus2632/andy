import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AngebotErstellen from "./pages/AngebotErstellen";
import AngebotVorschau from "./pages/AngebotVorschau";
import BausteinBibliothek from "./pages/BausteinBibliothek";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={AngebotErstellen} />
      <Route path={"/angebot/erstellen"} component={AngebotErstellen} />
      <Route path={"/angebot/:id"} component={AngebotVorschau} />
      <Route path={"/bausteine"} component={BausteinBibliothek} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
