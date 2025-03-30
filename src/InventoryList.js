const InventoryList = ({ inventory = [] }) => {
  // Ensure inventory is an array
  const items = Array.isArray(inventory) ? inventory : []; // Safeguard against non-array values

  // Log inventory type and value to debug its structure
  console.log("Inventory type:", typeof inventory);
  console.log("Inventory value:", inventory);

  if (!Array.isArray(inventory)) {
    console.error("Inventory is not an array. Received:", inventory);
    return (
      <div>
        <p>Error: Inventory data is invalid.</p>
        <p>Expected an array but received: {JSON.stringify(inventory)}</p>
      </div>
    ); // Display error message for invalid data
  }

  return (
    <div>
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={index}>
            {item.name ? item.name : <i>Unnamed Item</i>} {/* Fallback for missing name */}
            {item.quantity && <span> - Quantity: {item.quantity}</span>} {/* Optional quantity */}
          </div>
        ))
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
};

export default InventoryList;