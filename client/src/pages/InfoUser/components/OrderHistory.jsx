import { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Descriptions,
    Spin,
    Empty,
    Card,
    Tabs,
    Timeline,
    Steps,
    message,
    Rate,
    Form,
    Input,
    Upload,
    Row,
    Col,
} from 'antd';
import {
    ShoppingOutlined,
    EyeOutlined,
    FileDoneOutlined,
    FieldTimeOutlined,
    CarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { requestCancelPayment, requestCreatePreviewProduct, requestGetPaymentsUser } from '../../../config/request';
import moment from 'moment';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewOrder, setViewOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedProductForReview, setSelectedProductForReview] = useState(null);
    const [reviewForm] = Form.useForm();
    const fetchOrders = async () => {
        const res = await requestGetPaymentsUser();
        setOrders(res.metadata);
        setLoading(false);
    };
    // Simulated data fetching
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleViewOrder = (order) => {
        setViewOrder(order);
        setModalVisible(true);
    };

    const getStatusTag = (status) => {
        let color, text, icon;

        switch (status) {
            case 'pending':
                color = 'orange';
                text = 'Chờ xác nhận';
                icon = <FieldTimeOutlined />;
                break;
            case 'confirm':
                color = 'blue';
                text = 'Đã xác nhận';
                icon = <FileDoneOutlined />;
                break;
            case 'shipping':
                color = 'geekblue';
                text = 'Đang giao hàng';
                icon = <CarOutlined />;
                break;
            case 'success':
                color = 'green';
                text = 'Giao hàng thành công';
                icon = <CheckCircleOutlined />;
                break;
            case 'failed':
                color = 'red';
                text = 'Đã hủy';
                icon = <CloseCircleOutlined />;
                break;
            default:
                color = 'default';
                text = 'Không xác định';
                icon = <FieldTimeOutlined />;
        }

        return (
            <Tag color={color} icon={icon}>
                {text}
            </Tag>
        );
    };

    const getPaymentMethodText = (type) => {
        switch (type) {
            case 'cod':
                return 'Tiền mặt khi nhận hàng';
            case 'momo':
                return 'Ví MoMo';
            case 'vnpay':
                return 'VNPay';
            default:
                return 'Không xác định';
        }
    };

    const getPaymentMethodIcon = (type) => {
        switch (type) {
            case 'cod':
                return '💵';
            case 'momo':
                return '💳';
            case 'vnpay':
                return '💳';
            default:
                return '❓';
        }
    };

    const getOrderStatusStep = (status) => {
        switch (status) {
            case 'pending':
                return 0;
            case 'confirm':
                return 1;
            case 'shipping':
                return 2;
            case 'success':
                return 3;
            case 'failed':
                return 4;
            default:
                return 0;
        }
    };

    const handleCancelOrder = async (id) => {
        const data = {
            idPayment: id,
        };
        try {
            await requestCancelPayment(data);
            message.success('Đã hủy đơn hàng');
            fetchOrders();
        } catch (error) {
            message.error('Đã có lỗi xảy ra');
        }
    };

    const handleOpenReviewModal = (order) => {
        setViewOrder(order);
        setReviewModalVisible(true);
    };

    const handleProductSelection = (product) => {
        setSelectedProductForReview(product);
        reviewForm.resetFields();
    };

    const handleReviewSubmit = async (values) => {
        console.log(values);
        const data = {
            productId: selectedProductForReview.productId,
            rating: values.rating,
            content: values.content,
        };
        await requestCreatePreviewProduct(data);

        message.success('Đánh giá của bạn đã được gửi thành công!');
        setReviewModalVisible(false);
        setSelectedProductForReview(null);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idPayment',
            key: 'idPayment',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => (
                <div className="flex items-center">
                    <FieldTimeOutlined className="mr-1 text-gray-400" />
                    <span>{moment(text).format('DD/MM/YYYY')}</span>
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: (items) => {
                return items.slice(0, 1).map((item) => (
                    <div key={item.productId}>
                        <img
                            className="w-20 h-20 object-cover rounded-md"
                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                item?.product?.imagesProduct?.split(', ')[0]
                            }`}
                            alt={item?.product?.nameProduct}
                        />
                    </div>
                ));
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => (
                <span className="font-bold text-red-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'typePayment',
            key: 'typePayment',
            render: (type) => (
                <div className="flex items-center">
                    <span className="mr-1 text-lg">{getPaymentMethodIcon(type)}</span>
                    <span>{type.toUpperCase()}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => handleViewOrder(record)}>
                        Chi tiết
                    </Button>
                    {record.status === 'pending' && (
                        <Button
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            size="small"
                            onClick={() => handleCancelOrder(record.idPayment)}
                        >
                            Huỷ đơn
                        </Button>
                    )}
                    {record.status === 'success' && (
                        <Button
                            type="primary"
                            icon={<StarOutlined />}
                            size="small"
                            onClick={() => handleOpenReviewModal(record)}
                        >
                            Đánh giá
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const filteredOrders = activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab);

    const tabItems = [
        {
            key: 'all',
            label: 'Tất cả',
        },
        {
            key: 'pending',
            label: (
                <div className="flex items-center">
                    <FieldTimeOutlined className="mr-1" />
                    <span>Chờ xác nhận</span>
                </div>
            ),
        },
        {
            key: 'confirm',
            label: (
                <div className="flex items-center">
                    <FileDoneOutlined className="mr-1" />
                    <span>Đã xác nhận</span>
                </div>
            ),
        },
        {
            key: 'shipping',
            label: (
                <div className="flex items-center">
                    <CarOutlined className="mr-1" />
                    <span>Đang giao</span>
                </div>
            ),
        },
        {
            key: 'success',
            label: (
                <div className="flex items-center">
                    <CheckCircleOutlined className="mr-1" />
                    <span>Thành công</span>
                </div>
            ),
        },
        {
            key: 'failed',
            label: (
                <div className="flex items-center">
                    <CloseCircleOutlined className="mr-1" />
                    <span>Đã hủy</span>
                </div>
            ),
        },
    ];

    return (
        <Card className="shadow-md">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingOutlined className="text-xl text-blue-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h2>
                    <p className="text-gray-500 text-sm">Theo dõi đơn hàng và lịch sử mua sắm của bạn</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="mb-4" type="card" />

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{
                            pageSize: 5,
                            showTotal: (total) => `Tổng ${total} đơn hàng`,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '15'],
                        }}
                        className="custom-order-table"
                    />
                </div>
            ) : (
                <Empty
                    description={
                        <div>
                            <p className="text-lg font-medium">Bạn chưa có đơn hàng nào</p>
                            <p className="text-gray-500">Hãy mua sắm ngay để trải nghiệm dịch vụ của chúng tôi</p>
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_DEFAULT}
                    className="py-12"
                >
                    <Link to="/">
                        <Button type="primary" className="mt-4 bg-blue-500">
                            Mua sắm ngay
                        </Button>
                    </Link>
                </Empty>
            )}

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ShoppingOutlined className="text-blue-500" />
                        <span>Chi tiết đơn hàng</span>
                        <Tag
                            className="ml-2"
                            color={
                                viewOrder?.status === 'success'
                                    ? 'green'
                                    : viewOrder?.status === 'failed'
                                    ? 'red'
                                    : viewOrder?.status === 'shipping'
                                    ? 'geekblue'
                                    : viewOrder?.status === 'confirm'
                                    ? 'blue'
                                    : 'orange'
                            }
                        >
                            {viewOrder?.status === 'success' && 'Thành công'}
                            {viewOrder?.status === 'failed' && 'Đã hủy'}
                            {viewOrder?.status === 'shipping' && 'Đang giao'}
                            {viewOrder?.status === 'confirm' && 'Đã xác nhận'}
                            {viewOrder?.status === 'pending' && 'Chờ xác nhận'}
                        </Tag>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={800}
                className="order-detail-modal"
            >
                {viewOrder && (
                    <div className="space-y-6">
                        {viewOrder.status !== 'failed' && (
                            <Card className="bg-gray-50 border-0 mb-6">
                                <Steps
                                    current={getOrderStatusStep(viewOrder.status)}
                                    status={viewOrder.status === 'failed' ? 'error' : 'process'}
                                    items={[
                                        {
                                            title: 'Đặt hàng',
                                            description: 'Đã đặt hàng',
                                        },
                                        {
                                            title: 'Xác nhận',
                                            description: viewOrder.status === 'pending' ? 'Đang chờ' : 'Đã xác nhận',
                                        },
                                        {
                                            title: 'Vận chuyển',
                                            description: ['confirm', 'pending'].includes(viewOrder.status)
                                                ? 'Đang chờ'
                                                : 'Đang giao',
                                        },
                                        {
                                            title: 'Thành công',
                                            description: viewOrder.status === 'success' ? 'Đã giao hàng' : 'Đang chờ',
                                        },
                                    ]}
                                />
                            </Card>
                        )}

                        <Card title="Thông tin đơn hàng" bordered={false} className="shadow-sm">
                            <Descriptions column={{ xs: 1, sm: 2 }}>
                                <Descriptions.Item label="Mã đơn hàng">
                                    <span className="font-medium">{viewOrder.idPayment}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">
                                    {moment(viewOrder.createdAt).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {getStatusTag(viewOrder.status)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <div className="flex items-center">
                                        <span className="mr-1 text-lg">
                                            {getPaymentMethodIcon(viewOrder.typePayment)}
                                        </span>
                                        <span>{getPaymentMethodText(viewOrder.typePayment)}</span>
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Thông tin nhận hàng" bordered={false} className="shadow-sm">
                            <Descriptions column={{ xs: 1, sm: 2 }}>
                                <Descriptions.Item label="Họ tên">{viewOrder.fullName}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{viewOrder.phoneNumber}</Descriptions.Item>
                                <Descriptions.Item label="Email">{viewOrder.email}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{viewOrder.address}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Sản phẩm" bordered={false} className="shadow-sm">
                            <div className="space-y-4">
                                {viewOrder.items.map((product) => (
                                    <div key={product.id} className="flex border-b pb-4">
                                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                    product.product.imagesProduct.split(', ')[0]
                                                }`}
                                                alt={product.product.nameProduct}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 ml-4 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium">{product.product.nameProduct}</h4>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    <span>SL: {product.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="font-bold text-red-600">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(product.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between pt-4 text-lg">
                                    <span className="font-medium">Tổng cộng:</span>
                                    <span className="font-bold text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                            viewOrder.totalPrice,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {viewOrder.status === 'failed' && (
                            <Card title="Lý do hủy" bordered={false} className="shadow-sm border-red-100">
                                <div className="text-red-500">
                                    <p>Đơn hàng đã bị hủy do người dùng yêu cầu</p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>

            <style jsx="true">{`
                .custom-order-table .ant-table-thead > tr > th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                }
            `}</style>

            {/* Modal Đánh Giá Sản Phẩm */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <StarOutlined className="text-yellow-500" />
                        <span>Đánh giá sản phẩm</span>
                    </div>
                }
                open={reviewModalVisible}
                onCancel={() => {
                    setReviewModalVisible(false);
                    setSelectedProductForReview(null);
                }}
                footer={null}
                width={700}
                className="review-modal"
            >
                {viewOrder && (
                    <div>
                        {!selectedProductForReview ? (
                            <div className="mb-6">
                                <h3 className="font-medium text-lg mb-4">Chọn sản phẩm để đánh giá:</h3>
                                <div className="space-y-3 max-h-80 overflow-auto p-2">
                                    {viewOrder.items
                                        .filter((item) => !item.previewProduct)
                                        .map((product) => (
                                            <Card
                                                key={product.id}
                                                hoverable
                                                className="border border-gray-200"
                                                onClick={() => handleProductSelection(product)}
                                            >
                                                <div className="flex items-center">
                                                    <img
                                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                            product.product.imagesProduct.split(', ')[0]
                                                        }`}
                                                        alt={product.product.nameProduct}
                                                        className="w-20 h-20 object-cover rounded-md"
                                                    />
                                                    <div className="ml-4">
                                                        <h4 className="font-medium">{product.product.nameProduct}</h4>
                                                        <div className="text-gray-500">SL: {product.quantity}</div>
                                                        <div className="text-blue-600 mt-2 text-sm">
                                                            Nhấp để đánh giá sản phẩm này
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-6 pb-6 border-b">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                selectedProductForReview.product.imagesProduct.split(', ')[0]
                                            }`}
                                            alt={selectedProductForReview.product.nameProduct}
                                            className="w-24 h-24 object-cover rounded-md"
                                        />
                                        <div>
                                            <h3 className="text-lg font-medium mb-1">
                                                {selectedProductForReview.product.nameProduct}
                                            </h3>
                                            <p className="text-gray-500">Mã đơn hàng: {viewOrder.idPayment}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="link"
                                        onClick={() => setSelectedProductForReview(null)}
                                        className="mt-2"
                                    >
                                        Chọn sản phẩm khác
                                    </Button>
                                </div>

                                <Form
                                    form={reviewForm}
                                    layout="vertical"
                                    onFinish={handleReviewSubmit}
                                    initialValues={{
                                        rating: 5,
                                    }}
                                >
                                    <Form.Item
                                        name="rating"
                                        label={<span className="text-base font-medium">Đánh giá của bạn</span>}
                                        rules={[{ required: true, message: 'Vui lòng đánh giá sản phẩm!' }]}
                                    >
                                        <Rate
                                            className="text-2xl"
                                            character={<StarOutlined />}
                                            allowHalf
                                            style={{ color: '#fadb14' }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="content"
                                        label={<span className="text-base font-medium">Nhận xét của bạn</span>}
                                        rules={[
                                            { required: true, message: 'Vui lòng viết nhận xét về sản phẩm!' },
                                            { min: 20, message: 'Nhận xét phải có ít nhất 20 ký tự!' },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                                            rows={4}
                                            showCount
                                            maxLength={1000}
                                        />
                                    </Form.Item>

                                    <Form.Item className="mt-8">
                                        <Row gutter={12} justify="end">
                                            <Col>
                                                <Button
                                                    onClick={() => {
                                                        setReviewModalVisible(false);
                                                        setSelectedProductForReview(null);
                                                    }}
                                                >
                                                    Hủy
                                                </Button>
                                            </Col>
                                            <Col>
                                                <Button type="primary" htmlType="submit">
                                                    Gửi đánh giá
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
}

export default OrderHistory;
