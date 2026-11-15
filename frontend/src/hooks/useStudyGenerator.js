import { useCallback, useEffect, useRef, useState } from "react";
import { generateStudySet, isCanceled } from "../services/api";

const INITIAL_STATE = { status: "idle", error: null };

export function useStudyGenerator() {
  const [state, setState] = useState(INITIAL_STATE);

  const controllerRef = useRef(null); // the in-flight request, if any
  const requestIdRef = useRef(0); // identifies the *latest* request
  const lastRequestRef = useRef(null); // remembered so Retry can replay it

  // Resolves with the validated study set, or null if the request failed,
  // was cancelled, was ignored as a duplicate, or became stale.
  const generate = useCallback(async (request) => {
    // Duplicate-submit guard: ignore new requests while one is running.
    if (controllerRef.current) return null;

    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    lastRequestRef.current = request;

    setState({ status: "loading", error: null });

    try {
      const data = await generateStudySet(request, controller.signal);
      // Stale-response guard: a newer request or a cancel supersedes this one.
      if (requestId !== requestIdRef.current) return null;
      setState({ status: "success", error: null });
      return data;
    } catch (err) {
      if (requestId !== requestIdRef.current || isCanceled(err)) return null;
      setState({
        status: "error",
        error: {
          code: err.code ?? "UNKNOWN",
          message: err.message || "Something went wrong.",
          retryable: err.retryable ?? true,
        },
      });
      return null;
    } finally {
      if (requestId === requestIdRef.current) controllerRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    return lastRequestRef.current
      ? generate(lastRequestRef.current)
      : Promise.resolve(null);
  }, [generate]);

  // Also used to clear an old error card (nothing to abort in that case).
  const cancel = useCallback(() => {
    requestIdRef.current++; // anything still in flight is now stale
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  // Abort on unmount so a finished request never updates an unmounted component.
  useEffect(() => {
    return () => {
      requestIdRef.current++;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- we want the latest controller at unmount time
      controllerRef.current?.abort();
    };
  }, []);

  return { ...state, generate, retry, cancel };
}