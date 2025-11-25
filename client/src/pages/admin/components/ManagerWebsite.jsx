import { useEffect, useState } from 'react';
import { Row, Col, Typography, Card, Upload, Button, Modal, message } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import Slider from 'react-slick';

import { requestCreateBanner, requestGetBanner, requestDeleteBanner } from '../../../config/request';

const { Title } = Typography;

function ManagerWebsite() {
    const [bannerImages, setBannerImages] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const fetchBanner = async () => {
        try {
            const res = await requestGetBanner();
            setBannerImages(res.data);
        } catch (err) {
            message.error('Lấy banner thất bại');
        }
    };

    useEffect(() => {
        fetchBanner();
    }, []);

    const handleCancel = () => setPreviewVisible(false);

    const handlePreview = (image) => {
        setPreviewImage(image);
        setPreviewVisible(true);
    };

    const handleRemoveBanner = async (id) => {
        try {
            await requestDeleteBanner({ id });
            message.success('Xoá banner thành công');
            fetchBanner();
        } catch (err) {
            message.error('Xoá banner thất bại');
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };

    const handleAddBanner = async () => {
        try {
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('banner', file);
            });
            await requestCreateBanner(formData);
            message.success('Thêm banner thành công');
            fetchBanner();
            setFileList([]);
        } catch (err) {
            message.error('Thêm banner thất bại');
        }
    };

    return (
        <div>
            <Card>
                <Title level={4}>Danh sách Banner</Title>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    {bannerImages.map((image, index) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={index}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt={`Banner ${index + 1}`}
                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/website/${image.banner}`}
                                        style={{ height: 160, objectFit: 'cover' }}
                                        onClick={() =>
                                            handlePreview(
                                                `${import.meta.env.VITE_URL_IMAGE}/uploads/website/${image.banner}`,
                                            )
                                        }
                                    />
                                }
                                actions={[<DeleteOutlined key="delete" onClick={() => handleRemoveBanner(image.id)} />]}
                            >
                                <Card.Meta title={`Banner ${index + 1}`} />
                            </Card>
                        </Col>
                    ))}

                    {/* Upload new banner */}
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            style={{
                                border: '1px dashed #d9d9d9',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            <Upload listType="picture-card" {...uploadProps}>
                                {fileList.length < 1 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                )}
                            </Upload>
                            <Button
                                type="primary"
                                onClick={handleAddBanner}
                                disabled={fileList.length === 0}
                                icon={<UploadOutlined />}
                            >
                                Thêm Banner
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* Preview Modal */}
            <Modal open={previewVisible} title="Xem trước ảnh" footer={null} onCancel={handleCancel}>
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
}

export default ManagerWebsite;
