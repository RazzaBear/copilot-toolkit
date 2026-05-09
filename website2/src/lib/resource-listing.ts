import type {
  FilterDefinition,
  ListConfig,
  ResourceKind,
  SortOption,
} from "../data/routes";
import type { ResourceCollection, ResourceItem } from "../data/types";
import { getDisplayName } from "./data";

export type SelectedFilters = Record<string, string[]>;

export interface ListingState {
  sort: SortOption;
  search: string;
  filters: SelectedFilters;
}

export interface FilterOption {
  value: string;
  label: string;
}

export function sortResourceItems(
  items: ResourceItem[],
  sortOption: SortOption
): ResourceItem[] {
  return [...items].sort((a, b) => {
    if (sortOption === "lastUpdated") {
      const left = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const right = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return right - left;
    }

    if (sortOption === "featured") {
      if (a.featured === true && b.featured !== true) return -1;
      if (a.featured !== true && b.featured === true) return 1;
    }

    return getDisplayName(a).localeCompare(getDisplayName(b));
  });
}

export function filterResourceItems(
  items: ResourceItem[],
  filters: FilterDefinition[],
  selectedValues: SelectedFilters
): ResourceItem[] {
  return items.filter((item) =>
    filters.every((filter) => {
      const selected = selectedValues[filter.id] ?? [];
      if (selected.length === 0) return true;

      const value = item[filter.field];
      if (Array.isArray(value)) {
        if (selected.includes("(none)") && value.length === 0) return true;
        return value.some((entry) => selected.includes(String(entry)));
      }

      if (value === undefined || value === null || value === "") {
        return selected.includes("(none)");
      }

      return selected.includes(String(value));
    })
  );
}

export function searchResourceItems(
  items: ResourceItem[],
  query: string
): ResourceItem[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return items;

  return items.filter((item) => {
    const searchableText = getSearchableText(item);
    return terms.every((term) => searchableText.includes(term));
  });
}

export function getFilterOptions(
  collection: ResourceCollection,
  items: ResourceItem[],
  filter: FilterDefinition
): FilterOption[] {
  const generatedFilters = collection.filters as
    | Record<string, string[] | undefined>
    | undefined;
  const generatedValues = generatedFilters?.[filter.id];
  const values =
    generatedValues && generatedValues.length > 0
      ? generatedValues
      : deriveFilterValues(items, filter);

  return values.map((value) => ({
    value,
    label: value === "(none)" ? filter.emptyLabel ?? "None" : value,
  }));
}

function deriveFilterValues(
  items: ResourceItem[],
  filter: FilterDefinition
): string[] {
  const values = new Set<string>();

  for (const item of items) {
    const value = item[filter.field];
    if (Array.isArray(value)) {
      if (value.length === 0 && filter.emptyLabel) values.add("(none)");
      value.forEach((entry) => values.add(String(entry)));
      continue;
    }

    if (value === undefined || value === null || value === "") {
      if (filter.emptyLabel) values.add("(none)");
      continue;
    }

    values.add(String(value));
  }

  return [...values].sort((left, right) => left.localeCompare(right));
}

function getSearchableText(item: ResourceItem): string {
  return [
    getDisplayName(item),
    item.description,
    item.id,
    item.path,
    item.filename,
    item.searchText,
    item.tags,
    item.keywords,
    item.extensions,
    item.triggers,
    item.category,
    item.model,
    item.tools,
    item.links,
    item.source,
    item.repository,
    item.homepage,
  ]
    .flatMap((value) => flattenSearchValue(value))
    .join(" ")
    .toLowerCase();
}

function flattenSearchValue(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (typeof value === "string") return [value];
  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenSearchValue(entry));
  }
  if (typeof value === "object") {
    return Object.values(value).flatMap((entry) => flattenSearchValue(entry));
  }
  return [];
}

export function readListingState(
  searchParams: URLSearchParams,
  config: ListConfig
): ListingState {
  const sortParam = searchParams.get("sort") as SortOption | null;
  const sort =
    sortParam && config.sortOptions.includes(sortParam)
      ? sortParam
      : config.defaultSort;
  const search = searchParams.get("q")?.trim() ?? "";

  const filters: SelectedFilters = {};
  for (const filter of config.filters) {
    filters[filter.id] =
      filter.mode === "single"
        ? searchParams.get(filter.queryParam)
          ? [searchParams.get(filter.queryParam) as string]
          : []
        : searchParams.getAll(filter.queryParam);
  }

  return { sort, search, filters };
}

export function createListingSearchParams(
  state: ListingState,
  config: ListConfig
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.sort !== config.defaultSort) {
    params.set("sort", state.sort);
  }

  if (state.search.trim()) {
    params.set("q", state.search.trim());
  }

  for (const filter of config.filters) {
    const values = state.filters[filter.id] ?? [];
    if (filter.mode === "single") {
      if (values[0]) params.set(filter.queryParam, values[0]);
      continue;
    }

    values.forEach((value) => params.append(filter.queryParam, value));
  }

  return params;
}

export function countActiveFilters(filters: SelectedFilters): number {
  return Object.values(filters).reduce(
    (total, values) => total + values.length,
    0
  );
}

export function getResultCountText(
  resourceKind: ResourceKind,
  visibleCount: number,
  totalCount: number,
  activeConstraintCount: number
): string {
  const singular =
    resourceKind === "skills" ? "skill" : resourceKind.slice(0, -1);
  const plural = resourceKind;

  if (activeConstraintCount === 0) {
    return `${visibleCount} ${visibleCount === 1 ? singular : plural}`;
  }

  return `${visibleCount} of ${totalCount} ${plural} (${activeConstraintCount} active control${
    activeConstraintCount === 1 ? "" : "s"
  })`;
}
