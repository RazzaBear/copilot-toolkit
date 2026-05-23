import { useEffect, useId, useRef, useState } from "react";
import type { PreviewFile } from "../lib/resource-actions";
import {
  copyText,
  downloadFile,
  fetchRawFile,
  getGitHubBlobUrl,
} from "../lib/resource-actions";

interface FilePreviewModalProps {
  open: boolean;
  title: string;
  files: PreviewFile[];
  initialPath: string;
  onClose: () => void;
}

type LoadState =
  | { status: "idle"; content: "" }
  | { status: "loading"; content: "" }
  | { status: "success"; content: string }
  | { status: "error"; content: ""; message: string };

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function FilePreviewModal({
  open,
  title,
  files,
  initialPath,
  onClose,
}: FilePreviewModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [selectedPath, setSelectedPath] = useState(initialPath);
  const [loadState, setLoadState] = useState<LoadState>({
    status: "idle",
    content: "",
  });
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [downloadLabel, setDownloadLabel] = useState("Download");

  const currentFile =
    files.find((file) => file.path === selectedPath) ?? files[0] ?? null;

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSelectedPath(initialPath);
    setCopyLabel("Copy");
    setDownloadLabel("Download");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus();
      }
    };
  }, [initialPath, open]);

  useEffect(() => {
    if (!open || !selectedPath) return;

    let cancelled = false;
    setLoadState({ status: "loading", content: "" });
    setCopyLabel("Copy");
    setDownloadLabel("Download");

    fetchRawFile(selectedPath)
      .then((content) => {
        if (!cancelled) {
          setLoadState({ status: "success", content });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            content: "",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load preview.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedPath]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || !currentFile) return null;

  async function handleCopy() {
    if (loadState.status !== "success") return;

    try {
      await copyText(loadState.content);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Failed");
    } finally {
      window.setTimeout(() => setCopyLabel("Copy"), 1800);
    }
  }

  async function handleDownload() {
    if (!currentFile) return;

    setDownloadLabel("Downloading");
    try {
      await downloadFile(currentFile.path);
      setDownloadLabel("Downloaded");
    } catch {
      setDownloadLabel("Failed");
    } finally {
      window.setTimeout(() => setDownloadLabel("Download"), 1800);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse/70 p-3 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[88vh] min-h-0 w-full max-w-[1100px] flex-col border border-line bg-surface shadow-2xl"
      >
        <header className="flex flex-col gap-3 border-b border-line p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl font-semibold text-ink">
                {title}
              </h2>
              <p className="mt-1 break-all font-mono text-xs text-subtle">
                {currentFile.path}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center border border-line bg-surface px-3 text-sm font-medium text-ink transition hover:border-accent hover:bg-accentSoft hover:text-accentHover focus:outline-none focus:ring-2 focus:ring-accentSoft disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loadState.status !== "success"}
                onClick={handleCopy}
              >
                {copyLabel}
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center border border-line bg-surface px-3 text-sm font-medium text-ink transition hover:border-accent hover:bg-accentSoft hover:text-accentHover focus:outline-none focus:ring-2 focus:ring-accentSoft"
                onClick={handleDownload}
              >
                {downloadLabel}
              </button>
              <a
                href={getGitHubBlobUrl(currentFile.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center border border-line bg-surface px-3 text-sm font-medium text-ink transition hover:border-accent hover:bg-accentSoft hover:text-accentHover focus:outline-none focus:ring-2 focus:ring-accentSoft"
              >
                GitHub
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close preview"
                className="inline-flex h-9 w-9 items-center justify-center border border-line bg-surface text-lg leading-none text-ink transition hover:border-accent hover:bg-accentSoft hover:text-accentHover focus:outline-none focus:ring-2 focus:ring-accentSoft"
                onClick={onClose}
              >
                x
              </button>
            </div>
          </div>
          {files.length > 1 ? (
            <label className="flex max-w-lg flex-col gap-1 text-sm font-medium text-muted">
              File
              <select
                className="h-10 border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accentSoft"
                value={selectedPath}
                onChange={(event) => setSelectedPath(event.target.value)}
              >
                {files.map((file) => (
                  <option key={file.path} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-inverse">
          {loadState.status === "loading" || loadState.status === "idle" ? (
            <div className="p-6 font-mono text-sm text-inverseMuted">
              Loading preview...
            </div>
          ) : null}
          {loadState.status === "error" ? (
            <div className="space-y-3 p-6 text-sm text-inverseMuted">
              <p className="font-semibold">Unable to load preview.</p>
              <p className="break-all font-mono text-inverseMuted">
                {currentFile.path}
              </p>
              <p className="text-inverseMuted">{loadState.message}</p>
              <a
                href={getGitHubBlobUrl(currentFile.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center border border-lineStrong px-3 font-medium text-white transition hover:border-white focus:outline-none focus:ring-2 focus:ring-accentMuted"
              >
                Open on GitHub
              </a>
            </div>
          ) : null}
          {loadState.status === "success" ? (
            <pre className="min-h-full overflow-auto p-5 text-sm leading-6 text-slate-100">
              <code>{loadState.content}</code>
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
