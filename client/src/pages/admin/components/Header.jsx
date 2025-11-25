import { Layout, Button, Badge, Avatar, Dropdown, Input, Space } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BellOutlined,
    UserOutlined,
    SearchOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserSwitchOutlined,
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Search } = Input;

function Header({ collapsed, setCollapsed, token }) {
    const notificationItems = [
        {
            key: '1',
            label: (
                <div className="py-1">
                    <div className="font-medium">Đơn hàng mới #125</div>
                    <div className="text-xs opacity-70">Từ Nguyễn Văn An - 2 phút trước</div>
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <div className="py-1">
                    <div className="font-medium">Đơn hàng #123 đã giao thành công</div>
                    <div className="text-xs opacity-70">20 phút trước</div>
                </div>
            ),
        },
        {
            key: '3',
            label: (
                <div className="py-1">
                    <div className="font-medium">5 sản phẩm sắp hết hàng</div>
                    <div className="text-xs opacity-70">1 giờ trước</div>
                </div>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: '4',
            label: <div className="text-center text-blue-500 font-medium">Xem tất cả</div>,
        },
    ];

    const userMenuItems = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: '2',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            key: '3',
            icon: <UserSwitchOutlined />,
            label: 'Chuyển sang người dùng',
        },
        {
            type: 'divider',
        },
        {
            key: '4',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    return (
        <AntHeader
            className="flex items-center justify-between px-6"
            style={{
                background: 'white',
                height: 72,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        ></AntHeader>
    );
}

export default Header;
