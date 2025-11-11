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
import AngebotArchiv from "./pages/AngebotArchiv";
import Konfigurator from "./pages/Konfigurator";
import Login from "./pages/Login";
import Benutzerverwaltung from "./pages/Benutzerverwaltung";
import { AppLayout } from "./components/AppLayout";
import { AdminRoute } from "./components/AdminRoute";
import { ExternalRoute } from "./components/ExternalRoute";

function Router() {
  return (
    <Switch>
      {/* Öffentliche Routen ohne Layout */}
      <Route path={"/login"} component={Login} />
      <Route path={"/konfigurator/:token?"} component={Konfigurator} />
      
      {/* Geschützte Routen mit Layout */}
      <Route path={"/*"}>
        {() => (
          <AppLayout>
            <ExternalRoute>
              <Switch>
              <Route path={"/"} component={AngebotErstellen} />
              <Route path={"/angebot/erstellen"} component={AngebotErstellen} />
              <Route path={"/angebot/:id"} component={AngebotVorschau} />
              <Route path={"/bausteine"} component={BausteinBibliothek} />
              <Route path={"/archiv"} component={AngebotArchiv} />
              <Route path={"/benutzer"}>
                {() => (
                  <AdminRoute>
                    <Benutzerverwaltung />
                  </AdminRoute>
                )}
              </Route>
              <Route path={"/404"} component={NotFound} />
              <Route component={NotFound} />
              </Switch>
            </ExternalRoute>
          </AppLayout>
        )}
      </Route>
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
