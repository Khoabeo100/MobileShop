import { Layout, Menu, Typography } from 'antd';
import {
    AppstoreOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TagOutlined,
    LogoutOutlined,
    LaptopOutlined,
    PictureOutlined,
    MessageOutlined,
    DashboardOutlined,
    GiftOutlined,
    SettingOutlined,
    FileOutlined,
} from '@ant-design/icons';
import { requestLogout } from '../../../config/request';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;
const { Title } = Typography;

function Sidebar({ collapsed, token, activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="h-screen"
            width={260}
            style={{
                background: 'linear-gradient(180deg, #192657 0%, #1e2f64 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                zIndex: 1000,
            }}
        >
            <div
                className="h-20 flex items-center justify-center"
                style={{
                    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                    margin: '0 12px 16px',
                    padding: '0 12px',
                }}
            >
                <div className="font-bold flex items-center text-white">
                    {!collapsed && (
                        <span className="flex items-center gap-3">
                            <LaptopOutlined className="text-2xl" />
                            <span className="text-xl tracking-wide">KB Mobile</span>
                        </span>
                    )}
                    {collapsed && (
                        <span className="text-2xl">
                            <LaptopOutlined />
                        </span>
                    )}
                </div>
            </div>

            <div className="px-3 pb-3">
                <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={(e) => setActiveTab(e.key)}
                    style={{
                        border: 'none',
                        background: 'transparent',
                    }}
                    className="sidebar-menu"
                    theme="dark"
                    items={[
                        {
                            key: 'dashboard',
                            icon: <DashboardOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Thống kê</span>,
                        },
                        {
                            key: 'website',
                            icon: <SettingOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý website</span>,
                        },
                        {
                            key: 'products',
                            icon: <AppstoreOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý sản phẩm</span>,
                        },
                        {
                            key: 'categories',
                            icon: <TagOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý danh mục</span>,
                        },
                        {
                            key: 'orders',
                            icon: <ShoppingCartOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý đơn hàng</span>,
                        },
                        {
                            key: 'users',
                            icon: <UserOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý người dùng</span>,
                        },
                        {
                            key: 'messages',
                            icon: <MessageOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Tin nhắn</span>,
                        },
                        {
                            key: 'coupons',
                            icon: <GiftOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý mã giảm giá</span>,
                        },
                        {
                            key: 'blog',
                            icon: <FileOutlined className="text-lg" />,
                            label: <span className="text-sm font-medium">Quản lý blog</span>,
                        },
                    ]}
                />
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-3">
                <div className="px-3 py-2 mb-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    {!collapsed && <div className="text-white text-xs opacity-80 mb-1 px-2">Đang đăng nhập với</div>}
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <UserOutlined className="text-white" />
                        </div>
                        {!collapsed && (
                            <div className="text-white">
                                <div className="font-medium text-sm">Admin</div>
                                <div className="text-xs opacity-70">Quản trị viên</div>
                            </div>
                        )}
                    </div>
                </div>

                <Menu
                    mode="inline"
                    style={{
                        border: 'none',
                        background: 'transparent',
                    }}
                    theme="dark"
                    items={[
                        {
                            key: 'logout',
                            icon: <LogoutOutlined className="text-lg" />,
                            label: <span className="text-sm">Đăng xuất</span>,
                            className: 'logout-item',
                            onClick: handleLogout,
                        },
                    ]}
                />
            </div>
        </Sider>
    );
}

export default Sidebar;
