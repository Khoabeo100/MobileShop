import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    Table,
    Button,
    Input,
    InputNumber,
    Empty,
    Card,
    Divider,
    Spin,
    message,
    Tooltip,
    Modal,
    Form,
    Radio,
} from 'antd';
import { ShoppingBag, Trash2, ArrowLeft, CreditCard, ShoppingCart, Tag, Gift } from 'lucide-react';
import {
    requestCreatePayment,
    requestRemoveCartItem,
    requestUpdateInfoCart,
    requestUpdateQuantityCart,
} from '../config/request';

function CartUser() {
    const { cart: cartData, fetchCart } = useStore();
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (cartData) {
            setCart(cartData.cart || []);
            setCoupon(cartData.coupon || []);
            setLoading(false);
        }
        document.title = 'Giỏ hàng';
    }, [cartData]);

    const handleQuantityChange = async (record, value) => {
        const data = {
            productId: record.product.id,
            quantity: value,
        };
        await requestUpdateQuantityCart(data);
        await fetchCart();
    };

    const handleRemoveItem = async (record) => {
        // // This would call an API to remove item from cart
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${record.product.nameProduct} khỏi giỏ hàng?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                message.success(`Đã xóa ${record.product.nameProduct} khỏi giỏ hàng`);
                await requestRemoveCartItem(record.product.id);
                await fetchCart();
            },
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            message.warning('Vui lòng nhập mã giảm giá');
            return;
        }

        const foundCoupon = coupon.find((c) => c.nameCoupon === couponCode);
        if (foundCoupon) {
            setSelectedCoupon(foundCoupon);
            const data = {
                nameCoupon: foundCoupon.nameCoupon,
            };
            await requestUpdateInfoCart(data);
            message.success(`Áp dụng mã giảm giá ${foundCoupon.nameCoupon} thành công!`);
        } else {
            message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        }
    };

    const handleCheckout = () => {};

    const handleFinishCheckout = async (values) => {
        try {
            const data = {
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                nameCoupon: selectedCoupon?.nameCoupon,
                typePayment: values.paymentMethod,
            };
            if (values.paymentMethod === 'cod') {
                const res = await requestCreatePayment(data);
                console.log(res);
            } else if (values.paymentMethod === 'banking') {
                const res = await requestCreatePayment(data);
                console.log(res);
            }
        } catch (error) {}
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + item.totalPrice, 0);
    };

    const calculateDiscount = () => {
        if (!selectedCoupon) return 0;

        const subtotal = calculateSubtotal();
        return subtotal * (selectedCoupon.discount / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (product) => (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                        <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/products/${
                                product.imagesProduct.split(', ')[0]
                            }`}
                            alt={product.nameProduct}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <Link to={`/product/${product.id}`} className="text-gray-800 hover:text-red-500 font-medium">
                            {product.nameProduct}
                        </Link>
                        {product.discountProduct > 0 && (
                            <div className="flex items-center mt-1">
                                <span className="bg-red-100 text-red-500 text-xs px-1.5 py-0.5 rounded">
                                    Giảm {product.discountProduct}%
                                </span>
                            </div>
                        )}
                        <div className="text-gray-400 text-sm">
                            <span>Số lượng: {product.stockProduct}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'product',
            key: 'price',
            render: (product) => {
                const discountedPrice =
                    product.discountProduct > 0
                        ? product.priceProduct * (1 - product.discountProduct / 100)
                        : product.priceProduct;

                return (
                    <div>
                        <div className="font-semibold text-red-600">{discountedPrice.toLocaleString()}₫</div>
                        {product.discountProduct > 0 && (
                            <div className="text-gray-400 line-through text-sm">
                                {product.priceProduct.toLocaleString()}₫
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={record.product.stockProduct}
                    value={record.quantity}
                    onChange={(value) => handleQuantityChange(record, value)}
                    className="w-16"
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_, record) => (
                <div className="font-semibold text-red-600">{record.totalPrice.toLocaleString()}₫</div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Xóa sản phẩm">
                    <Button danger type="text" icon={<Trash2 size={16} />} onClick={() => handleRemoveItem(record)} />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header>
                <Header />
            </header>

            <main className="w-[70%] mx-auto pt-[90px] pb-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ShoppingBag className="mr-2" /> Giỏ hàng của bạn
                    </h1>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <ArrowLeft size={16} className="mr-1" /> Tiếp tục mua sắm
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm">
                                <Table
                                    columns={columns}
                                    dataSource={cart}
                                    pagination={false}
                                    rowKey="id"
                                    className="cart-table"
                                />
                            </Card>
                        </div>

                        {/* Cart Summary */}
                        <div>
                            <Card className="shadow-sm mb-4">
                                <h2 className="text-lg font-bold mb-4">Mã giảm giá</h2>
                                <div className="flex mb-4">
                                    <Input
                                        placeholder="Nhập mã giảm giá"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="mr-2"
                                        prefix={<Gift size={16} className="text-gray-400" />}
                                    />
                                    <Button type="primary" onClick={handleApplyCoupon}>
                                        Áp dụng
                                    </Button>
                                </div>

                                {coupon.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-500 mb-2">Mã giảm giá hiện có:</p>
                                        <div className="space-y-2">
                                            {coupon.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:border-blue-400 ${
                                                        selectedCoupon?.id === c.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedCoupon(c);
                                                        setCouponCode(c.nameCoupon);
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <Tag size={16} className="mr-2 text-blue-500" />
                                                        <span className="font-medium">{c.nameCoupon}</span>
                                                    </div>
                                                    <span className="text-red-600 text-sm font-medium">
                                                        Giảm giá {c.discount}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            <Card className="shadow-sm">
                                <h2 className="text-lg font-bold mb-4">Tổng đơn hàng</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{calculateSubtotal().toLocaleString()}₫</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Giảm giá</span>
                                        <span className="font-medium text-red-600">
                                            {selectedCoupon ? `-${calculateDiscount().toLocaleString()}₫` : '0₫'}
                                        </span>
                                    </div>

                                    <Divider className="my-3" />

                                    <div className="flex justify-between">
                                        <span className="font-bold">Tổng tiền</span>
                                        <span className="font-bold text-xl text-red-600">
                                            {calculateTotal().toLocaleString()}₫
                                        </span>
                                    </div>

                                    <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        block
                                        className="mt-4 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                        icon={<CreditCard className="mr-2" />}
                                        onClick={() => {
                                            navigate('/checkout');
                                        }}
                                    >
                                        TIẾN HÀNH THANH TOÁN
                                    </Button>

                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Bằng việc tiến hành thanh toán, bạn đồng ý với điều khoản sử dụng của chúng tôi
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Empty
                            image={<ShoppingCart size={64} className="mx-auto text-gray-300" />}
                            description={
                                <div className="mt-4">
                                    <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Hãy thêm sản phẩm vào giỏ hàng để mua sắm
                                    </p>
                                </div>
                            }
                        >
                            <Link to="/">
                                <Button type="primary" size="large" className="mt-4">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>
                        </Empty>
                    </div>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CartUser;
