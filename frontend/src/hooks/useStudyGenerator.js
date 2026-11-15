import { useCallback, useEffect, useRef, useState } from "react";
import { generateStudySet, isCanceled } from "../services/api";

const INITIAL_STATE = { status: "idle", data: null, error: null };

export function useStudyGenerator() {
  const [state, setState] = useState(INITIAL_STATE);

  const controllerRef = useRef(null); // the in-flight request, if any
  const requestIdRef = useRef(0); // identifies the *latest* request
  const lastRequestRef = useRef(null); // remembered so Retry can replay it

  const generate = useCallback(async (request) => {
    // Duplicate-submit guard: ignore new requests while one is running.
    if (controllerRef.current) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    lastRequestRef.current = request;

    setState({ status: "loading", data: null, error: null });

    try {
      const data = await generateStudySet(request, controller.signal);
      // Stale-response guard: a newer request or a cancel supersedes this one.
      if (requestId !== requestIdRef.current) return;
      setState({ status: "success", data, error: null });
    } catch (err) {
      if (requestId !== requestIdRef.current || isCanceled(err)) return;
      setState({
        status: "error",
        data: null,
        error: {
          code: err.code ?? "UNKNOWN",
          message: err.message || "Something went wrong.",
          retryable: err.retryable ?? true,
        },
      });
    } finally {
      if (requestId === requestIdRef.current) controllerRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    if (lastRequestRef.current) generate(lastRequestRef.current);
  }, [generate]);

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