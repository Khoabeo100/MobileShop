import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Title, Text } = Typography;

function LoginAdmin() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false,
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData.username || !formData.password) {
            message.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (formData.username.length < 3) {
            message.error('Tên đăng nhập phải có ít nhất 3 ký tự!');
            return;
        }

        if (formData.password.length < 6) {
            message.error('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Login values:', formData);
            message.success('Đăng nhập thành công!');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                {/* Floating orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div
                    className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
                    style={{ animationDelay: '2s' }}
                ></div>
                <div
                    className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
                    style={{ animationDelay: '4s' }}
                ></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    {/* Glass Card */}
                    <Card
                        className="backdrop-blur-xl shadow-2xl"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <UserOutlined className="text-2xl text-white" />
                            </div>
                            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
                                Admin Portal
                            </Title>
                            <Text style={{ color: '#d1d5db' }}>Đăng nhập để truy cập hệ thống quản trị</Text>
                        </div>

                        {/* Login Form */}
                        <div className="space-y-4">
                            <div>
                                <Input
                                    size="large"
                                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                                    placeholder="Tên đăng nhập"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                    }}
                                    className="hover:bg-opacity-20 focus:bg-opacity-20"
                                />
                            </div>

                            <div>
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                    }}
                                    className="hover:bg-opacity-20 focus:bg-opacity-20"
                                />
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <Checkbox
                                    checked={formData.remember}
                                    onChange={(e) => handleInputChange('remember', e.target.checked)}
                                    style={{ color: '#d1d5db' }}
                                >
                                    <span style={{ color: '#d1d5db' }}>Ghi nhớ đăng nhập</span>
                                </Checkbox>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                loading={loading}
                                block
                                onClick={handleSubmit}
                                className="h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                    border: 'none',
                                    height: '48px',
                                }}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-6">
                            <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
                                © 2025 Admin Portal. Bảo mật & An toàn.
                            </Text>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default LoginAdmin;
