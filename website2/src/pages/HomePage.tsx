import { useCallback } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StateMessage } from "../components/StateMessage";
import { navigationRoutes } from "../data/routes";
import type { ManifestData } from "../data/types";
import { fetchManifest } from "../lib/data";
import { useAsyncData } from "../lib/useAsyncData";

export function HomePage() {
  const state = useAsyncData<ManifestData>(useCallback(fetchManifest, []));

  if (state.status === "loading") {
    return <StateMessage title="Loading website data" />;
  }

  if (state.status === "error") {
    return (
      <StateMessage
        title="Unable to load manifest"
        detail={state.error.message}
      />
    );
  }

  const { counts } = state.data;

  return (
    <>
      <PageHeader
        title="Copilot Toolkit"
        description="Community-contributed agents, instructions, skills, hooks, workflows, plugins, and tools for GitHub Copilot."
        count={counts.total}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navigationRoutes.map((route) => {
            const count = route.countKey ? counts[route.countKey] : undefined;

            return (
              <Link
                key={route.id}
                to={route.path}
                className="border border-line bg-white p-5 transition hover:border-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{route.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {route.description}
                    </p>
                  </div>
                  {typeof count === "number" ? (
                    <span className="font-mono text-2xl font-semibold text-accent">
                      {count}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
