import ErrorBoundary from './ErrorBoundary';

function InventoryList({ inventory }) {
    // Debug log to check the type of inventory
    console.debug('InventoryList received inventory:', inventory);

    // Ensure inventory is an array and log a warning if it's not
    const inventoryArray = Array.isArray(inventory) ? inventory : [];
    if (!Array.isArray(inventory)) {
        console.warn('InventoryList: Expected inventory to be an array, but received:', typeof inventory, inventory);
    }

    return (
        <ErrorBoundary>
            <div>
                {inventoryArray.length > 0 ? (
                    inventoryArray.map((item, index) => (
                        <div key={index}>{item?.name || 'Unnamed Item'}</div>
                    ))
                ) : (
                    <div>No items available</div>
                )}
            </div>
        </ErrorBoundary>
    );
}

// Set a default prop to ensure inventory is always defined
InventoryList.defaultProps = {
    inventory: [],
};

export default InventoryList;
