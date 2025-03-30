import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // Ensure the correct path to the App component
import ErrorBoundary from "./ErrorBoundary"; // Import the ErrorBoundary

const Root = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Ensure the 'root' div exists in index.html.");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);
