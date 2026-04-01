import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps, Form, Input, Button, Radio, Card, Divider, message, Alert } from 'antd';
import { CreditCard, Truck, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestCreatePayment, requestGetInfoCart } from '../config/request';
import { requestAuth } from '../config/request';
import { useStore } from '../hooks/useStore';

function CheckOut() {
    const [form] = Form.useForm();
    const [cartData, setCartData] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isFilled, setIsFilled] = useState(false);
    const { dataUser } = useStore();

    useEffect(() => {
        document.title = 'Thanh toán';
    }, []);

    useEffect(() => {
        const fetchInfoCart = async () => {
            const res = await requestGetInfoCart();
            setCartData(res.metadata.cart);
            setTotalPrice(res.metadata.totalPrice);
            setDiscount(res.metadata.discount);
        };
        fetchInfoCart();
    }, []);

    useEffect(() => {
        if (dataUser && !isFilled) {
            form.setFieldsValue({
                fullName: dataUser.fullName,
                email: dataUser.email,
                phoneNumber: dataUser.phone,
                address: dataUser.address,
            });
            setIsFilled(true);
        }
    }, [dataUser, isFilled, form]);

    // const calculateSubtotal = () => {
    //     return cartData.reduce((total, item) => total + item.totalPrice, 0) || 0;
    // };

    const calculateSubtotal = () => {
        return cartData.reduce((total, item) => {
            const product = item.product;

            const discountedPrice =
                product.discountProduct > 0
                    ? product.priceProduct * (1 - product.discountProduct / 100)
                    : product.priceProduct;

            return total + discountedPrice * item.quantity;
        }, 0);
    };

    // const calculateDiscount = () => {
    //     if (!selectedCoupon) return 0;

    //     const subtotal = calculateSubtotal();
    //     return subtotal * (selectedCoupon.discount / 100);
    // };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        return (subtotal * discount) / 100;
    };
    // const calculateDiscount = () => {
    //     return (totalPrice * discount) / 100;
    // };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const handlePaymentChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const data = {
                ...values,
                typePayment: selectedPaymentMethod,
                // totalAmount: totalPrice,
                totalAmount: calculateTotal(),
            };
            if (selectedPaymentMethod === 'momo') {
                const res = await requestCreatePayment(data);
                window.open(res.metadata.payUrl, '_blank');
            } else if (selectedPaymentMethod === 'vnpay') {
                const res = await requestCreatePayment(data);
                window.open(res.metadata, '_blank');
            } else {
                const res = await requestCreatePayment(data);
                navigate(`/payment-success/${res.metadata[0].idPayment}`);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi thanh toán!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header>
                <Header />
            </header>

            <main className="w-[80%] lg:w-[70%] mx-auto pt-[90px] pb-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CreditCard className="mr-2" /> Thanh toán
                    </h1>
                    <Button
                        type="link"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => navigate('/cart')}
                    >
                        <ArrowLeft size={16} className="mr-1" /> Quay lại giỏ hàng
                    </Button>
                </div>

                <div className="mb-8">
                    <Steps
                        current={1}
                        items={[
                            {
                                title: 'Giỏ hàng',
                                icon: <ShoppingBag size={18} />,
                            },
                            {
                                title: 'Thanh toán',
                                icon: <CreditCard size={18} />,
                            },
                            {
                                title: 'Hoàn tất',
                                icon: <Check size={18} />,
                            },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Checkout form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Thông tin thanh toán</h2>

                            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                    >
                                        <Input placeholder="Nhập họ và tên" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' },
                                        ]}
                                    >
                                        <Input placeholder="Email" size="large" />
                                    </Form.Item>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                        ]}
                                    >
                                        <Input placeholder="Số điện thoại" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        name="address"
                                        label="Địa chỉ nhận hàng"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                    >
                                        <Input placeholder="Địa chỉ nhận hàng" size="large" />
                                    </Form.Item>
                                </div>

                                <Form.Item name="note" label="Ghi chú">
                                    <Input.TextArea
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn"
                                        rows={3}
                                    />
                                </Form.Item>

                                <Divider />

                                <h3 className="font-bold mb-4 flex items-center">
                                    <CreditCard className="mr-2" /> Phương thức thanh toán
                                </h3>

                                <Form.Item name="paymentMethod">
                                    <Radio.Group
                                        onChange={handlePaymentChange}
                                        value={selectedPaymentMethod}
                                        className="w-full"
                                    >
                                        <div className="space-y-4">
                                            <Card
                                                className={`border cursor-pointer hover:border-blue-500 ${
                                                    selectedPaymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''
                                                }`}
                                                onClick={() => setSelectedPaymentMethod('cod')}
                                            >
                                                <Radio value="cod">
                                                    <div className="flex items-center">
                                                        <Truck className="mr-2 text-gray-500" size={20} />
                                                        <div>
                                                            <p className="font-medium">
                                                                Thanh toán khi nhận hàng (COD)
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Thanh toán bằng tiền mặt khi nhận hàng
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Card>

                                            <Card
                                                className={`border cursor-pointer hover:border-blue-500 ${
                                                    selectedPaymentMethod === 'momo' ? 'border-blue-500 bg-blue-50' : ''
                                                }`}
                                                onClick={() => setSelectedPaymentMethod('momo')}
                                            >
                                                <Radio value="momo">
                                                    <div className="flex items-center">
                                                        <div className="w-[20px] h-[20px] mr-2 rounded-full bg-[#ae2070] flex items-center justify-center">
                                                            <span className="text-white text-[10px] font-bold">M</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Thanh toán MoMo</p>
                                                            <p className="text-sm text-gray-500">
                                                                Thanh toán qua ví điện tử MoMo
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Card>

                                            <Card
                                                className={`border cursor-pointer hover:border-blue-500 ${
                                                    selectedPaymentMethod === 'vnpay'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : ''
                                                }`}
                                                onClick={() => setSelectedPaymentMethod('vnpay')}
                                            >
                                                <Radio value="vnpay">
                                                    <div className="flex items-center">
                                                        <div className="w-[20px] h-[20px] mr-2 rounded bg-[#0066cc] flex items-center justify-center">
                                                            <span className="text-white text-[10px] font-bold">VN</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Thanh toán VNPay</p>
                                                            <p className="text-sm text-gray-500">
                                                                Thanh toán qua cổng thanh toán VNPay
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Card>
                                        </div>
                                    </Radio.Group>
                                </Form.Item>

                                {selectedPaymentMethod !== 'cod' && (
                                    <Alert
                                        message="Thông tin thanh toán"
                                        description={`Bạn sẽ được chuyển đến cổng thanh toán ${
                                            selectedPaymentMethod === 'momo'
                                                ? 'MoMo'
                                                : selectedPaymentMethod === 'vnpay'
                                                  ? 'VNPay'
                                                  : 'QR'
                                        } để hoàn tất giao dịch sau khi xác nhận đơn hàng.`}
                                        type="info"
                                        showIcon
                                        className="mb-4"
                                    />
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        danger
                                        htmlType="submit"
                                        size="large"
                                        className="h-12 mt-4"
                                        block
                                        loading={loading}
                                    >
                                        XÁC NHẬN ĐẶT HÀNG
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>

                    {/* Order summary */}
                    <div>
                        <Card className="shadow-sm sticky top-4">
                            <h2 className="text-lg font-bold mb-4">Tổng đơn hàng</h2>

                            <div className="space-y-4">
                                {/* Cart Items Summary */}
                                <div className="max-h-[300px] overflow-y-auto pr-2">
                                    {cartData.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start mb-3 pb-3 border-b border-gray-100"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 border border-gray-200 rounded overflow-hidden mr-3">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/products/${
                                                        item.product.imagesProduct.split(', ')[0]
                                                    }`}
                                                    alt={item.product.nameProduct}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                    {item.product.nameProduct}
                                                </p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                                                    <span>
                                                        {item.product.discountProduct > 0 && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="bg-red-100 text-red-500 text-xs px-1.5 py-0.5 rounded">
                                                                    Giảm {item.product.discountProduct}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </span>
                                                    {/* <span className="text-sm font-medium text-red-600">
                                                        {item.totalPrice.toLocaleString()}₫
                                                    </span> */}
                                                    <span className="text-sm font-medium text-red-600">
                                                        {(() => {
                                                            const product = item.product;

                                                            const discountedPrice =
                                                                product.discountProduct > 0
                                                                    ? product.priceProduct *
                                                                      (1 - product.discountProduct / 100)
                                                                    : product.priceProduct;

                                                            return (
                                                                <div>
                                                                    <div className="font-semibold text-red-600">
                                                                        {(
                                                                            discountedPrice * item.quantity
                                                                        ).toLocaleString()}
                                                                        ₫
                                                                    </div>

                                                                    {product.discountProduct > 0 && (
                                                                        <div className="text-gray-400 line-through text-sm">
                                                                            {(
                                                                                product.priceProduct * item.quantity
                                                                            ).toLocaleString()}
                                                                            ₫
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Divider className="my-3" />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{calculateSubtotal().toLocaleString()}₫</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Giảm giá</span>
                                        <span className="font-medium text-red-600">
                                            {calculateDiscount() > 0
                                                ? `-${calculateDiscount().toLocaleString()}₫`
                                                : '0₫'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-medium">Miễn phí</span>
                                    </div>

                                    <Divider className="my-3" />

                                    <div className="flex justify-between">
                                        <span className="font-bold">Tổng thanh toán</span>
                                        <span className="font-bold text-xl text-red-600">
                                            {calculateTotal().toLocaleString()}₫
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-4">
                                    Bằng việc tiến hành đặt hàng, bạn đồng ý với điều khoản dịch vụ và chính sách bảo
                                    mật của chúng tôi
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CheckOut;
