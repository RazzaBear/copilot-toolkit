import { useCallback } from "react";
import { PageHeader } from "../components/PageHeader";
import { StateMessage } from "../components/StateMessage";
import type { RouteDefinition } from "../data/routes";
import type { ManifestData } from "../data/types";
import { fetchManifest } from "../lib/data";
import { useAsyncData } from "../lib/useAsyncData";

interface ContributorsPageProps {
  route: RouteDefinition;
}

export function ContributorsPage({ route }: ContributorsPageProps) {
  const state = useAsyncData<ManifestData>(useCallback(fetchManifest, []));

  if (state.status === "loading") {
    return <StateMessage title="Loading contributor count" />;
  }

  if (state.status === "error") {
    return (
      <StateMessage
        title="Unable to load contributor data"
        detail={state.error.message}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={route.label}
        description={route.description}
        count={state.data.counts.contributors}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="border border-line bg-white p-6">
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            The React scaffold preserves the contributor count from
            manifest.json. The full contributor grid can be migrated from the
            Astro page once the app shell and generated data path are stable.
          </p>
        </div>
      </section>
    </>
  );
}
