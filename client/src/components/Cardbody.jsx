import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { requestAddFavouriteProduct, requestDeleteFavouriteProduct } from '../config/request';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { message } from 'antd';

function ProductCard({ data }) {
    const { favorites, fetchFavorites, setIsOpenModalAIReview, setIdProductReview } = useStore();

    const finalPrice =
        data.discountProduct > 0 ? data.priceProduct * (1 - data.discountProduct / 100) : data.priceProduct;

    const handleFavouriteProduct = async () => {
        try {
            const dataFavourite = {
                productId: data.id,
            };
            await requestAddFavouriteProduct(dataFavourite);
            fetchFavorites();
            message.success('Thêm vào yêu thích thành công');
        } catch (error) {
            message.error('Thêm vào yêu thích thất bại');
            throw error;
        }
    };

    const handleDeleteFavouriteProduct = async () => {
        try {
            const dataFavourite = {
                productId: data.id,
            };
            await requestDeleteFavouriteProduct(dataFavourite);
            fetchFavorites();
            message.error('Xóa khỏi yêu thích thành công');
        } catch (error) {
            message.error('Xóa khỏi yêu thích thất bại');
            throw error;
        }
    };

    const handleOpenModalAIReview = () => {
        setIsOpenModalAIReview(true);
        setIdProductReview(data.id);
    };

    return (
        <div className="w-[250px] rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Hình + badge */}
            <Link to={`/product/${data.id}`}>
                <div className="relative group">
                    <img
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${data.imagesProduct.split(', ')[0]}`}
                        alt={data.nameProduct}
                        className="w-full h-[250px] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {data.discountProduct > 0 && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            -{data.discountProduct}%
                        </span>
                    )}
                </div>
            </Link>

            {/* Nội dung */}
            <div className="p-4 flex flex-col gap-2">
                {/* Tên sản phẩm */}
                <h3 className="text-gray-800 font-medium leading-snug line-clamp-2 text-sm hover:text-red-500 transition-colors cursor-pointer">
                    {data.nameProduct}
                </h3>

                {/* Giá */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-600 font-bold text-lg">{finalPrice.toLocaleString()}₫</span>
                    {data.discountProduct > 0 && (
                        <span className="text-gray-400 text-sm line-through">
                            {data.priceProduct.toLocaleString()}₫
                        </span>
                    )}
                </div>

                {/* Tồn kho */}
                {data.stockProduct > 0 ? (
                    <span className="text-green-600 text-xs font-medium">Còn {data.stockProduct} sản phẩm</span>
                ) : (
                    <span className="text-red-500 text-xs font-medium">Hết hàng</span>
                )}

                {/* Đánh giá + Yêu thích */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors">
                        {favorites.some((item) => item.productId === data.id) ? (
                            <div
                                className="text-red-500 flex items-center gap-1"
                                onClick={handleDeleteFavouriteProduct}
                            >
                                <span>Bỏ yêu thích</span>
                                <Heart size={16} />
                            </div>
                        ) : (
                            <div className="text-gray-500 flex items-center gap-1" onClick={handleFavouriteProduct}>
                                <span>Yêu thích</span>
                                <Heart size={16} />
                            </div>
                        )}
                    </button>

                    <div onClick={handleOpenModalAIReview} className="flex justify-center">
                        <button className="cursor-pointer px-6 py-2 bg-blue-600 text-white font-semibold rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition duration-300 ease-in-out">
                            AI Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
