import type { ComponentType } from "react";
import { AgentsPage } from "../pages/AgentsPage";
import { ContributorsPage } from "../pages/ContributorsPage";
import { HomePage } from "../pages/HomePage";
import { ResourcePage } from "../pages/ResourcePage";

export type ResourceKind =
  | "agents"
  | "instructions"
  | "skills"
  | "hooks"
  | "workflows"
  | "plugins"
  | "tools"
  | "samples";

export type SortOption = "title" | "lastUpdated" | "featured";

export interface FilterDefinition {
  id: string;
  label: string;
  queryParam: string;
  field: string;
  mode: "single" | "multi";
  emptyLabel?: string;
}

export interface ListConfig {
  defaultSort: SortOption;
  sortOptions: SortOption[];
  filters: FilterDefinition[];
}

export interface RouteDefinition {
  id: string;
  label: string;
  path: string;
  description: string;
  resourceKind?: ResourceKind;
  dataFile?: `${ResourceKind}.json`;
  countKey?: ResourceKind | "contributors";
  listConfig?: ListConfig;
  component: ComponentType<{ route: RouteDefinition }>;
}

function resourceRoute(
  id: ResourceKind,
  label: string,
  description: string,
  listConfig?: ListConfig
): RouteDefinition {
  return {
    id,
    label,
    path: `/${id}`,
    description,
    resourceKind: id,
    dataFile: `${id}.json`,
    countKey: id,
    listConfig,
    component: ResourcePage,
  };
}

const titleSortConfig: ListConfig = {
  defaultSort: "title",
  sortOptions: ["title", "lastUpdated"],
  filters: [],
};

export const routes: RouteDefinition[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    description:
      "Community-contributed agents, instructions, and skills to enhance GitHub Copilot.",
    component: HomePage,
  },
  {
    ...resourceRoute(
      "agents",
      "Agents",
      "Custom agents for specialized Copilot experiences.",
      titleSortConfig
    ),
    component: AgentsPage,
  },
  resourceRoute(
    "instructions",
    "Instructions",
    "Coding standards and best practices for Copilot.",
    {
      defaultSort: "title",
      sortOptions: ["title", "lastUpdated"],
      filters: [],
    }
  ),
  resourceRoute(
    "skills",
    "Skills",
    "Self-contained folders with instructions and bundled resources.",
    titleSortConfig
  ),
  resourceRoute(
    "hooks",
    "Hooks",
    "Automated workflows triggered by agent events.",
    {
      defaultSort: "title",
      sortOptions: ["title", "lastUpdated"],
      filters: [],
    }
  ),
  resourceRoute(
    "workflows",
    "Workflows",
    "AI-powered repository automation for GitHub Actions.",
    {
      defaultSort: "title",
      sortOptions: ["title", "lastUpdated"],
      filters: [],
    }
  ),
  resourceRoute(
    "plugins",
    "Plugins",
    "Installable plugin packages organized around themes.",
    {
      defaultSort: "title",
      sortOptions: ["title", "lastUpdated"],
      filters: [],
    }
  ),
  resourceRoute("tools", "Tools", "MCP servers and developer tools.", {
    defaultSort: "featured",
    sortOptions: ["featured", "title"],
    filters: [
      {
        id: "category",
        label: "Category",
        queryParam: "category",
        field: "category",
        mode: "single",
      },
    ],
  }),
  {
    id: "contributors",
    label: "Contributors",
    path: "/contributors",
    description: "Community members who have contributed to the project.",
    countKey: "contributors",
    component: ContributorsPage,
  },
  {
    ...resourceRoute(
      "samples",
      "Learning Hub",
      "Guides and examples for using GitHub Copilot customizations.",
      {
        defaultSort: "title",
        sortOptions: ["title"],
        filters: [],
      }
    ),
    path: "/learning-hub/cookbook",
  },
];

export const navigationRoutes = routes.filter((route) => route.id !== "home");
