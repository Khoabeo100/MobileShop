import React, { useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import { requestLogin, requestLoginGoogle } from '../config/request';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Đăng nhập';
    }, []);

    const handleLogin = async (values) => {
        try {
            await requestLogin(values);
            navigate('/');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            toast.success('Đăng nhập thành công');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const res = await requestLoginGoogle({ credential });
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="max-w-[70%] w-full flex">
                {/* Header */}
                <header className="absolute top-0 left-0 w-full">
                    <Header />
                </header>

                {/* Left - Benefits */}
                <div className="flex-1 bg-white p-12 flex flex-col justify-center">
                    <div className="max-w-lg">
                        {/* Logo */}
                        <div className="flex items-center mb-8 space-x-3">
                            <img src="/src/assets/images/logorm.png" alt="" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nhập hội khách hàng thành viên</h1>
                        <p className="text-gray-600 mb-8">Để không bỏ lỡ các ưu đãi hấp dẫn</p>

                        {/* Benefits */}
                        <div className="border-2 border-red-600 border-dashed rounded-2xl p-8 mb-8 bg-red-50/30 space-y-5">
                            {[
                                'Chiết khấu đến 5% khi mua các sản phẩm ',
                                'Miễn phí giao hàng cho thành viên SMEM, SVIP và đơn từ 300.000đ',
                                'Tặng voucher sinh nhật đến 500.000đ',
                                'Trợ giá thu cũ lên đời đến 1 triệu',
                                'Tháng hàng nhận voucher đến 300.000đ',
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-center">
                                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-white text-sm">🎁</span>
                                    </div>
                                    <span className="text-gray-800">
                                        <strong className="font-semibold">{text.split(' ')[0]}</strong>{' '}
                                        {text.substring(text.indexOf(' ') + 1)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Image */}
                    </div>
                </div>

                {/* Right - Form */}
                <div className="w-[420px] bg-white shadow-2xl flex flex-col p-8 mt-20">
                    <h1 className="text-3xl font-bold text-red-600 mb-6">Đăng nhập </h1>

                    <Form form={form} layout="vertical" onFinish={handleLogin} className="flex-1 space-y-5">
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Nhập email" className="h-12 rounded-lg border-gray-300" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu"
                                className="h-12 rounded-lg border-gray-300"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full h-14 bg-red-600 hover:bg-red-700 border-none rounded-lg font-semibold text-base shadow-lg"
                        >
                            Đăng nhập
                        </Button>

                        <div className="text-center">
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <GoogleOAuthProvider clientId="1030980060378-51co2pcmv5i11ketbk9ons66lnnmbca1.apps.googleusercontent.com">
                                <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                            </GoogleOAuthProvider>
                        </div>
                    </Form>

                    <div className="border-t border-gray-200 pt-6 text-center text-sm">
                        <p className="mb-2">
                            Bạn chưa có tài khoản?{' '}
                            <Link to="/register" className="text-red-600 font-semibold hover:text-red-700">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
