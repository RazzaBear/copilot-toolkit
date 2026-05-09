import { useEffect, useState } from "react";

export type AsyncDataState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

export function useAsyncData<T>(load: () => Promise<T>): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading", data: null, error: null });
    load()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}
