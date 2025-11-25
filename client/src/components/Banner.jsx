import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { requestGetBanner, requestGetNotication } from '../config/request';
import moment from 'moment';
import { Link } from 'react-router-dom';

function Banner({ categories }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            const res = await requestGetBanner();
            setBanners(res.data);
        };

        fetchBanners();
    }, []);

    // Auto-play slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    return (
        <div className="w-full py-4 bg-gray-50">
            <div className="w-full mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Brand Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 max-h-[400px] overflow-hidden flex flex-col">
                            <h3 className="font-semibold text-gray-800 mb-3 text-sm">DANH MUC THƯƠNG HIỆU</h3>
                            <div
                                className="flex-1 overflow-y-scroll pr-1"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}
                            >
                                <ul className="space-y-1">
                                    {categories.map((brand, index) => (
                                        <Link to={`/category/${brand.id}`}>
                                            <li key={index}>
                                                <button className="w-full text-left text-sm text-gray-600 hover:text-red-600 hover:bg-gray-50 py-2 px-3 rounded transition-colors">
                                                    {brand.nameCategory}
                                                </button>
                                            </li>
                                        </Link>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Main Banner Slider */}
                    <div className="lg:col-span-4">
                        <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="relative h-[400px] overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out h-full"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {banners.map((slide, index) => (
                                        <div key={slide.id} className="w-full flex-shrink-0">
                                            <img
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/website/${
                                                    slide.banner
                                                }`}
                                                alt={`Banner ${index + 1}`}
                                                className="w-full h-full rounded-lg object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Banner;
