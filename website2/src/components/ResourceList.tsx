import { useState } from "react";
import { getDisplayName } from "../lib/data";
import type { ResourceKind } from "../data/routes";
import type { ResourceItem } from "../data/types";
import { getPreviewFiles, type PreviewFile } from "../lib/resource-actions";
import { FilePreviewModal } from "./FilePreviewModal";
import { ResourceActions } from "./ResourceActions";

interface ResourceListProps {
  items: ResourceItem[];
  resourceKind: ResourceKind;
}

interface PreviewState {
  title: string;
  files: PreviewFile[];
  initialPath: string;
}

export function ResourceList({ items, resourceKind }: ResourceListProps) {
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  if (items.length === 0) {
    return (
      <div className="border border-line bg-white p-6">
        <p className="text-sm text-slate-600">No items found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {items.map((item, index) => {
          const name = getDisplayName(item);
          const key =
            item.id ?? item.path ?? item.filename ?? `${name}-${index}`;
          const previewFiles = getPreviewFiles(resourceKind, item);
          const openPreview = () => {
            if (previewFiles.length === 0) return;
            setPreviewState({
              title: name,
              files: previewFiles,
              initialPath: previewFiles[0].path,
            });
          };

          return (
            <article
              key={key}
              className="border border-line bg-white p-4 transition hover:border-accent"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  {previewFiles.length > 0 ? (
                    <div
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={openPreview}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openPreview();
                        }
                      }}
                    >
                      <ResourceSummary
                        item={item}
                        name={name}
                        resourceKind={resourceKind}
                        previewable
                      />
                    </div>
                  ) : (
                    <ResourceSummary
                      item={item}
                      name={name}
                      resourceKind={resourceKind}
                    />
                  )}
                </div>
                <ResourceActions
                  resourceKind={resourceKind}
                  item={item}
                  onPreview={(files, initialPath) => {
                    setPreviewState({ title: name, files, initialPath });
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
      {previewState ? (
        <FilePreviewModal
          open
          title={previewState.title}
          files={previewState.files}
          initialPath={previewState.initialPath}
          onClose={() => setPreviewState(null)}
        />
      ) : null}
    </>
  );
}

interface ResourceSummaryProps {
  item: ResourceItem;
  name: string;
  resourceKind: ResourceKind;
  previewable?: boolean;
}

function ResourceSummary({
  item,
  name,
  resourceKind,
  previewable = false,
}: ResourceSummaryProps) {
  return (
    <>
      <h2
        className={[
          "text-lg font-semibold",
          previewable ? "transition hover:text-accent" : "",
        ].join(" ")}
      >
        {name}
      </h2>
      {item.description ? (
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      ) : null}
      <ResourceMetadata item={item} resourceKind={resourceKind} />
    </>
  );
}

interface ResourceMetadataProps {
  item: ResourceItem;
  resourceKind: ResourceKind;
}

function ResourceMetadata({ item, resourceKind }: ResourceMetadataProps) {
  const chips = getMetadataChips(item, resourceKind);
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="border border-line bg-canvas px-2 py-1 text-xs font-medium text-slate-600"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function getMetadataChips(
  item: ResourceItem,
  resourceKind: ResourceKind
): string[] {
  const chips: string[] = [];

  if (resourceKind === "agents") {
    const models = Array.isArray(item.model)
      ? item.model
      : item.model
        ? [String(item.model)]
        : [];
    chips.push(...models.slice(0, 1));

    if (Array.isArray(item.tools)) {
      chips.push(...item.tools.slice(0, 3).map(String));
      if (item.tools.length > 3) chips.push(`+${item.tools.length - 3} tools`);
    }
  }

  if (resourceKind === "instructions" && item.extensions) {
    chips.push(...item.extensions.slice(0, 4));
    if (item.extensions.length > 4) {
      chips.push(`+${item.extensions.length - 4} more`);
    }
  }

  if (
    (resourceKind === "hooks" ||
      resourceKind === "plugins" ||
      resourceKind === "samples") &&
    item.tags
  ) {
    chips.push(...item.tags.slice(0, 4));
    if (item.tags.length > 4) chips.push(`+${item.tags.length - 4} more`);
  }

  if (resourceKind === "workflows" && Array.isArray(item.triggers)) {
    chips.push(...item.triggers.map(String));
  }

  if (resourceKind === "tools") {
    if (typeof item.category === "string") chips.push(item.category);
    if (item.featured === true) chips.push("Featured");
  }

  if (resourceKind === "skills") {
    if (item.hasAssets === true) {
      chips.push(`${Number(item.assetCount ?? 0)} assets`);
    }
    if (item.files) {
      chips.push(`${item.files.length} files`);
    }
  }

  if (item.lastUpdated) {
    chips.push(`Updated ${new Date(item.lastUpdated).toLocaleDateString()}`);
  }

  return chips.filter(Boolean);
}
