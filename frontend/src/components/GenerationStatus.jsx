import { LoaderCircle, TriangleAlert, RotateCw, X } from "lucide-react";

function GenerationStatus({ status, error, onRetry, onCancel }) {
  if (status === "loading") {
    return (
      <div className="status-card" role="status" aria-live="polite">
        <LoaderCircle size={22} className="spin" />
        <div>
          <strong>Generating your study material...</strong>
          <p>This usually takes a few seconds, but can take up to a minute.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel}>
          <X size={16} />
          Cancel
        </button>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="status-card status-error" role="alert">
        <TriangleAlert size={22} />
        <div>
          <strong>Couldn't generate study material</strong>
          <p>{error.message}</p>
        </div>
        {error.retryable && (
          <button type="button" className="secondary-button" onClick={onRetry}>
            <RotateCw size={16} />
            Try again
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default GenerationStatus;