import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { requestCreateCart, requestGetProductById } from '../config/request';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Image, Tabs, Rate, Button, InputNumber, Tag, Divider, Skeleton, Carousel, Badge, message } from 'antd';
import { ShoppingCart, Heart, Check, Shield, RotateCcw, Truck, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import CardBody from '../components/CardBody';
import { useStore } from '../hooks/useStore';
import moment from 'moment';

function DetailProduct() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('1');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [productRelate, setProductRelate] = useState([]);
    const [previewProduct, setPreviewProduct] = useState([]);
    const { setIsOpenModalAIReview, setIdProductReview } = useStore();

    const carouselRef = useRef(null);

    const { fetchCart } = useStore();

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await requestGetProductById(id);
            setProduct(res.metadata.product);
            setProductRelate(res.metadata.productRelate);
            setPreviewProduct(res.metadata.previewProduct);
            document.title = res.metadata.product.nameProduct;
            carouselRef.current.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching product:', error);
            message.error('Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModalAIReview = () => {
        setIsOpenModalAIReview(true);
        setIdProductReview(data.id);
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const renderImages = () => {
        if (!product || loading) {
            return <Skeleton.Image className="w-full h-[500px] rounded-lg" active />;
        }

        const imageUrls = product.imagesProduct
            .split(', ')
            .map((img) => `${import.meta.env.VITE_API_URL}/uploads/products/${img}`);

        return (
            <div className="sticky top-[100px] pb-8">
                <div className="mb-4 relative overflow-hidden rounded-xl">
                    <Image
                        src={imageUrls[selectedImageIndex]}
                        alt={product.nameProduct}
                        className="w-full object-contain rounded-lg"
                        height={400}
                        preview={{
                            toolbarRender: () => null,
                            maskClassName: 'backdrop-blur-sm bg-black/70',
                        }}
                    />
                    {product.discountProduct > 0 && (
                        <div className="absolute top-4 left-4 z-10">
                            <Badge.Ribbon
                                text={`Giảm ${product.discountProduct}%`}
                                color="red"
                                className="text-sm font-bold"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-5 gap-2 mt-4">
                    {imageUrls.map((url, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer border-2 ${
                                selectedImageIndex === index ? 'border-red-500' : 'border-gray-200'
                            } rounded-lg overflow-hidden transition-all duration-200 ${
                                selectedImageIndex === index ? 'shadow-md' : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                            <img
                                src={url}
                                alt={`${product.nameProduct} - ${index + 1}`}
                                className="w-full h-30 object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const navigate = useNavigate();

    const handleAddToCart = async (type) => {
        const data = {
            productId: product.id,
            quantity: quantity,
        };
        try {
            await requestCreateCart(data);
            await fetchCart();
            message.success('Thêm vào giỏ hàng thành công');
            if (type === 'buy') {
                navigate('/cart');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const finalPrice = product
        ? product.discountProduct > 0
            ? product.priceProduct * (1 - product.discountProduct / 100)
            : product.priceProduct
        : 0;

    return (
        <div className="min-h-screen bg-gray-50" ref={carouselRef}>
            <header>
                <Header />
            </header>

            <main className="w-[70%] mx-auto pt-[90px] mb-10">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                        <Skeleton active paragraph={{ rows: 12 }} />
                        <Skeleton active paragraph={{ rows: 12 }} />
                    </div>
                ) : product ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                            <div>{renderImages()}</div>

                            {/* Right Column - Product Info */}
                            <div className="flex flex-col">
                                {/* Title & Rating */}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 leading-tight flex-1">
                                        {product.nameProduct}
                                    </h1>

                                    <div className="flex items-center mt-2">
                                        <Rate
                                            disabled
                                            defaultValue={
                                                previewProduct.length > 0
                                                    ? previewProduct.reduce((acc, item) => acc + item.rating, 0) /
                                                      previewProduct.length
                                                    : 0
                                            }
                                            allowHalf
                                            className="text-sm"
                                        />
                                        <span className="text-gray-500 ml-2 text-sm">
                                            {previewProduct.length > 0
                                                ? previewProduct.reduce((acc, item) => acc + item.rating, 0) /
                                                      previewProduct.length +
                                                  ' đánh giá'
                                                : 0}
                                        </span>
                                    </div>
                                </div>
                                {/* Price & Stock */}
                                <div className="mt-6 bg-gray-50 pt-4 pb-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-red-600">
                                            Giá : {finalPrice.toLocaleString()}₫
                                        </span>
                                        {product.discountProduct > 0 && (
                                            <span className="text-gray-500 text-lg line-through ml-3">
                                                Giá gốc: {product.priceProduct.toLocaleString()}₫
                                            </span>
                                        )}

                                        {product.discountProduct > 0 && (
                                            <div className="flex items-center">
                                                <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded font-medium">
                                                    Tiết kiệm {((product.priceProduct - finalPrice) / 1000).toFixed(0)}K
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>{' '}
                                <div className="mr-4 flex items-center gap-2">
                                    <span className="block text-sm text-gray-600 mb-1">Số lượng</span>
                                    <InputNumber
                                        min={1}
                                        max={product.stockProduct}
                                        value={quantity}
                                        onChange={setQuantity}
                                        className="w-20"
                                        disabled={product.stockProduct === 0}
                                    />
                                </div>
                                {/* Stock Status */}
                                <div className="mt-4 flex items-center">
                                    <div className="mr-4 flex items-center">
                                        <span className="font-medium text-gray-700 mr-2 ">Tình trạng:</span>
                                        {product.stockProduct > 0 ? (
                                            <Tag color="success" className="flex items-center text-sm">
                                                <span>Còn hàng ({product.stockProduct}) sản phẩm</span>
                                            </Tag>
                                        ) : (
                                            <Tag color="error" className="text-sm">
                                                Hết hàng
                                            </Tag>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-700 mr-2">Bảo hành:</span>
                                        <Tag color="processing" className="text-sm">
                                            12 tháng
                                        </Tag>
                                    </div>
                                </div>
                                {/* Buy Options */}
                                {/* <div className="mt-6 flex items-center">
                                    <div className="flex-1">
                                        <Button
                                            type="primary"
                                            danger
                                            size="large"
                                            className="flex items-center justify-center h-[50px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold w-full shadow-md hover:shadow-lg transition-all"
                                            icon={<ShoppingCart className="mr-2" />}
                                            disabled={product.stockProduct === 0}
                                            onClick={() => handleAddToCart('add')}
                                        >
                                            THÊM VÀO GIỎ HÀNG
                                        </Button>
                                        <Button
                                            type="default"
                                            size="large"
                                            className="mt-3 flex items-center justify-center h-[50px] border-blue-500 hover:border-blue-700 text-blue-600 hover:text-blue-700 font-bold w-full"
                                            disabled={product.stockProduct === 0}
                                            onClick={() => handleAddToCart('buy')}
                                        >
                                            MUA NGAY
                                        </Button>
                                    </div>
                                </div> */}
                                <div className="mt-6 grid grid-cols-1 gap-3">
                                    <Button
                                        size="large"
                                        className="flex items-center justify-center h-[50px] w-full !bg-blue-600 !text-white !border-none !rounded-lg shadow-md hover:!bg-blue-700 hover:shadow-lg transition-all"
                                        onClick={handleOpenModalAIReview}
                                    >
                                        AI REVIEW
                                    </Button>

                                    <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        className="flex items-center justify-center h-[50px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold w-full shadow-md hover:shadow-lg transition-all"
                                        icon={<ShoppingCart className="mr-2" />}
                                        disabled={product.stockProduct === 0}
                                        onClick={() => handleAddToCart('add')}
                                    >
                                        THÊM VÀO GIỎ HÀNG
                                    </Button>

                                    <Button
                                        type="default"
                                        size="large"
                                        className="flex items-center justify-center h-[50px] border-blue-500 hover:border-blue-700 text-blue-600 hover:text-blue-700 font-bold w-full"
                                        disabled={product.stockProduct === 0}
                                        onClick={() => handleAddToCart('buy')}
                                    >
                                        MUA NGAY
                                    </Button>
                                </div>
                                {/* Benefits */}
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Shield className="text-blue-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-gray-800">Bảo hành chính hãng</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                12 tháng tại trung tâm bảo hành chính hãng
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Truck className="text-green-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-gray-800">Giao hàng miễn phí</h4>
                                            <p className="text-xs text-gray-500 mt-1">Với đơn hàng trên 800.000đ</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <RotateCcw className="text-orange-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-gray-800">Đổi trả dễ dàng</h4>
                                            <p className="text-xs text-gray-500 mt-1">Trong vòng 7 ngày đầu tiên</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Check className="text-purple-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-gray-800">Sản phẩm chính hãng</h4>
                                            <p className="text-xs text-gray-500 mt-1">100% hàng chính hãng, an toàn</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Tabs */}
                        <div className="mt-12">
                            <Tabs
                                defaultActiveKey="1"
                                onChange={setActiveTab}
                                items={[
                                    {
                                        key: '1',
                                        label: 'Thông số kỹ thuật',
                                        children: (
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <h3 className="text-xl font-bold mb-6 text-gray-800">
                                                    Thông số kỹ thuật {product.nameProduct}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-1">
                                                    {product.specsProduct &&
                                                        product.specsProduct.map((spec, index) => (
                                                            <div
                                                                key={index}
                                                                className={`flex py-3 px-4 ${
                                                                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                                }`}
                                                            >
                                                                <div className="w-1/3 font-medium text-gray-700">
                                                                    {spec.label}
                                                                </div>
                                                                <div className="w-2/3 text-gray-800">{spec.value}</div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: '2',
                                        label: 'Mô tả sản phẩm',
                                        children: (
                                            <div dangerouslySetInnerHTML={{ __html: product.descriptionProduct }} />
                                        ),
                                    },
                                    {
                                        key: '3',
                                        label: 'Đánh giá',
                                        children: (
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="md:w-1/3 border-r pr-8">
                                                        <div className="text-center">
                                                            <h3 className="text-3xl font-bold text-gray-800">
                                                                {previewProduct.length > 0
                                                                    ? previewProduct.reduce(
                                                                          (acc, item) => acc + item.rating,
                                                                          0,
                                                                      ) / previewProduct.length
                                                                    : 0}
                                                            </h3>
                                                            <Rate
                                                                disabled
                                                                defaultValue={
                                                                    previewProduct.reduce(
                                                                        (acc, item) => acc + item.rating,
                                                                        0,
                                                                    ) / previewProduct.length
                                                                }
                                                                allowHalf
                                                            />
                                                            <p className="mt-2 text-gray-500">
                                                                Dựa trên {previewProduct.length} đánh giá
                                                            </p>
                                                        </div>

                                                        <div className="mt-6 space-y-2">
                                                            <div className="flex items-center">
                                                                <span className="w-8 text-xs">5★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 5,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {previewProduct.filter((item) => item.rating === 5)
                                                                        .length / previewProduct.length}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-8 text-xs">4★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 4,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {previewProduct.filter((item) => item.rating === 4)
                                                                        .length / previewProduct.length}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-8 text-xs">3★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 3,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {previewProduct.filter((item) => item.rating === 3)
                                                                        .length / previewProduct.length}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-8 text-xs">2★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 2,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {previewProduct.filter((item) => item.rating === 2)
                                                                        .length / previewProduct.length}
                                                                    %
                                                                </span>
                                                            </div>
                                                            {/* <div className="flex items-center">
                                                                <span className="w-8 text-xs">1★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 1,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">2%
                                                                    {
                                                                        previewProduct.filter(
                                                                            (item) => item.rating === 1,
                                                                        ).length / previewProduct.length
                                                                    }%
                                                                </span>
                                                            </div> */}
                                                            <div className="flex items-center">
                                                                <span className="w-8 text-xs">1★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                                                                    <div
                                                                        className="bg-yellow-400 h-2.5 rounded-full"
                                                                        style={{
                                                                            width: `${
                                                                                previewProduct.filter(
                                                                                    (item) => item.rating === 1,
                                                                                ).length / previewProduct.length
                                                                            }%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {previewProduct.filter((item) => item.rating === 1)
                                                                        .length / previewProduct.length}
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:w-2/3">
                                                        <div className="space-y-6">
                                                            {previewProduct.map((item) => (
                                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center">
                                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold mr-3">
                                                                                N
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-medium">
                                                                                    {item.user.fullName}
                                                                                </h4>
                                                                                <div className="flex items-center mt-1">
                                                                                    <Rate
                                                                                        disabled
                                                                                        defaultValue={item.rating}
                                                                                        className="text-xs"
                                                                                    />
                                                                                    <span className="text-xs text-gray-500 ml-2">
                                                                                        {moment(item.createdAt).format(
                                                                                            'DD/MM/YYYY',
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <Tag color="blue">Đã mua hàng</Tag>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mt-3 text-gray-700">{item.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>

                        {/* Related Products */}
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm cùng hãng</h2>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                {productRelate
                                    .filter((item) => item.id !== product.id)
                                    .map((item) => (
                                        <div key={item.id}>
                                            <Link to={`/product/${item.id}`}>
                                                <CardBody data={item} />
                                            </Link>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa</p>
                        </div>
                        <Button type="primary" className="mt-6 bg-blue-500">
                            <a href="/">Quay lại trang chủ</a>
                        </Button>
                    </div>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
