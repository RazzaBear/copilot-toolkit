import { useEffect, useState } from "react";
import type { ResourceKind } from "../data/routes";
import type { ResourceItem, ResourceLinks } from "../data/types";
import {
  copyText,
  downloadFile,
  downloadZip,
  getGitHubBlobUrl,
  getHookDownloadFiles,
  getPluginRepositoryUrl,
  getPreviewFiles,
  getRawGitHubUrl,
  getSampleUrl,
  getSkillDownloadFiles,
  getSkillInstallCommand,
  getVSCodeInstallUrl,
  type PreviewFile,
} from "../lib/resource-actions";

interface ResourceActionsProps {
  resourceKind: ResourceKind;
  item: ResourceItem;
  onPreview?: (files: PreviewFile[], initialPath: string) => void;
}

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => Promise<void>;
  busyLabel?: string;
  successLabel?: string;
}

interface ActionLinkProps {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}

const linkLabels: Partial<Record<keyof ResourceLinks, string>> = {
  github: "GitHub",
  documentation: "Docs",
  marketplace: "Marketplace",
  npm: "npm",
  pypi: "PyPI",
  blog: "Blog",
  vscode: "VS Code",
  "vscode-insiders": "Insiders",
  "visual-studio": "Visual Studio",
};

function ActionLink({ href, children, primary = false }: ActionLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={getActionClassName(primary)}
    >
      {children}
    </a>
  );
}

function ActionButton({
  children,
  onClick,
  busyLabel = "Working",
  successLabel = "Done",
}: ActionButtonProps) {
  const [label, setLabel] = useState<React.ReactNode>(children);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLabel(children);
  }, [children]);

  async function handleClick() {
    if (busy) return;

    setBusy(true);
    setLabel(busyLabel);
    try {
      await onClick();
      setLabel(successLabel);
    } catch {
      setLabel("Failed");
    } finally {
      window.setTimeout(() => {
        setBusy(false);
        setLabel(children);
      }, 1800);
    }
  }

  return (
    <button
      type="button"
      className={getActionClassName()}
      disabled={busy}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

function getActionClassName(primary = false): string {
  return [
    "inline-flex h-9 items-center justify-center whitespace-nowrap border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accentSoft disabled:cursor-not-allowed disabled:opacity-70",
    primary
      ? "border-accent bg-accent text-white hover:bg-accentHover"
      : "border-line bg-surface text-ink hover:border-accent hover:bg-accentSoft hover:text-accentHover",
  ].join(" ");
}

function getPrimaryPath(item: ResourceItem): string | null {
  return item.skillFile ?? item.readmeFile ?? item.path ?? null;
}

function renderFileActions(kind: "agent" | "instructions", item: ResourceItem) {
  const path = getPrimaryPath(item);
  if (!path) return null;

  return (
    <>
      <ActionLink href={getVSCodeInstallUrl(kind, path)} primary>
        Install
      </ActionLink>
      <ActionLink href={getVSCodeInstallUrl(kind, path, true)}>
        Insiders
      </ActionLink>
      <ActionButton
        busyLabel="Downloading"
        successLabel="Downloaded"
        onClick={() => downloadFile(path)}
      >
        Download
      </ActionButton>
      <ActionButton
        busyLabel="Copying"
        successLabel="Copied"
        onClick={() => copyText(getRawGitHubUrl(path))}
      >
        Copy Link
      </ActionButton>
      <ActionLink href={getGitHubBlobUrl(path)}>GitHub</ActionLink>
    </>
  );
}

function renderSkillActions(item: ResourceItem) {
  const id = item.id ?? item.name;
  const files = getSkillDownloadFiles(item);
  const githubPath = item.skillFile ?? item.path;

  return (
    <>
      {id ? (
        <ActionButton
          busyLabel="Copying"
          successLabel="Copied"
          onClick={() => copyText(getSkillInstallCommand(id))}
        >
          Copy Install
        </ActionButton>
      ) : null}
      {id && files.length > 0 ? (
        <ActionButton
          busyLabel="Preparing"
          successLabel="Downloaded"
          onClick={() => downloadZip(`${id}.zip`, files)}
        >
          Download
        </ActionButton>
      ) : null}
      {githubPath ? <ActionLink href={getGitHubBlobUrl(githubPath)}>GitHub</ActionLink> : null}
    </>
  );
}

function renderHookActions(item: ResourceItem) {
  const files = getHookDownloadFiles(item);
  const id = item.id ?? item.path?.split("/").pop();
  const githubPath = item.readmeFile ?? item.path;

  return (
    <>
      {id && files.length > 0 ? (
        <ActionButton
          busyLabel="Preparing"
          successLabel="Downloaded"
          onClick={() => downloadZip(`${id}.zip`, files)}
        >
          Download
        </ActionButton>
      ) : null}
      {githubPath ? <ActionLink href={getGitHubBlobUrl(githubPath)}>GitHub</ActionLink> : null}
    </>
  );
}

function renderWorkflowActions(item: ResourceItem) {
  const path = getPrimaryPath(item);
  if (!path) return null;

  return (
    <>
      <ActionButton
        busyLabel="Downloading"
        successLabel="Downloaded"
        onClick={() => downloadFile(path)}
      >
        Download
      </ActionButton>
      <ActionButton
        busyLabel="Copying"
        successLabel="Copied"
        onClick={() => copyText(getRawGitHubUrl(path))}
      >
        Copy Link
      </ActionButton>
      <ActionLink href={getGitHubBlobUrl(path)}>GitHub</ActionLink>
    </>
  );
}

function renderPluginActions(item: ResourceItem) {
  const url = getPluginRepositoryUrl(item);
  if (!url) return null;

  return (
    <ActionLink href={url}>
      {item.external ? "Repository" : "GitHub"}
    </ActionLink>
  );
}

function renderToolActions(item: ResourceItem) {
  if (!item.links) return null;

  return Object.entries(item.links).map(([key, href]) => {
    if (!href) return null;
    const label = linkLabels[key] ?? key;
    return (
      <ActionLink key={key} href={href}>
        {label}
      </ActionLink>
    );
  });
}

function renderSampleActions(item: ResourceItem) {
  const url = getSampleUrl(item);
  if (!url) return null;

  return <ActionLink href={url}>Open</ActionLink>;
}

export function ResourceActions({
  resourceKind,
  item,
  onPreview,
}: ResourceActionsProps) {
  let actions: React.ReactNode;
  const previewFiles = getPreviewFiles(resourceKind, item);
  const previewAction =
    onPreview && previewFiles.length > 0 ? (
      <button
        type="button"
        className={getActionClassName()}
        onClick={() => onPreview(previewFiles, previewFiles[0].path)}
      >
        Preview
      </button>
    ) : null;

  switch (resourceKind) {
    case "agents":
      actions = renderFileActions("agent", item);
      break;
    case "instructions":
      actions = renderFileActions("instructions", item);
      break;
    case "skills":
      actions = renderSkillActions(item);
      break;
    case "hooks":
      actions = renderHookActions(item);
      break;
    case "workflows":
      actions = renderWorkflowActions(item);
      break;
    case "plugins":
      actions = renderPluginActions(item);
      break;
    case "tools":
      actions = renderToolActions(item);
      break;
    case "samples":
      actions = renderSampleActions(item);
      break;
    default:
      actions = null;
  }

  if (!actions) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      {previewAction}
      {actions}
    </div>
  );
}
