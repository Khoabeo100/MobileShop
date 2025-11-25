import img1 from '../assets/images/fs1.webp';
import img2 from '../assets/images/fs2.webp';
import img3 from '../assets/images/fs3.webp';
import img4 from '../assets/images/fs4.webp';
import img5 from '../assets/images/fs5.webp';
import Slider from 'react-slick';
import img6 from '../assets/images/img1.gif';
import { useEffect, useState } from 'react';
import { requestGetProductFlashSale } from '../config/request';
import { Link } from 'react-router-dom';

function FlashSale() {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
    };

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProductFlashSale = async () => {
            const res = await requestGetProductFlashSale();
            setProducts(res.metadata);
        };
        fetchProductFlashSale();
    }, []);

    return (
        <div>
            <img src={img6} alt="" className="w-[100%] mx-auto object-cover rounded-lg mb-20" />

            {/* Banner trên */}
            <div className="relative">
                <img className="w-full h-[70px]" src={img1} alt="" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/1">
                    <img className="w-[250px] h-[70px]" src={img2} alt="" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xl">
                        Giảm giá sâu
                    </span>
                </div>
            </div>

            {/* Ảnh 5 + Ảnh 3 và Ảnh 4 */}
            <div className="relative mt-2">
                <img src={img5} alt="" className="w-full" />
                {/* Ảnh 3 góc trái trên */}
                <img src={img3} alt="" className="absolute top-0 left-0 h-[70px] w-auto" />
                {/* Ảnh 4 góc phải trên */}
                <img src={img4} alt="" className="absolute top-0 right-0 h-[70px] w-auto" />

                {/* Slider sản phẩm */}
                <div className="absolute top-[70px] left-0 right-0 px-4">
                    <Slider {...settings}>
                        {products.map((p) => {
                            const mainImage = p.imagesProduct.split(',')[0];
                            const discount = p.discountProduct; // % giảm giá
                            const oldPrice = p.priceProduct; // nếu bạn có giá cũ, có thể dùng
                            const salePrice = Math.round(p.priceProduct * (1 - discount / 100)); // giá sau giảm

                            return (
                                <Link to={`/product/${p.id}`}>
                                    <div key={p.id} className="px-2">
                                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative group border border-gray-100">
                                            {/* Nhãn giảm giá */}
                                            {discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg">
                                                    -{discount}%
                                                </div>
                                            )}

                                            {/* Hình ảnh sản phẩm */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                                <img
                                                    src={`${
                                                        import.meta.env.VITE_URL_IMAGE
                                                    }/uploads/products/${mainImage}`}
                                                    alt={p.nameProduct}
                                                    className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                {/* Overlay hiệu ứng khi hover */}
                                            </div>

                                            {/* Card body được cải thiện */}
                                            <div className="p-4 space-y-3">
                                                {/* Thông số kỹ thuật */}
                                                <div className="min-h-[40px]">
                                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                        {p.specsProduct?.map((s) => s.value).join(', ')}
                                                    </p>
                                                </div>

                                                {/* Tên sản phẩm */}
                                                <div className="min-h-[44px]">
                                                    <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-5 group-hover:text-blue-600 transition-colors duration-300">
                                                        {p.nameProduct}
                                                    </h3>
                                                </div>

                                                {/* Giá sản phẩm */}
                                                <div className="pt-2 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="text-red-600 font-bold text-lg">
                                                                {salePrice.toLocaleString()}đ
                                                            </span>
                                                            {discount > 0 && (
                                                                <span className="text-gray-400 text-sm line-through">
                                                                    {oldPrice.toLocaleString()}đ
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </Slider>
                </div>
            </div>
        </div>
    );
}

export default FlashSale;
