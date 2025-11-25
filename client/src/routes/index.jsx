import App from '../App';
import Admin from '../pages/admin';
import CartUser from '../pages/Cart';
import Category from '../pages/Category';
import CheckOut from '../pages/CheckOut';
import DetailBlog from '../pages/DetailBlog';
import DetailProduct from '../pages/DetailProduct';
import ForgotPassword from '../pages/ForgotPassword';
import InfoUser from '../pages/InfoUser';
import Login from '../pages/Login';
import LoginAdmin from '../pages/LoginAdmin';
import PaymentSuccess from '../pages/PaymentSuccess';
import Register from '../pages/Register';
export const routes = [
    {
        path: '/',
        component: <App />,
    },
    {
        path: '/login',
        component: <Login />,
    },
    {
        path: '/register',
        component: <Register />,
    },
    {
        path: '/product/:id',
        component: <DetailProduct />,
    },
    {
        path: '/cart',
        component: <CartUser />,
    },
    {
        path: '/checkout',
        component: <CheckOut />,
    },
    {
        path: '/payment-success/:id',
        component: <PaymentSuccess />,
    },
    {
        path: '/profile',
        component: <InfoUser />,
    },
    {
        path: '/order',
        component: <InfoUser />,
    },
    {
        path: '/favourite',
        component: <InfoUser />,
    },
    {
        path: '/login-admin',
        component: <LoginAdmin />,
    },
    {
        path: '/admin',
        component: <Admin />,
    },
    {
        path: '/category/:id',
        component: <Category />,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
    },
    {
        path: '/blog/:id',
        component: <DetailBlog />,
    },
];
