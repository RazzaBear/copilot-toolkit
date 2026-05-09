import { NavLink } from "react-router-dom";
import { navigationRoutes } from "../data/routes";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <NavLink to="/" className="font-mono text-sm font-semibold uppercase">
            Awesome GitHub Copilot
          </NavLink>
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-2">
              {navigationRoutes.map((route) => (
                <li key={route.id}>
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      [
                        "inline-flex h-9 items-center border px-3 text-sm font-medium transition",
                        isActive
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-white text-ink hover:border-accent hover:text-accent",
                      ].join(" ")
                    }
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
