import JSZip from "jszip";
import type { ResourceKind } from "../data/routes";
import type { ResourceItem, ResourceFile } from "../data/types";

export const REPO_IDENTIFIER = "github/awesome-copilot";
export const REPO_RAW_BASE =
  "https://raw.githubusercontent.com/github/awesome-copilot/main";
export const REPO_BLOB_BASE =
  "https://github.com/github/awesome-copilot/blob/main";

export interface ZipDownloadFile {
  name: string;
  path: string;
}

export interface PreviewFile {
  name: string;
  path: string;
}

type InstallType = "agent" | "instructions";

const VSCODE_INSTALL_CONFIG: Record<
  InstallType,
  { baseUrl: string; scheme: string }
> = {
  agent: {
    baseUrl: "https://aka.ms/awesome-copilot/install/agent",
    scheme: "chat-agent",
  },
  instructions: {
    baseUrl: "https://aka.ms/awesome-copilot/install/instructions",
    scheme: "chat-instructions",
  },
};

export function getRawGitHubUrl(path: string): string {
  return `${REPO_RAW_BASE}/${path}`;
}

export function getGitHubBlobUrl(path: string): string {
  return `${REPO_BLOB_BASE}/${path}`;
}

export function getVSCodeInstallUrl(
  type: InstallType,
  path: string,
  insiders = false
): string {
  const config = VSCODE_INSTALL_CONFIG[type];
  const scheme = insiders ? "vscode-insiders" : "vscode";
  const rawUrl = getRawGitHubUrl(path);
  const innerUrl = `${scheme}:${config.scheme}/install?url=${encodeURIComponent(
    rawUrl
  )}`;

  return `${config.baseUrl}?url=${encodeURIComponent(innerUrl)}`;
}

export function getSkillInstallCommand(skillId: string): string {
  return `gh skills install ${REPO_IDENTIFIER} ${skillId}`;
}

export async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadFile(path: string): Promise<void> {
  const response = await fetch(getRawGitHubUrl(path));
  if (!response.ok) throw new Error(`Failed to download ${path}`);

  const blob = await response.blob();
  triggerBlobDownload(blob, path.split("/").pop() || "download");
}

export async function fetchRawFile(path: string): Promise<string> {
  const response = await fetch(getRawGitHubUrl(path));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} (${response.status})`);
  }

  return response.text();
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function toPreviewFile(file: ResourceFile): PreviewFile {
  return {
    name: file.name,
    path: file.path,
  };
}

function isPreviewableSamplePath(path: string): boolean {
  return !/^https?:\/\//i.test(path);
}

export function getPrimaryPreviewFile(
  resourceKind: ResourceKind,
  item: ResourceItem
): PreviewFile | null {
  return getPreviewFiles(resourceKind, item)[0] ?? null;
}

export function getPreviewFiles(
  resourceKind: ResourceKind,
  item: ResourceItem
): PreviewFile[] {
  switch (resourceKind) {
    case "agents":
    case "instructions":
    case "workflows":
      return item.path
        ? [{ name: getFileName(item.path), path: item.path }]
        : [];
    case "skills":
      return item.files?.map(toPreviewFile) ?? [];
    case "hooks":
      return getHookDownloadFiles(item);
    case "samples":
      return item.path && isPreviewableSamplePath(item.path)
        ? [{ name: getFileName(item.path), path: item.path }]
        : [];
    case "plugins":
    case "tools":
    default:
      return [];
  }
}

function toZipFile(file: ResourceFile): ZipDownloadFile {
  return {
    name: file.name,
    path: file.path,
  };
}

export function getSkillDownloadFiles(item: ResourceItem): ZipDownloadFile[] {
  return item.files?.map(toZipFile) ?? [];
}

export function getHookDownloadFiles(item: ResourceItem): ZipDownloadFile[] {
  const files: ZipDownloadFile[] = [];

  if (item.readmeFile) {
    files.push({ name: "README.md", path: item.readmeFile });
  }

  for (const asset of item.assets ?? []) {
    if (item.path) {
      files.push({ name: asset, path: `${item.path}/${asset}` });
    }
  }

  return files;
}

export async function downloadZip(
  filename: string,
  files: ZipDownloadFile[]
): Promise<void> {
  if (files.length === 0) throw new Error("No files available to download");

  const zip = new JSZip();
  const folder = zip.folder(filename.replace(/\.zip$/i, ""));
  if (!folder) throw new Error("Failed to create ZIP folder");

  const results = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(getRawGitHubUrl(file.path));
      if (!response.ok) return null;
      return { name: file.name, content: await response.text() };
    })
  );

  let addedFiles = 0;
  for (const result of results) {
    if (!result) continue;
    folder.file(result.name, result.content);
    addedFiles++;
  }

  if (addedFiles === 0) throw new Error("Failed to fetch ZIP files");

  const blob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(
    blob,
    filename.endsWith(".zip") ? filename : `${filename}.zip`
  );
}

export function getPluginRepositoryUrl(item: ResourceItem): string | null {
  if (item.source?.source === "github" && item.source.repo) {
    const base = `https://github.com/${item.source.repo}`;
    return item.source.path ? `${base}/tree/main/${item.source.path}` : base;
  }

  if (item.repository) return item.repository;
  if (item.homepage) return item.homepage;
  if (item.path) return getGitHubBlobUrl(item.path);

  return null;
}

export function getSampleUrl(item: ResourceItem): string | null {
  if (item.url) return item.url;
  if (item.links?.github) return item.links.github;
  if (item.links?.documentation) return item.links.documentation;
  if (item.path) return getGitHubBlobUrl(item.path);
  return null;
}
