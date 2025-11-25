import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { requestGetPaymentById } from '../config/request';
import { Result, Card, Descriptions, Steps, Button, Tag, Spin, Typography, Divider } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, DollarCircleFilled, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function PaymentSuccess() {
    const { id } = useParams();
    const [payment, setPayment] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await requestGetPaymentById(id);
                setPayment(res.metadata[0]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment:', error);
                setLoading(false);
            }
        };
        document.title = 'Thanh toán thành công';
        fetchPayment();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'pending':
                return 1;
            case 'processing':
                return 1;
            case 'shipping':
                return 2;
            case 'completed':
                return 3;
            case 'cancelled':
                return 0;
            default:
                return 0;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'blue';
            case 'processing':
                return 'processing';
            case 'shipping':
                return 'warning';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header>
                <Header />
            </header>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Result
                    status="success"
                    title="Thanh toán thành công!"
                    subTitle={`Mã đơn hàng: ${payment?.idPayment || 'N/A'}`}
                    extra={[
                        <Link to="/" key="home">
                            <Button type="primary" icon={<HomeOutlined />}>
                                Về trang chủ
                            </Button>
                        </Link>,
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2">
                        <Card
                            title={
                                <div className="flex items-center gap-2">
                                    <DollarCircleFilled className="text-green-500" />
                                    <span>Thông tin đơn hàng</span>
                                </div>
                            }
                            className="shadow-md"
                        >
                            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                                <Descriptions.Item label="Mã đơn hàng">{payment?.idPayment || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Tag color="green">{payment?.typePayment?.toUpperCase() || 'N/A'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt hàng">
                                    {payment?.createdAt ? new Date(payment.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={getStatusColor(payment?.status)}>
                                        {payment?.status === 'pending'
                                            ? 'Đang xử lý'
                                            : payment?.status === 'completed'
                                            ? 'Hoàn thành'
                                            : payment?.status === 'shipping'
                                            ? 'Đang giao hàng'
                                            : payment?.status === 'cancelled'
                                            ? 'Đã hủy'
                                            : 'Đang xử lý'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền" span={2}>
                                    <Typography.Text strong className="text-lg text-red-500">
                                        {formatPrice(payment?.totalPrice || 0)}
                                    </Typography.Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left">Tiến độ đơn hàng</Divider>
                            <Steps
                                current={getStatusStep(payment?.status)}
                                items={[
                                    {
                                        title: 'Đặt hàng',
                                        description: 'Đã đặt hàng',
                                        icon: <CheckCircleFilled />,
                                    },
                                    {
                                        title: 'Đang xử lý',
                                        description: 'Đang chuẩn bị hàng',
                                        icon: <ClockCircleFilled />,
                                    },
                                    {
                                        title: 'Hoàn thành',
                                        description: 'Đơn hàng hoàn thành',
                                    },
                                ]}
                            />
                        </Card>

                        <Card title="Sản phẩm đã mua" className="shadow-md mt-6">
                            <div className="flex items-start gap-4 p-4 border rounded-md">
                                {payment?.product?.imagesProduct && (
                                    <img
                                        src={`${
                                            import.meta.env.VITE_API_URL
                                        }/uploads/products/${payment.product.imagesProduct.split(',')[0].trim()}`}
                                        alt={payment.product.nameProduct}
                                        className="w-24 h-24 object-cover rounded-md"
                                    />
                                )}
                                <div className="flex-1">
                                    <Typography.Title level={5}>{payment?.product?.nameProduct}</Typography.Title>
                                    <div className="flex justify-between items-center mt-2">
                                        <Typography.Text type="secondary">
                                            Số lượng: {payment?.quantity || 1}
                                        </Typography.Text>
                                        <Typography.Text strong className="text-red-500">
                                            {formatPrice(payment?.product?.priceProduct || 0)}
                                        </Typography.Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div>
                        <Card title="Thông tin khách hàng" className="shadow-md">
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Họ và tên">{payment?.fullName || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {payment?.phoneNumber || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">{payment?.email || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{payment?.address || 'N/A'}</Descriptions.Item>
                                {payment?.note && <Descriptions.Item label="Ghi chú">{payment.note}</Descriptions.Item>}
                            </Descriptions>

                            <div className="mt-6">
                                <Descriptions column={1} bordered title="Thông tin thanh toán">
                                    <Descriptions.Item label="Tổng tiền sản phẩm">
                                        {formatPrice(payment?.product?.priceProduct * (payment?.quantity || 1) || 0)}
                                    </Descriptions.Item>
                                    {payment?.nameCoupon && (
                                        <Descriptions.Item label="Mã giảm giá">
                                            <Tag color="orange">{payment.nameCoupon}</Tag>
                                        </Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="Tổng thanh toán">
                                        <Typography.Text strong className="text-lg text-red-500">
                                            {formatPrice(payment?.totalPrice || 0)}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PaymentSuccess;
