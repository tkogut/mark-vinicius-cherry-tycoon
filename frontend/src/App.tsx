import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppShell } from './components/layout/AppShell';
import GddPage from './pages/GddPage';
import PlanInputPage from './pages/PlanInputPage';
import GameDashboard from './pages/GameDashboard';
import FarmView from './pages/FarmView';
import MarketView from './pages/MarketView';

const rootRoute = createRootRoute({
  component: AppShell,
});

// GDD Editor Routes (existing)
const gddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gdd',
  component: GddPage,
});

const planInputRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plan-input',
  component: PlanInputPage,
});

// Game Routes (new)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GameDashboard,
});

const farmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/farm',
  component: FarmView,
});

const marketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market',
  component: MarketView,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  farmRoute,
  marketRoute,
  gddRoute,
  planInputRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
