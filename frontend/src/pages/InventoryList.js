import React, { useEffect, useState } from 'react';
import InventoryList from '../../components/InventoryList';

function InventoryList() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // Simulate fetching inventory data
        fetch('/api/inventory')
            .then((response) => response.json())
            .then((data) => setInventory(data))
            .catch((error) => console.error('Failed to fetch inventory:', error));
    }, []);

    return (
        <div>
            <h1>Inventory Page</h1>
            <InventoryList inventory={inventory} />
        </div>
    );
}

export default InventoryList;
