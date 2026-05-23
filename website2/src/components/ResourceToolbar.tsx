import type {
  FilterDefinition,
  ListConfig,
  SortOption,
} from "../data/routes";
import type { FilterOption, ListingState } from "../lib/resource-listing";

interface ResourceToolbarProps {
  config: ListConfig;
  state: ListingState;
  resultCountText: string;
  filterOptions: Record<string, FilterOption[]>;
  hasActiveControls: boolean;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterDefinition, values: string[]) => void;
  onClear: () => void;
}

const sortLabels: Record<SortOption, string> = {
  title: "Name",
  lastUpdated: "Recently Updated",
  featured: "Featured First",
};

const filterPluralLabels: Record<string, string> = {
  Category: "Categories",
};

export function ResourceToolbar({
  config,
  state,
  resultCountText,
  filterOptions,
  hasActiveControls,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onClear,
}: ResourceToolbarProps) {
  return (
    <div className="mb-5 border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-1 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-sm font-semibold text-slate-700">
          {resultCountText}
        </div>
        <div className="text-xs font-medium uppercase text-slate-500">
          Browse collection
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_auto] lg:items-end">
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
          Search
          <input
            type="search"
            className="h-10 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400"
            value={state.search}
            placeholder="Search titles, descriptions, paths, and metadata"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-max sm:items-end lg:justify-end">
          {config.filters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              values={state.filters[filter.id] ?? []}
              options={filterOptions[filter.id] ?? []}
              onChange={(values) => onFilterChange(filter, values)}
            />
          ))}
          {config.sortOptions.length > 1 ? (
            <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
              Sort
              <select
                className="h-10 w-full border border-line bg-white px-3 text-sm text-ink sm:w-48"
                value={state.sort}
                onChange={(event) =>
                  onSortChange(event.target.value as SortOption)
                }
              >
                {config.sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {sortLabels[option]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {hasActiveControls ? (
            <button
              type="button"
              className="h-10 w-full border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent sm:w-auto"
              onClick={onClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface FilterControlProps {
  filter: FilterDefinition;
  values: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
}

function FilterControl({
  filter,
  values,
  options,
  onChange,
}: FilterControlProps) {
  if (filter.mode === "single") {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
        {filter.label}
        <select
          className="h-10 w-full border border-line bg-white px-3 text-sm text-ink sm:w-52"
          value={values[0] ?? ""}
          onChange={(event) =>
            onChange(event.target.value ? [event.target.value] : [])
          }
        >
          <option value="">
            All {filterPluralLabels[filter.label] ?? `${filter.label}s`}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
      {filter.label}
      <select
        multiple
        className="min-h-28 w-full border border-line bg-white px-3 py-2 text-sm text-ink sm:w-56"
        value={values}
        onChange={(event) =>
          onChange(
            Array.from(
              event.currentTarget.selectedOptions,
              (option) => option.value
            )
          )
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
