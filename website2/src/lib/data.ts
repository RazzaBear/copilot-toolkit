import type { ManifestData, ResourceCollection } from "../data/types";

const dataCache = new Map<string, Promise<unknown>>();

export async function fetchData<T>(filename: string): Promise<T> {
  if (!dataCache.has(filename)) {
    const basePath = import.meta.env.BASE_URL || "/";
    dataCache.set(
      filename,
      fetch(`${basePath}data/${filename}`).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load /data/${filename}`);
        }
        return response.json() as Promise<T>;
      })
    );
  }

  return dataCache.get(filename) as Promise<T>;
}

export function fetchManifest(): Promise<ManifestData> {
  return fetchData<ManifestData>("manifest.json");
}

export function fetchResourceCollection(
  filename: string
): Promise<ResourceCollection> {
  return fetchData<ResourceCollection>(filename);
}

export function getDisplayName(item: {
  title?: string;
  name?: string;
  id?: string;
  filename?: string;
}): string {
  return item.title ?? item.name ?? item.id ?? item.filename ?? "Untitled";
}
