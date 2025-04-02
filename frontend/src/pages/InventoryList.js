import React, { useEffect, useState } from 'react';
import InventoryComponent from '../components/InventoryList'; // Ensure correct import

function InventoryPage() { // ✅ Changed name to avoid conflict
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        fetch('/api/inventory')
            .then((response) => response.json())
            .then((data) => setInventory(data))
            .catch((error) => console.error('Failed to fetch inventory:', error));
    }, []);

    return (
        <div>
            <h1>Inventory Page</h1>
            <InventoryComponent inventory={inventory} /> {/* ✅ Use correct component */}
        </div>
    );
}

export default InventoryPage; // ✅ Changed export name
