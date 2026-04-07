import { useEffect, useState } from 'react';

import { requestGetAllBlog } from '../config/request';
import { Link } from 'react-router-dom';

// function Blog() {
//     const [blogs, setBlogs] = useState([]);

//     useEffect(() => {
//         const fetchBlogs = async () => {
//             const res = await requestGetAllBlog();
//             setBlogs(res.metadata);
//         };
//         fetchBlogs();
//     }, []);

//     const banners = [
//         {
//             img: 'https://cdni.dienthoaivui.com.vn/690x300,webp,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/7c18741212c12b8e680ac044fff2be13.png',
//             alt: 'ShopeePay',
//             title: 'Không gõ được tiếng Việt trên Google Docs MacBook phải làm sao?',
//         },
//         {
//             img: 'https://cdni.dienthoaivui.com.vn/690x300,webp,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/7c18741212c12b8e680ac044fff2be13.png',
//             alt: 'Kredivo',
//             title: 'Mẹo tăng tốc hiệu năng cho điện thoại Android cũ',
//         },
//         {
//             img: 'https://cdni.dienthoaivui.com.vn/690x300,webp,q100/https://dashboard.dienthoaivui.com.vn/uploads/wp-content/uploads/images/7c18741212c12b8e680ac044fff2be13.png',
//             alt: 'Trả góp',
//             title: 'Hướng dẫn chọn mua laptop học tập giá rẻ',
//         },
//     ];

//     return (
//         <div className="mt-6">
//             {/* Tiêu đề */}
//             <div className="flex items-center mb-4">
//                 <div className="w-1 h-6 bg-red-500 mr-2"></div>
//                 <h4 className="text-lg font-bold uppercase text-gray-800">Tin tức công nghệ</h4>
//             </div>

//             {/* Danh sách blog */}
//             <div className="grid grid-cols-3 gap-6">
//                 {blogs.map((banner, index) => (
//                     <Link to={`/blog/${banner.id}`}>
//                         <div
//                             key={index}
//                             className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
//                         >
//                             <div className="overflow-hidden">
//                                 <img
//                                     src={`${import.meta.env.VITE_API_URL}/uploads/blogs/${banner.image}`}
//                                     alt={banner.title}
//                                     className="w-full h-40 object-cover hover:scale-105 transition duration-300"
//                                 />
//                             </div>
//                             <div className="p-3">
//                                 <h5 className="text-sm font-semibold text-gray-800 hover:text-red-500 transition">
//                                     {banner.title}
//                                 </h5>
//                             </div>
//                         </div>
//                     </Link>
//                 ))}
//             </div>
//         </div>
//     );
// }

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await requestGetAllBlog();
                setBlogs(res.metadata || []);
            } catch (error) {
                console.error('Fetch blogs failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="mt-6">
            <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-500 mr-2"></div>
                <h4 className="text-lg font-bold uppercase text-gray-800">Tin tức công nghệ</h4>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : blogs.length === 0 ? (
                <p>Chưa có bài viết</p>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {blogs.map((banner) => (
                        <Link key={banner.id} to={`/blog/${banner.id}`}>
                            <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
                                <div className="overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/uploads/blogs/${banner.image}`}
                                        alt={banner.title || 'blog image'}
                                        className="w-full h-40 object-cover hover:scale-105 transition duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <h5 className="text-sm font-semibold text-gray-800 hover:text-red-500 transition">
                                        {banner.title}
                                    </h5>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Blog;
