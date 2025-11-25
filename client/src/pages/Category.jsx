import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { requestGetProductByCategory } from '../config/request';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/Cardbody';
import { Slider, Select, Checkbox, Radio, Button, Spin, Empty, Breadcrumb } from 'antd';
import { FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, ReloadOutlined } from '@ant-design/icons';

function Category() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState([0, 100000000]);
    const [stockFilter, setStockFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await requestGetProductByCategory(id);
                if (res?.statusCode === 200) {
                    setProducts(res.metadata || []);
                    if (res.metadata && res.metadata.length > 0) {
                        setCategoryName(res.metadata[0]?.categoryName || 'Danh mục sản phẩm');
                    }
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Handle price sorting
    const getSortedProducts = () => {
        if (!products || products.length === 0) return [];

        let filteredProducts = [...products];

        // Apply price range filter
        filteredProducts = filteredProducts.filter(
            (product) => product.priceProduct >= priceRange[0] && product.priceProduct <= priceRange[1],
        );

        // Apply stock filter
        if (stockFilter === 'inStock') {
            filteredProducts = filteredProducts.filter((product) => product.stockProduct > 0);
        } else if (stockFilter === 'outOfStock') {
            filteredProducts = filteredProducts.filter((product) => product.stockProduct <= 0);
        }

        // Apply discount filter
        if (discountFilter) {
            filteredProducts = filteredProducts.filter((product) => product.discountProduct > 0);
        }

        // Apply sorting
        if (sortBy === 'priceAsc') {
            filteredProducts.sort((a, b) => a.priceProduct - b.priceProduct);
        } else if (sortBy === 'priceDesc') {
            filteredProducts.sort((a, b) => b.priceProduct - a.priceProduct);
        } else if (sortBy === 'discount') {
            filteredProducts.sort((a, b) => b.discountProduct - a.discountProduct);
        } else if (sortBy === 'newest') {
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filteredProducts;
    };

    const resetFilters = () => {
        setSortBy('default');
        setPriceRange([0, 100000000]);
        setStockFilter('all');
        setDiscountFilter(false);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const sortedProducts = getSortedProducts();

    return (
        <div className="bg-gray-50 min-h-screen">
            <header>
                <Header />
            </header>

            <main className="container mx-auto px-4 py-8 mt-14">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6">
                    <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item>{categoryName}</Breadcrumb.Item>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Filter sidebar - mobile toggle */}
                    <div className="md:hidden w-full mb-4">
                        <Button
                            type="primary"
                            onClick={toggleFilters}
                            className="w-full bg-blue-500 hover:bg-blue-600 flex justify-center items-center gap-2"
                        >
                            <FilterOutlined /> {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
                        </Button>
                    </div>

                    {/* Filters sidebar */}
                    <div
                        className={`${
                            showFilters ? 'block' : 'hidden'
                        } md:block w-full md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-sm`}
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2 flex items-center justify-between">
                                <span>Bộ lọc</span>
                                <Button
                                    icon={<ReloadOutlined />}
                                    size="small"
                                    onClick={resetFilters}
                                    className="text-blue-500"
                                >
                                    Đặt lại
                                </Button>
                            </h3>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Khoảng giá</h4>
                                <Slider
                                    range
                                    min={0}
                                    max={100000000}
                                    step={1000000}
                                    value={priceRange}
                                    onChange={setPriceRange}
                                    tooltip={{
                                        formatter: (value) => `${value.toLocaleString()}₫`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>{priceRange[0].toLocaleString()}₫</span>
                                    <span>{priceRange[1].toLocaleString()}₫</span>
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Tình trạng kho</h4>
                                <Radio.Group
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full"
                                >
                                    <div className="flex flex-col gap-2">
                                        <Radio value="all">Tất cả</Radio>
                                        <Radio value="inStock">Còn hàng</Radio>
                                        <Radio value="outOfStock">Hết hàng</Radio>
                                    </div>
                                </Radio.Group>
                            </div>

                            {/* Discount Filter */}
                            <div className="mb-6">
                                <Checkbox
                                    checked={discountFilter}
                                    onChange={(e) => setDiscountFilter(e.target.checked)}
                                >
                                    <span className="text-sm font-medium text-gray-700">Đang giảm giá</span>
                                </Checkbox>
                            </div>
                        </div>
                    </div>

                    {/* Product listing */}
                    <div className="w-full md:w-3/4 lg:w-4/5">
                        {/* Category header & sorting */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                    {categoryName}{' '}
                                    <span className="text-sm font-normal text-gray-500">
                                        ({sortedProducts.length} sản phẩm)
                                    </span>
                                </h1>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp theo:</span>
                                    <Select
                                        value={sortBy}
                                        onChange={setSortBy}
                                        style={{ width: '100%', minWidth: '180px' }}
                                        options={[
                                            { value: 'default', label: 'Mặc định' },
                                            { value: 'priceAsc', label: 'Giá: Thấp đến cao' },
                                            { value: 'priceDesc', label: 'Giá: Cao đến thấp' },
                                            { value: 'discount', label: 'Giảm giá nhiều nhất' },
                                            { value: 'newest', label: 'Mới nhất' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Spin size="large" />
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedProducts.map((product) => (
                                    <div key={product.id} className="flex justify-center">
                                        <ProductCard data={product} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-lg shadow-sm flex flex-col items-center">
                                <Empty description="Không tìm thấy sản phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                <Button
                                    type="primary"
                                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                                    onClick={resetFilters}
                                >
                                    Đặt lại bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Category;
