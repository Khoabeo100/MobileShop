import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingCart,
    DollarSign,
    Package,
    Eye,
    ChevronRight,
    Calendar,
    Filter,
    Download,
    Sparkles,
    Activity,
    Star,
} from 'lucide-react';
import { requestGetStatistic } from '../../../config/request';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('month');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [animateNumbers, setAnimateNumbers] = useState(false);

    useEffect(() => {
        setAnimateNumbers(true);
    }, []);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        customers: { count: 0, growth: 0, isPositive: true },
        orders: { count: 0, growth: 0, isPositive: true },
        revenue: { count: 0, growth: 0, isPositive: true },
        products: { count: 0, growth: 0, isPositive: true },
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await requestGetStatistic();
                setStats(response.metadata.stats);
                setMonthlyData(response.metadata.monthlyData);
                setRecentOrders(response.metadata.recentOrders);
                setTopProducts(
                    response.metadata.topProducts.map((product, index) => ({
                        ...product,
                        color: colors[index % colors.length],
                    })),
                );
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ title, count, growth, isPositive, icon: Icon, gradient, delay = 0 }) => (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group`}
            style={{ animationDelay: `${delay}ms` }}
            onMouseEnter={() => setHoveredCard(title)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div
                        className={`flex items-center text-sm font-medium ${
                            isPositive ? 'text-green-200' : 'text-red-200'
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(growth)}%
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p
                        className={`text-3xl font-bold transition-all duration-1000 ${
                            animateNumbers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        {title === 'Doanh thu' ? `${(count / 1000000).toFixed(0)}M đ` : count.toLocaleString('vi-VN')}
                    </p>
                </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full"></div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Hoàn thành':
                return 'bg-green-100 text-green-800';
            case 'Đang xử lý':
                return 'bg-blue-100 text-blue-800';
            case 'Đang giao':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-orange-100 text-orange-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8 animate-fadeIn">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Bảng Điều Khiển
                        </h1>
                        <p className="text-slate-600 mt-2 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                            Xin chào, chúc bạn một ngày làm việc hiệu quả!
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Khách hàng"
                    count={stats.customers.count}
                    growth={stats.customers.growth}
                    isPositive={stats.customers.isPositive}
                    icon={Users}
                    gradient="from-blue-500 to-blue-600"
                    delay={0}
                />
                <StatCard
                    title="Đơn hàng"
                    count={stats.orders.count}
                    growth={stats.orders.growth}
                    isPositive={stats.orders.isPositive}
                    icon={ShoppingCart}
                    gradient="from-purple-500 to-purple-600"
                    delay={100}
                />
                <StatCard
                    title="Doanh thu"
                    count={stats.revenue.count}
                    growth={stats.revenue.growth}
                    isPositive={stats.revenue.isPositive}
                    icon={DollarSign}
                    gradient="from-green-500 to-green-600"
                    delay={200}
                />
                <StatCard
                    title="Sản phẩm"
                    count={stats.products.count}
                    growth={stats.products.growth}
                    isPositive={stats.products.isPositive}
                    icon={Package}
                    gradient="from-orange-500 to-orange-600"
                    delay={300}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-800">Biểu Đồ Doanh Thu Theo Tháng</h3>
                            <p className="text-slate-500 text-sm mt-1">Phân tích chi tiết doanh thu và lợi nhuận</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-slate-800">Top Sản Phẩm Bán Chạy Nhất</h3>
                    </div>
                    <div className="h-48 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topProducts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-3"
                                        style={{ backgroundColor: product.color }}
                                    ></div>
                                    <span className="text-slate-700 text-sm">{product.name}</span>
                                </div>
                                <span className="text-slate-900 font-medium">{product.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800">Danh Sách Đơn Hàng Mới Nhất</h3>
                        <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý các giao dịch gần đây</p>
                    </div>
                </div>
                <div className="overflow-hidden">
                    <div className="space-y-4">
                        {recentOrders.map((order, index) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200 border border-slate-100"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                                        {order.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            #{order.id} - {order.customer}
                                        </p>
                                        <p className="text-slate-500 text-sm">{order.product}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-800">
                                        {order.amount.toLocaleString('vi-VN')} đ
                                    </p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            order.status,
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
