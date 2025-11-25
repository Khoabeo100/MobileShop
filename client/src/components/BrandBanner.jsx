import { useEffect } from 'react';
import { requestGetBanner } from '../config/request';
import { useState } from 'react';

function BrandBanner() {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            const res = await requestGetBanner();
            setBanners(res.data);
        };
        fetchBanners();
    }, []);

    return (
        <div className="mt-6">
            {/* Tiêu đề */}
            <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-500 mr-2"></div>
                <h4 className="text-lg font-bold uppercase text-gray-800">Ưu đãi thanh toán</h4>
            </div>

            {/* Danh sách banner */}
            <div className="grid grid-cols-3 gap-4">
                {banners.slice(0, 3).map((banner, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                        <img
                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/website/${banner.banner}`}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BrandBanner;
