import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Youtube,
    Instagram,
    Shield,
    Truck,
    RotateCcw,
    CreditCard,
    Smartphone,
} from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Cột 1: Hỗ trợ khách hàng */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-red-400" />
                                Tổng đài hỗ trợ
                            </h3>
                            <div className="space-y-3 text-gray-300">
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <p className="text-sm text-gray-400">Mua hàng & Bảo hành</p>
                                    <p className="text-xl font-bold text-red-400">1800.2097</p>
                                    <p className="text-xs text-gray-500">7h30 - 22h00</p>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <p className="text-sm text-gray-400">Khiếu nại</p>
                                    <p className="text-xl font-bold text-orange-400">1800.2063</p>
                                    <p className="text-xs text-gray-500">8h00 - 21h30</p>
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-green-400" />
                                Thanh toán
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                                {['VNPAY', 'MOMO', 'ZALO'].map((pay, i) => (
                                    <div
                                        key={i}
                                        className="bg-white text-slate-800 text-xs font-medium px-2 py-2 rounded text-center hover:bg-gray-100 transition-colors"
                                    >
                                        {pay}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Chính sách */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-400" />
                            Chính sách
                        </h3>
                        <div className="space-y-2">
                            {[
                                'Mua hàng và thanh toán Online',
                                'Mua hàng trả góp Online',
                                'Chính sách giao hàng',
                                'Chính sách đổi trả',
                                'Tra điểm Smember',
                                'Xem ưu đãi Smember',
                                'Tra thông tin bảo hành',
                                'Tra cứu hoá đơn điện tử',
                                'Chính sách bảo mật',
                                'VAT Refund',
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="block text-gray-300 hover:text-red-400 transition-colors text-sm py-1 hover:translate-x-1 transition-transform"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Cột 3: Dịch vụ */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-purple-400" />
                            Dịch vụ
                        </h3>
                        <div className="space-y-2">
                            {[
                                'Khách hàng doanh nghiệp (B2B)',
                                'Ưu đãi thanh toán',
                                'Quy chế hoạt động',
                                'Chính sách Bảo hành',
                                'Liên hệ hợp tác kinh doanh',
                                'Tuyển dụng',
                                'Dịch vụ bảo hành mở rộng',
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="block text-gray-300 hover:text-red-400 transition-colors text-sm py-1 hover:translate-x-1 transition-transform"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Cột 4: Kết nối & Đăng ký */}
                    <div className="space-y-6">
                        {/* Social Media */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Kết nối với chúng tôi</h3>
                        </div>

                        {/* Newsletter */}
                        <div className="bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-xl max-w-sm mx-auto">
                            <p className="text-gray-500 text-sm mb-6">Đăng ký ngay để nhận ưu đãi hấp dẫn!</p>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="📧 Email của bạn"
                                        className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="📱 Số điện thoại"
                                        className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                    />
                                </div>

                                {/* Checkbox */}
                                <label className="flex items-center text-gray-600 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                                    />
                                    Tôi đồng ý với điều khoản sử dụng
                                </label>

                                {/* Button */}
                                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-all transform hover:scale-[1.02] shadow-md">
                                    Đăng ký ngay ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">
                                © 2026 <span className="text-red-400 font-semibold">KB Mobile Shop</span>. Tất cả quyền
                                được bảo lưu.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Địa chỉ: Số 98 Phố Dương Quảng Hàm, Phường Nghĩa Đô, TP. Hà Nội
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center">
                                <Truck className="w-4 h-4 mr-1 text-green-400" />
                                Miễn phí vận chuyển
                            </div>
                            <div className="flex items-center">
                                <RotateCcw className="w-4 h-4 mr-1 text-blue-400" />
                                Đổi trả dễ dàng
                            </div>
                            <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-1 text-purple-400" />
                                Bảo hành chính hãng
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
