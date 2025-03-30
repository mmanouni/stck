import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong. Please try again later.</h1>
          {this.state.error && <p>Error: {this.state.error.message}</p>}
          <button onClick={() => window.location.reload()}>Reload</button>
          <p>
            If the issue persists, please{" "}
            <a href="mailto:support@example.com">contact support</a>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
