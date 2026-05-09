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
    <div className="mb-5 border border-line bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="font-mono text-sm font-semibold text-slate-700">
            {resultCountText}
          </div>
          <label className="flex max-w-xl flex-col gap-1 text-sm font-medium text-slate-700">
            Search
            <input
              type="search"
              className="h-10 w-full min-w-72 border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400"
              value={state.search}
              placeholder="Search titles, descriptions, tags, paths"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-end">
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
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Sort
              <select
                className="h-10 min-w-44 border border-line bg-white px-3 text-sm text-ink"
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
              className="h-10 self-end border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
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
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {filter.label}
        <select
          className="h-10 min-w-48 border border-line bg-white px-3 text-sm text-ink"
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
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {filter.label}
      <select
        multiple
        className="min-h-28 min-w-56 border border-line bg-white px-3 py-2 text-sm text-ink"
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
