import { Search, ShoppingCart, User, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Menu, Avatar, Input, Empty } from 'antd';
import { useStore } from '../hooks/useStore';
import { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';
import { requestLogout, requestReadAllNotication, requestSearchProduct } from '../config/request';
import moment from 'moment';

function Header() {
    const { dataUser, cart, notication, fetchNotication, newNotication, setNotication } = useStore();

    useEffect(() => {
        if (newNotication && Object.keys(newNotication).length > 0) {
            setNotication((prev) => [...prev, newNotication]);
        }
    }, [newNotication]);

    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const debounce = useDebounce(search, 500);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);

            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (debounce.trim()) {
                setLoading(true);
                try {
                    const res = await requestSearchProduct(debounce);
                    setProducts(res.metadata);
                } catch (error) {
                    console.error('Search error:', error);
                    setProducts([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setProducts([]);
            }
        };
        fetchData();
    }, [debounce]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Mark notification as read
    const handleReadNotification = async () => {
        try {
            await requestReadAllNotication();
            await fetchNotication();
        } catch (error) {
            console.log(error);
        }
    };

    const handleNavigate = () => {
        navigate('/order');
    };

    const notificationMenu = (
        <Menu
            className="w-80"
            items={[
                {
                    key: 'title',
                    label: (
                        <div className="flex justify-between items-center px-2 py-2 border-b">
                            <span className="font-bold">Thông báo</span>
                            {notication.some((n) => n.isRead === '0') && (
                                <span
                                    className="text-xs text-blue-500 cursor-pointer hover:underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReadNotification();
                                    }}
                                >
                                    Đánh dấu tất cả đã đọc
                                </span>
                            )}
                        </div>
                    ),
                    type: 'group',
                },
                ...notication.map((notification) => ({
                    key: notification.id,
                    label: (
                        <div
                            className={`p-2 border-b ${notification.isRead === '0' ? 'bg-gray-50' : ''}`}
                            onClick={() => handleNavigate()}
                        >
                            <div className="flex justify-between">
                                <span className="font-medium text-sm">{notification.content}</span>
                                <span className="text-xs text-gray-500">
                                    {moment(notification.createdAt).format('DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>
                    ),
                })),
            ]}
        />
    );

    const userMenu = (
        <Menu
            items={[
                {
                    key: 'profile',
                    label: <Link to="/profile">Trang cá nhân</Link>,
                },
                {
                    key: 'order',
                    label: <Link to="/order">Đơn hàng của tôi</Link>,
                },
                {
                    key: 'logout',
                    label: <span onClick={handleLogout}>Đăng xuất</span>,
                },
            ]}
        />
    );

    return (
        <div className="w-full bg-gradient-to-b from-[#e45464] to-[#d70018] h-[70px] flex items-center fixed top-0 left-0 right-0 z-50">
            <div className="w-[80%] flex items-center justify-between mx-auto px-4">
                {/* Logo */}
                <Link to="/">
                    <div className="flex-shrink-0">
                        <img src="/src/assets/images/xoanentrang.png" alt="Logo" />
                    </div>
                </Link>

                {/* Search Bar */}
                <div ref={searchRef} className="flex-1 max-w-md mx-8 relative">
                    <div className="relative bg-white rounded-full flex items-center">
                        <Search className="absolute left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Bạn muốn mua gì hôm nay?"
                            className="w-full h-[36px] rounded-full border-none outline-none pl-10 pr-4 text-sm placeholder-gray-400"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                        />
                    </div>

                    {/* Search Results */}
                    {showResults && search.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
                            {loading ? (
                                <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="py-2">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            className="block hover:bg-gray-50"
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="flex items-center p-2 border-b border-gray-100">
                                                <div className="w-14 h-14 flex-shrink-0">
                                                    <img
                                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                            product.imagesProduct.split(', ')[0]
                                                        }`}
                                                        alt={product.nameProduct}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                        {product.nameProduct}
                                                    </p>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-sm font-bold text-red-600">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            }).format(
                                                                product.discountProduct > 0
                                                                    ? product.priceProduct -
                                                                          (product.priceProduct *
                                                                              product.discountProduct) /
                                                                              100
                                                                    : product.priceProduct,
                                                            )}
                                                        </span>
                                                        {product.discountProduct > 0 && (
                                                            <span className="ml-2 text-xs text-gray-500 line-through">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                }).format(product.priceProduct)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Không tìm thấy sản phẩm"
                                    className="py-8"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Shopping Cart */}
                    <Link to="/cart">
                        <button className="relative flex items-center space-x-1 text-white hover:text-gray-200 transition-colors bg-[#00000000] border border-white rounded-full px-4 py-2 hover:bg-white hover:text-red-600 cursor-pointer">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-sm font-medium">Giỏ hàng</span>
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.cart?.length || 0}
                            </span>
                        </button>
                    </Link>

                    {/* Notification Bell */}
                    {/* <Dropdown overlay={notificationMenu} placement="bottomRight" arrow trigger={['click']}> */}
                    <Dropdown
                        menu={{ items: notificationMenu.props.items }}
                        overlayClassName="custom-dropdown"
                        placement="bottomRight"
                        arrow
                        trigger={['click']}
                    >
                        <button className="relative flex items-center space-x-1 text-white hover:text-gray-200 transition-colors bg-[#00000000] border border-white rounded-full px-3 py-2 hover:bg-white hover:text-red-600 cursor-pointer">
                            <Bell className="w-5 h-5" />
                            {notication.filter((n) => n.isRead === '0').length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {notication.filter((n) => n.isRead === '0').length}
                                </span>
                            )}
                        </button>
                    </Dropdown>

                    {/* User Section */}
                    {dataUser.id ? (
                        // <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                        <Dropdown menu={{ items: userMenu.props.items }} placement="bottomRight" arrow>
                            <div className="flex items-center space-x-2 text-white cursor-pointer hover:text-gray-200">
                                <Avatar src={dataUser.avatar || undefined} icon={<User />} />
                                <span className="text-sm font-medium">{dataUser.name}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <Link to="/login">
                            <button className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors bg-[#00000000] border border-white rounded-full px-4 py-2 hover:bg-white hover:text-red-600 cursor-pointer">
                                <User className="w-5 h-5" />
                                <span className="text-sm font-medium">Đăng nhập</span>
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
