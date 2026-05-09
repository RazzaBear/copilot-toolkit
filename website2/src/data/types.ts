import type { ResourceKind } from "./routes";

export interface ResourceFile {
  name: string;
  path: string;
  size?: number;
}

export interface ResourceSource {
  source?: string;
  repo?: string;
  path?: string;
}

export interface ResourceLinks {
  blog?: string;
  vscode?: string;
  "vscode-insiders"?: string;
  "visual-studio"?: string;
  github?: string;
  documentation?: string;
  marketplace?: string;
  npm?: string;
  pypi?: string;
  [key: string]: string | undefined;
}

export interface ManifestCounts {
  agents: number;
  instructions: number;
  skills: number;
  hooks: number;
  workflows: number;
  plugins: number;
  tools: number;
  contributors: number;
  samples: number;
  total: number;
}

export interface ManifestData {
  generated: string;
  counts: ManifestCounts;
}

export interface ResourceItem {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  path?: string;
  filename?: string;
  tags?: string[];
  keywords?: string[];
  lastUpdated?: string | null;
  model?: string | string[];
  tools?: string[];
  extensions?: string[];
  triggers?: string[];
  category?: string;
  featured?: boolean;
  hasAssets?: boolean;
  assetCount?: number;
  skillFile?: string;
  files?: ResourceFile[];
  readmeFile?: string;
  assets?: string[];
  links?: ResourceLinks;
  external?: boolean;
  repository?: string | null;
  homepage?: string | null;
  source?: ResourceSource | null;
  url?: string;
  [key: string]: unknown;
}

export interface ResourceCollection {
  items: ResourceItem[];
  filters?: Record<string, string[]>;
}

export type ResourceCollections = Record<ResourceKind, ResourceCollection>;
