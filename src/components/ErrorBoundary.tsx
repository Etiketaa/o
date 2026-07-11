import React from "react";

interface State {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In a real app this should be reported to a logging service
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full p-6 text-center"
          style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-hi)" }}
        >
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32 }}>
            Algo salió mal
          </h1>
          <p style={{ marginTop: 8 }}>Por favor, recarga la página.</p>
          <button
            onClick={() => location.reload()}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--color-lime)",
              color: "var(--color-bg)",
              fontWeight: 700,
            }}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
