import { Table, Card, Button, Input, Space, Tag, Select, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { requestGetPayments, requestUpdateStatusPayment } from '../../../config/request';
import moment from 'moment';

const { Option } = Select;

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchOrders = async () => {
        const res = await requestGetPayments();
        setOrders(res.metadata);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleChangeStatus = async (id, newStatus) => {
        try {
            const data = {
                idPayment: id,
                status: newStatus,
            };
            await requestUpdateStatusPayment(data);
            message.success('Cập nhật trạng thái thành công');
            fetchOrders();
        } catch (error) {
            message.error('Cập nhật trạng thái thất bại');
        }
    };

    const statusMap = {
        success: { text: 'Đã giao hàng', color: 'green' },
        confirm: { text: 'Đang xử lý', color: 'blue' },
        shipping: { text: 'Đang giao hàng', color: 'cyan' },
        pending: { text: 'Chờ xử lý', color: 'orange' },
        failed: { text: 'Đã hủy', color: 'red' },
    };

    const statusTextMap = {
        pending: 'Chờ xử lý',
        confirm: 'Đang xử lý',
        shipping: 'Đang giao hàng',
        success: 'Hoàn thành',
        failed: 'Hủy',
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idPayment',
            key: 'idPayment',
            render: (idPayment) => <a>#{idPayment}</a>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'items',
            key: 'items',
            render: (items) => items.map((item) => item?.product?.nameProduct).join(', '),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (createdAt) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (totalPrice) => `${totalPrice.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const item = statusMap[status] || { text: 'Không xác định', color: 'gray' };
                return <Tag color={item.color}>{item.text}</Tag>;
            },
            filters: Object.keys(statusMap).map((key) => ({
                text: statusMap[key].text,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const statusFlow = ['pending', 'confirm', 'shipping', 'success'];
                const currentIndex = statusFlow.indexOf(record.status);

                // Các trạng thái tiếp theo có thể chọn
                let nextStatuses = statusFlow.slice(currentIndex + 1);
                if (record.status !== 'success' && record.status !== 'failed') {
                    nextStatuses.push('failed');
                }

                return (
                    <Space size="middle">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                setSelectedOrder(record);
                                setModalVisible(true);
                            }}
                        >
                            Chi tiết
                        </Button>

                        {record.status !== 'success' && record.status !== 'failed' && (
                            <Select
                                labelInValue
                                value={{ value: record.status, label: statusTextMap[record.status] }} // hiển thị tiếng Việt
                                style={{ width: 140 }}
                                size="small"
                                onChange={(option) => handleChangeStatus(record.idPayment, option.value)} // option.value là key gốc
                            >
                                {nextStatuses.map((status) => (
                                    <Select.Option key={status} value={status}>
                                        {statusTextMap[status]}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">Quản lý đơn hàng</div>
                <Input placeholder="Tìm kiếm đơn hàng" prefix={<SearchOutlined />} style={{ width: 250 }} />
            </div>

            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Table dataSource={orders} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
            </Card>

            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.idPayment}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <>
                        <Descriptions bordered column={2} size="middle" className="mb-4">
                            <Descriptions.Item label="Khách hàng">{selectedOrder.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {moment(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={statusMap[selectedOrder.status]?.color}>
                                    {statusMap[selectedOrder.status]?.text}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lượng">
                                {selectedOrder.items.reduce((acc, item) => acc + item.quantity, 0)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{selectedOrder.address}</Descriptions.Item>
                        </Descriptions>

                        <Table
                            dataSource={selectedOrder.items}
                            rowKey={(item) => item.product?.id}
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Sản phẩm', dataIndex: ['product', 'nameProduct'], key: 'productName' },
                                {
                                    title: 'Hình ảnh',
                                    dataIndex: ['product', 'imagesProduct'],
                                    key: 'imagesProduct',
                                    render: (imagesProduct) => (
                                        <img
                                            className="w-15 h-15 object-cover rounded-md"
                                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                imagesProduct.split(',')[0]
                                            }`}
                                            alt="Hình ảnh"
                                        />
                                    ),
                                },
                                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (price) => `${price.toLocaleString('vi-VN')} đ`,
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'total',
                                    render: (_, item) => `${(item.price * item.quantity).toLocaleString('vi-VN')} đ`,
                                },
                            ]}
                        />
                    </>
                )}
            </Modal>
        </>
    );
}

export default OrderManagement;
