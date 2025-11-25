import { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Modal,
    Form,
    InputNumber,
    Upload,
    Select,
    message,
    Tag,
    Badge,
    Tooltip,
    Avatar,
    Divider,
    Row,
    Col,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    TagOutlined,
    InboxOutlined,
    EyeOutlined,
    PercentageOutlined,
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useStore } from '../../../hooks/useStore';
import {
    requestCreateProduct,
    requestDeleteProduct,
    requestGetAllProducts,
    requestUpdateProduct,
    requestUploadImageProduct,
} from '../../../config/request';

const { Title, Text } = Typography;

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const { categories } = useStore();

    const fetchProducts = async () => {
        const res = await requestGetAllProducts();
        setProducts(res.metadata);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((p) => p.nameProduct.toLowerCase().includes(searchText.toLowerCase()));

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xoá?',
            okText: 'Xoá',
            cancelText: 'Huỷ',
            okType: 'danger',
            onOk: async () => {
                const data = {
                    id,
                };
                await requestDeleteProduct(data);
                fetchProducts();
                message.success('Đã xoá sản phẩm!');
            },
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Chuẩn bị dữ liệu ảnh
            let imageUrls = [];
            if (values.imagesProduct && values.imagesProduct.fileList) {
                const formData = new FormData();
                values.imagesProduct.fileList.forEach((file) => {
                    if (file.originFileObj) {
                        formData.append('images', file.originFileObj);
                    }
                });

                if (formData.has('images')) {
                    const res = await requestUploadImageProduct(formData);
                    if (res.statusCode !== 201) {
                        message.error(res.message || 'Upload ảnh thất bại!');
                        return;
                    }
                    imageUrls = res.metadata.map((image) => image.url);
                }
            }

            const payload = {
                ...values,
                imagesProduct: imageUrls.length ? imageUrls.join(', ') : editingProduct?.imagesProduct || '',
            };

            if (editingProduct) {
                // Gọi API update
                payload.id = editingProduct.id;
                await requestUpdateProduct(payload);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                // Gọi API create
                await requestCreateProduct(payload);
                message.success('Thêm sản phẩm thành công!');
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchProducts();
        } catch (error) {
            console.error('Lỗi khi lưu sản phẩm:', error);
            message.error('Vui lòng kiểm tra lại thông tin!');
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { color: 'red', text: 'Hết hàng' };
        if (stock < 10) return { color: 'orange', text: 'Sắp hết' };
        return { color: 'green', text: 'Còn hàng' };
    };

    const getCategoryColor = (category) => {
        const colors = { Laptop: 'blue', PC: 'green', 'Phụ kiện': 'purple' };
        return colors[category] || 'default';
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'nameProduct',
            key: 'nameProduct',
            width: 260,
            render: (text, record) => (
                <div className="flex items-center gap-3 text-sm">
                    <img
                        className="w-20 h-20 rounded-md object-cover"
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                            record.imagesProduct.split(', ')[0]
                        }`}
                        icon={<ShoppingCartOutlined />}
                        style={{ backgroundColor: '#f5f5f5' }}
                    />
                    <div>
                        <div className="font-medium">{text}</div>
                        <div className="text-xs text-gray-500">ID: {record.id.substring(0, 8)}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá bán',
            dataIndex: 'priceProduct',
            key: 'priceProduct',
            width: 140,
            render: (price, record) => (
                <div className="text-sm">
                    <div className="font-semibold text-red-600">
                        {(price * (1 - record.discountProduct / 100)).toLocaleString()} đ
                    </div>
                    {record.discountProduct > 0 && (
                        <div className="text-xs line-through text-gray-400">{price.toLocaleString()} đ</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discountProduct',
            key: 'discountProduct',
            width: 80,
            render: (discount) =>
                discount > 0 ? (
                    <Tag color="red" icon={<PercentageOutlined />}>
                        {discount}%
                    </Tag>
                ) : (
                    <Text type="secondary">0%</Text>
                ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryProduct',
            key: 'categoryProduct',
            width: 100,
            render: (category) => (
                <Tag color={getCategoryColor(category)} icon={<TagOutlined />}>
                    {categories.find((c) => c.id === category)?.nameCategory}
                </Tag>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stockProduct',
            key: 'stockProduct',
            width: 100,
            render: (stock) => {
                const status = getStockStatus(stock);
                return (
                    <Badge count={stock} color={status.color} showZero>
                        <div
                            className={`text-xs ${
                                status.color === 'red'
                                    ? 'text-red-500'
                                    : status.color === 'orange'
                                    ? 'text-orange-500'
                                    : 'text-green-500'
                            }`}
                        >
                            {status.text}
                        </div>
                    </Badge>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            size="small"
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xem">
                        <Button size="small" icon={<EyeOutlined />} />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen text-sm">
            <div className="p-4">
                <Title level={3} className="!mb-1">
                    Quản lý sản phẩm
                </Title>
            </div>

            {/* Search & Actions */}
            <Card className="mb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-3 ">
                    <Input
                        size="lg"
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="rounded-md"
                    />
                    <Button
                        size="lg"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className="bg-blue-500 hover:bg-blue-600 border-0"
                    >
                        Thêm sản phẩm
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="shadow-sm">
                <Table
                    size="large"
                    dataSource={filteredProducts}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        size: 'large',
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Modal Add/Edit */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {editingProduct ? (
                            <>
                                <EditOutlined className="text-blue-600" />
                                Chỉnh sửa sản phẩm
                            </>
                        ) : (
                            <>
                                <PlusOutlined className="text-green-600" />
                                Thêm sản phẩm mới
                            </>
                        )}
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
                okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Huỷ"
                width={850}
                className="text-sm"
            >
                <Divider className="my-3" />

                <Form form={form} layout="vertical" size="middle" className="max-h-[70vh] overflow-y-auto pr-2">
                    {/* Nhóm 1: Thông tin cơ bản */}
                    <Card size="middle" className="mb-4 border rounded-lg shadow-sm">
                        <div className="font-medium mb-3 text-gray-700">Thông tin cơ bản</div>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tên sản phẩm"
                                    name="nameProduct"
                                    rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
                                >
                                    <Input placeholder="Nhập tên..." />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Danh mục"
                                    name="categoryProduct"
                                    rules={[{ required: true, message: 'Chọn danh mục' }]}
                                >
                                    <Select placeholder="Chọn danh mục">
                                        {categories.map((c) => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.nameCategory}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col span={8}>
                                <Form.Item
                                    label="Giá bán"
                                    name="priceProduct"
                                    rules={[{ required: true, message: 'Nhập giá bán' }]}
                                >
                                    <InputNumber className="w-full" min={0} addonAfter="đ" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Giảm giá (%)" name="discountProduct">
                                    <InputNumber className="w-full" min={0} max={100} addonAfter="%" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Số lượng tồn kho" name="stockProduct">
                                    <InputNumber className="w-full" min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Nhóm 2: Mô tả & Ảnh */}
                    <Card size="small" className="border rounded-lg shadow-sm">
                        <Form.Item label="Mô tả sản phẩm" name="descriptionProduct">
                            <ReactQuill theme="snow" style={{ height: 120, marginBottom: 30 }} />
                        </Form.Item>

                        <Form.Item label="Ảnh sản phẩm" name="imagesProduct">
                            <Upload listType="picture-card" beforeUpload={() => false} multiple>
                                <div>
                                    <UploadOutlined className="text-lg mb-1" />
                                    <div>Chọn ảnh</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Card>

                    <Form.List name="specsProduct">
                        {(fields, { add, remove }) => (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-semibold text-gray-700">Thông số kỹ thuật</span>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        className="rounded-lg"
                                    >
                                        Thêm thông số
                                    </Button>
                                </div>
                                {fields.map(({ key, name, ...rest }) => (
                                    <div key={key} className="bg-white p-3 rounded-lg mb-3 border">
                                        <Row gutter={12} align="middle">
                                            <Col flex="auto">
                                                <Form.Item
                                                    {...rest}
                                                    name={[name, 'label']}
                                                    rules={[{ required: true, message: 'Tên thông số' }]}
                                                    className="mb-0"
                                                >
                                                    <Input placeholder="Tên thông số (VD: CPU, RAM...)" />
                                                </Form.Item>
                                            </Col>
                                            <Col flex="auto">
                                                <Form.Item
                                                    {...rest}
                                                    name={[name, 'value']}
                                                    rules={[{ required: true, message: 'Giá trị' }]}
                                                    className="mb-0"
                                                >
                                                    <Input placeholder="Giá trị (VD: Intel Core i5...)" />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Button
                                                    danger
                                                    onClick={() => remove(name)}
                                                    icon={<DeleteOutlined />}
                                                    shape="circle"
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                        <InboxOutlined className="text-4xl mb-2" />
                                        <div>Chưa có thông số kỹ thuật</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            <style jsx>{`
                .custom-table .ant-table-thead > tr > th {
                    background: #2563eb;
                    color: white;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

export default ProductManagement;
