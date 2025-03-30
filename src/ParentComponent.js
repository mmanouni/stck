import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList";

const ParentComponent = () => {
  const [inventory, setInventory] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    // Simulate fetching data
    fetch("/api/inventory")
      .then((response) => {
        console.log("API response status:", response.status); // Log response status
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched inventory data:", data); // Log the fetched data
        if (!Array.isArray(data)) {
          console.error("Invalid inventory data:", data); // Log invalid data
          setInventory([]); // Fallback to an empty array
        } else {
          console.log("Valid inventory structure confirmed:", data); // Additional logging
          setInventory(data); // Set valid data
        }
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
        setError(error); // Set error state
        setInventory([]); // Fallback to an empty array on error
      })
      .finally(() => {
        console.log("Finished fetching inventory."); // Log completion
        setLoading(false); // Stop loading
      });
  }, []);

  if (loading) {
    return <p>Loading inventory...</p>; // Display loading message
  }

  if (error) {
    return (
      <div>
        <p>Error loading inventory: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!inventory.length) {
    return <p>No inventory data available.</p>; // Fallback for empty inventory
  }

  return <InventoryList inventory={inventory} />;
};

export default ParentComponent;
