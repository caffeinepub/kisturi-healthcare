/**
 * Simple hash-based router utilities to match the React Router v6 API
 * needed in the task spec, implemented on top of plain browser history.
 */

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RouterContextType {
  pathname: string;
  params: Record<string, string>;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: "/",
  params: {},
  navigate: () => {},
});

// ─── Router Provider ─────────────────────────────────────────────────────────

interface Route {
  path: string;
  element: ReactNode;
}

interface RouterProviderProps {
  routes: Route[];
}

function matchPath(
  routePath: string,
  currentPath: string,
): Record<string, string> | null {
  const routeParts = routePath.split("/");
  const currentParts = currentPath.split("/");

  if (routeParts.length !== currentParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < routeParts.length; i++) {
    const r = routeParts[i];
    const c = currentParts[i];
    if (r.startsWith(":")) {
      params[r.slice(1)] = c;
    } else if (r !== c) {
      return null;
    }
  }
  return params;
}

function getHashPath(): string {
  const hash = window.location.hash.slice(1) || "/";
  return hash.split("?")[0];
}

export function RouterProvider({ routes }: RouterProviderProps) {
  const [pathname, setPathname] = useState(getHashPath);

  const handleHashChange = useCallback(() => {
    setPathname(getHashPath());
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, [handleHashChange]);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  // Find matching route
  let matchedElement: ReactNode = null;
  let matchedParams: Record<string, string> = {};

  for (const route of routes) {
    const params = matchPath(route.path, pathname);
    if (params !== null) {
      matchedElement = route.element;
      matchedParams = params;
      break;
    }
  }

  return (
    <RouterContext.Provider
      value={{ pathname, params: matchedParams, navigate }}
    >
      {matchedElement ?? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">404 Not Found</h1>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-primary underline"
            >
              Go Home
            </button>
          </div>
        </div>
      )}
    </RouterContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useNavigate(): (to: string) => void {
  const ctx = useContext(RouterContext);
  return ctx.navigate;
}

export function useParams(): Record<string, string> {
  return useContext(RouterContext).params;
}

export function usePathname(): string {
  return useContext(RouterContext).pathname;
}

// ─── Link Component ──────────────────────────────────────────────────────────

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function Link({ to, children, className }: LinkProps) {
  return (
    <a href={`#${to}`} className={className}>
      {children}
    </a>
  );
}
