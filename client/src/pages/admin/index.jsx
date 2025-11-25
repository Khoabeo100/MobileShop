import { useState, useEffect } from 'react';
import { Layout, theme, ConfigProvider } from 'antd';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CategoryManagement from './components/CategoryManagement';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';
import WebsiteManagement from './components/ManagerWebsite';
import Messager from './components/Messager/Messager';
import CouponManagement from './components/CouponManagement';
import BlogAdmin from './components/BlogAdmin';
import { useStore } from '../../hooks/useStore';

const { Content } = Layout;
const { useToken } = theme;

function Admin() {
    const [collapsed, setCollapsed] = useState(false);
    const { token } = useToken();

    const { dataUser } = useStore();

    const navigate = useNavigate();

    useEffect(() => {
        if (!dataUser) {
            navigate('/login');
        }
        if (dataUser.role === 'user') {
            navigate('/');
        }
    }, [dataUser]);

    // Default route is dashboard
    const [activeTab, setActiveTab] = useState('dashboard');

    // Add custom styles to the document
    useEffect(() => {
        // Add custom CSS for scrollbar and other global styles
        const style = document.createElement('style');
        style.textContent = `
            .sidebar-menu .ant-menu-item-selected {
                background-color: rgba(255, 255, 255, 0.2) !important;
                border-radius: 10px;
            }
            
            .sidebar-menu .ant-menu-item {
                border-radius: 10px;
                margin: 4px 0;
                height: 48px !important;
            }
            
            .sidebar-menu .ant-menu-item:hover {
                background-color: rgba(255, 255, 255, 0.1) !important;
            }
            
            .logout-item.ant-menu-item {
                color: #ff7875 !important;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            
            ::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            /* Ant Design table styles */
            .ant-table {
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .ant-table-thead > tr > th {
                background-color: #f9fafb !important;
                font-weight: 600;
            }
            
            /* Card styles */
            .admin-card {
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard token={token} />;
            case 'website':
                return <WebsiteManagement />;
            case 'products':
                return <ProductManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'users':
                return <UserManagement />;
            case 'messages':
                return <Messager />;
            case 'coupons':
                return <CouponManagement />;
            case 'blog':
                return <BlogAdmin />;
            default:
                return <Dashboard token={token} />;
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1e2f64',
                    borderRadius: 8,
                },
                components: {
                    Button: {
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                    Table: {
                        borderRadius: 12,
                        headerBg: '#f9fafb',
                    },
                    Card: {
                        borderRadius: 12,
                    },
                    Input: {
                        borderRadius: 8,
                    },
                },
            }}
        >
            <Layout className="min-h-screen">
                <Sidebar collapsed={collapsed} token={token} activeTab={activeTab} setActiveTab={setActiveTab} />

                <Layout style={{ background: '#f5f7fa' }}>
                    <Header collapsed={collapsed} setCollapsed={setCollapsed} token={token} />

                    <Content
                        className="p-6 overflow-y-auto scrollbar-thin"
                        style={{
                            minHeight: 'calc(100vh - 72px)',
                            maxHeight: 'calc(100vh - 72px)',
                            overflow: 'auto',
                        }}
                    >
                        <div className="max-w-screen-2xl mx-auto">{renderContent()}</div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}

export default Admin;
