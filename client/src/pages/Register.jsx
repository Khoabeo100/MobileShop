import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, DatePicker } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { requestRegister } from '../config/request';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Đăng ký';
    }, []);

    const handleSuccess = async (response) => {
        const { credential } = response;
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

    const onFinish = async (values) => {
        const data = {
            ...values,
            birthDay: values.birthDay.format('YYYY-MM-DD'),
        };
        try {
            const res = await requestRegister(data);
            toast.success(res.message);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
            <Header />
            <div className="w-[70%] mx-auto p-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <img
                            className="w-[100px] h-[100px] mx-auto"
                            src="https://cdn-static.smember.com.vn/_next/static/media/register-ant.b75b959d.png"
                            alt=""
                        />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký</h1>
                        <p className="text-gray-600">Tạo tài khoản để nhận ưu đãi độc quyền</p>
                    </div>

                    {/* Google */}
                    <div className="flex justify-center mb-6">
                        <GoogleOAuthProvider clientId="557300558214-bj5j50chf3p3skos4hg3tsfv1ivivtst.apps.googleusercontent.com">
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>
                    </div>

                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-sm text-gray-500">Hoặc điền thông tin</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Form */}
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên" prefix={<UserOutlined />} />
                            </Form.Item>
                            <Form.Item
                                name="birthDay"
                                label="Ngày sinh"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày sinh"
                                    prefix={<CalendarOutlined />}
                                />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input placeholder="Nhập SĐT" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' },
                                ]}
                            >
                                <Input placeholder="Nhập email" prefix={<MailOutlined />} />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" prefix={<LockOutlined />} />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Nhập lại"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Xác nhận mật khẩu" prefix={<LockOutlined />} />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="agreeTerms"
                            valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Vui lòng đồng ý với điều khoản')),
                                },
                            ]}
                        >
                            <Checkbox>
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-red-600">
                                    Điều khoản sử dụng
                                </a>{' '}
                                và{' '}
                                <a href="#" className="text-red-600">
                                    Chính sách bảo mật
                                </a>
                            </Checkbox>
                        </Form.Item>

                        <div className="flex gap-3 pt-3">
                            <Link to="/login" className="flex-1">
                                <Button block>Quay lại đăng nhập</Button>
                            </Link>
                            <Button type="primary" htmlType="submit" className="flex-1">
                                Hoàn tất đăng ký
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}
