"use client";

import { Component, type ReactNode } from "react";

type SafeBoundaryProps = {
  children: ReactNode;
  /** Rendered instead of the children if they throw. Defaults to nothing. */
  fallback?: ReactNode;
  /** Optional label for console diagnostics. */
  label?: string;
};

type SafeBoundaryState = { hasError: boolean };

/**
 * Minimal error boundary for non-critical / decorative subtrees (e.g. the WebGL
 * birds). If the wrapped tree throws at runtime - WebGL context loss, a model
 * that fails to load, a library mismatch - we swallow it and render the fallback
 * so the rest of the page keeps working instead of going blank.
 */
export class SafeBoundary extends Component<
  SafeBoundaryProps,
  SafeBoundaryState
> {
  state: SafeBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SafeBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[SafeBoundary${this.props.label ? `: ${this.props.label}` : ""}] caught a render error; showing fallback.`,
        error,
      );
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
