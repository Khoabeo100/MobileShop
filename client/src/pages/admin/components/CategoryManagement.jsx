import { Table, Card, Button, Input, Space, Modal, Form, Input as AntInput, message } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetCategories,
    requestUpdateCategory,
} from '../../../config/request';

const { confirm } = Modal;

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await requestGetCategories();
            setCategories(res.metadata || []);
        };
        fetchCategories();
    }, []);

    const handleOpenAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleOpenEdit = (record) => {
        setEditingCategory(record);
        form.setFieldsValue({
            nameCategory: record.nameCategory,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xoá danh mục này?',
            icon: <ExclamationCircleOutlined />,
            content: `Danh mục: ${record.nameCategory}`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                setCategories((prev) => prev.filter((item) => item.id !== record.id));
                const data = {
                    id: record.id,
                };
                await requestDeleteCategory(data);
                message.success('Xoá danh mục thành công!');
            },
        });
    };

    const handleOk = async () => {
        form.validateFields().then(async (values) => {
            if (editingCategory) {
                // Sửa danh mục
                setCategories((prev) =>
                    prev.map((item) =>
                        item.id === editingCategory.id ? { ...item, nameCategory: values.nameCategory } : item,
                    ),
                );
                const data = {
                    id: editingCategory.id,
                    nameCategory: values.nameCategory,
                };
                await requestUpdateCategory(data);
                message.success('Cập nhật danh mục thành công!');
            } else {
                // Thêm mới danh mục
                const data = {
                    nameCategory: values.nameCategory,
                };
                await requestCreateCategory(data);
                setCategories((prev) => [...prev, data]);
                message.success('Thêm danh mục thành công!');
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (text, record, index) => <span>{index + 1}</span>,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'products',
            key: 'products',
            render: (products) => products?.length || 0,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenEdit(record)}>
                        Sửa
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const handleSearch = (value) => {
        if (value === '') {
            const fetchCategories = async () => {
                const res = await requestGetCategories();
                setCategories(res.metadata || []);
            };
            fetchCategories();
            return;
        }
        const filteredCategories = categories.filter((category) =>
            category.nameCategory.toLowerCase().includes(value.toLowerCase()),
        );
        setCategories(filteredCategories);
    };

    return (
        <>
            <div className="p-4">
                <div className="text-2xl font-bold mb-4">Quản lý danh mục</div>
                <Space>
                    <Input
                        placeholder="Tìm kiếm danh mục"
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
                        Thêm danh mục
                    </Button>
                </Space>
            </div>

            <Card style={{ borderRadius: 12 }}>
                <Table dataSource={categories} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
            </Card>

            <Modal
                title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="nameCategory"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <AntInput placeholder="Nhập tên danh mục" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default CategoryManagement;
