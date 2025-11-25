import { useState, useEffect } from 'react';

import CardBody from '../../../components/Cardbody';
import { useStore } from '../../../hooks/useStore';

function FavoriteProducts() {
    const { favorites } = useStore();

    return (
        <div className="grid grid-cols-4 gap-4">
            {favorites.map((item) => (
                <CardBody data={item.product} />
            ))}
        </div>
    );
}

export default FavoriteProducts;
