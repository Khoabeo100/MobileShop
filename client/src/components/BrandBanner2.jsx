import Slider from 'react-slick';

function BrandBanner2() {
    const banners = [
        {
            img: 'https://cdni.dienthoaivui.com.vn/690x300,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/439b5c7c7ad6d52c12d8858999fb5ecc.gif',
            alt: 'ShopeePay',
        },
        {
            img: 'https://cdni.dienthoaivui.com.vn/690x300,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/439b5c7c7ad6d52c12d8858999fb5ecc.gif',
            alt: 'Kredivo',
        },
        {
            img: 'https://cdni.dienthoaivui.com.vn/690x300,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/439b5c7c7ad6d52c12d8858999fb5ecc.gif',
            alt: 'Trả góp',
        },
        {
            img: 'https://cdni.dienthoaivui.com.vn/690x300,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/439b5c7c7ad6d52c12d8858999fb5ecc.gif',
            alt: 'Trả góp',
        },
        {
            img: 'https://cdni.dienthoaivui.com.vn/690x300,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/439b5c7c7ad6d52c12d8858999fb5ecc.gif',
            alt: 'Trả góp',
        },
    ];

    const settings = {
        dots: false,
        infinite: true,
        speed: 2000,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        arrows: false,
        pauseOnHover: true,
    };

    return (
        <div className="mt-6">
            {/* Tiêu đề */}
            <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-500 mr-2"></div>
                <h4 className="text-lg font-bold uppercase text-gray-800">Ưu đãi học sinh - sinh viên</h4>
            </div>

            {/* Carousel */}
            <Slider {...settings}>
                {banners.map((banner, index) => (
                    <div key={index} className="px-2">
                        <div className="overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                            <img
                                src={banner.img}
                                alt={banner.alt}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default BrandBanner2;
