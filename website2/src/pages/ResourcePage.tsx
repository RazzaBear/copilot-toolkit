import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ResourceList } from "../components/ResourceList";
import { ResourceToolbar } from "../components/ResourceToolbar";
import { StateMessage } from "../components/StateMessage";
import type {
  FilterDefinition,
  RouteDefinition,
  SortOption,
} from "../data/routes";
import type { ResourceCollection, ResourceItem } from "../data/types";
import { fetchResourceCollection } from "../lib/data";
import {
  countActiveFilters,
  createListingSearchParams,
  filterResourceItems,
  getFilterOptions,
  getResultCountText,
  readListingState,
  searchResourceItems,
  sortResourceItems,
} from "../lib/resource-listing";
import { useAsyncData } from "../lib/useAsyncData";

interface ResourcePageProps {
  route: RouteDefinition;
}

interface SamplesData {
  cookbooks?: Array<{
    id: string;
    name: string;
    description?: string;
    recipes?: Array<{
      id: string;
      name: string;
      description?: string;
      tags?: string[];
      url?: string;
      variants?: Record<string, { doc?: string | null; example?: string | null }>;
    }>;
  }>;
}

function normalizeItems(
  data: ResourceCollection | SamplesData,
  route: RouteDefinition
): ResourceItem[] {
  if ("items" in data && Array.isArray(data.items)) {
    return data.items;
  }

  if (route.resourceKind !== "samples" || !("cookbooks" in data)) {
    return [];
  }

  return (data.cookbooks ?? []).flatMap((cookbook) =>
    (cookbook.recipes ?? []).map((recipe) => {
      const firstVariant = Object.values(recipe.variants ?? {}).find(
        (variant) => variant.doc || variant.example
      );

      return {
        id: `${cookbook.id}-${recipe.id}`,
        title: recipe.name,
        description: recipe.description,
        tags: recipe.tags,
        path: firstVariant?.doc ?? firstVariant?.example ?? cookbook.id,
        url: recipe.url,
      };
    })
  );
}

export function ResourcePage({ route }: ResourcePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const load = useCallback(() => {
    if (!route.dataFile) {
      return Promise.resolve({ items: [] });
    }
    return fetchResourceCollection(route.dataFile);
  }, [route.dataFile]);

  const state = useAsyncData<ResourceCollection | SamplesData>(load);

  if (state.status === "loading") {
    return <StateMessage title={`Loading ${route.label.toLowerCase()}`} />;
  }

  if (state.status === "error") {
    return (
      <StateMessage
        title={`Unable to load ${route.label.toLowerCase()}`}
        detail={state.error.message}
      />
    );
  }

  const items = normalizeItems(state.data, route);
  const collection =
    "items" in state.data && Array.isArray(state.data.items)
      ? state.data
      : { items };
  const listConfig = route.listConfig;
  const listingState = listConfig
    ? readListingState(searchParams, listConfig)
    : null;
  const filteredItems =
    listConfig && listingState
      ? filterResourceItems(items, listConfig.filters, listingState.filters)
      : items;
  const searchedItems =
    listConfig && listingState
      ? searchResourceItems(filteredItems, listingState.search)
      : filteredItems;
  const visibleItems =
    listConfig && listingState
      ? sortResourceItems(searchedItems, listingState.sort)
      : items;
  const activeFilterCount = listingState
    ? countActiveFilters(listingState.filters)
    : 0;
  const hasActiveSearch = !!listingState?.search.trim();
  const activeConstraintCount =
    activeFilterCount + (hasActiveSearch ? 1 : 0);
  const hasActiveControls =
    !!listConfig &&
    !!listingState &&
    (activeConstraintCount > 0 ||
      listingState.sort !== listConfig.defaultSort);
  const filterOptions =
    listConfig?.filters.reduce<
      Record<string, ReturnType<typeof getFilterOptions>>
    >((options, filter) => {
      options[filter.id] = getFilterOptions(collection, items, filter);
      return options;
    }, {}) ?? {};

  function commitListingState(nextState: NonNullable<typeof listingState>) {
    if (!listConfig) return;
    setSearchParams(createListingSearchParams(nextState, listConfig), {
      replace: true,
    });
  }

  function handleSortChange(sort: SortOption) {
    if (!listingState) return;
    commitListingState({ ...listingState, sort });
  }

  function handleSearchChange(search: string) {
    if (!listingState) return;
    commitListingState({ ...listingState, search });
  }

  function handleFilterChange(filter: FilterDefinition, values: string[]) {
    if (!listingState) return;
    commitListingState({
      ...listingState,
      filters: {
        ...listingState.filters,
        [filter.id]: values,
      },
    });
  }

  function handleClearControls() {
    if (!listConfig) return;
    commitListingState({
      sort: listConfig.defaultSort,
      search: "",
      filters: Object.fromEntries(
        listConfig.filters.map((filter) => [filter.id, []])
      ),
    });
  }

  return (
    <>
      <PageHeader
        title={route.label}
        description={route.description}
        count={items.length}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {route.resourceKind && listConfig && listingState ? (
          <ResourceToolbar
            config={listConfig}
            state={listingState}
            resultCountText={getResultCountText(
              route.resourceKind,
              visibleItems.length,
              items.length,
              activeConstraintCount
            )}
            filterOptions={filterOptions}
            hasActiveControls={hasActiveControls}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onClear={handleClearControls}
          />
        ) : null}
        {route.resourceKind ? (
          <ResourceList
            items={visibleItems}
            resourceKind={route.resourceKind}
          />
        ) : (
          <StateMessage title="No resource renderer configured" />
        )}
      </section>
    </>
  );
}
