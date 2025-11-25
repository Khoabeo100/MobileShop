import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    requestAuth,
    requestGetCart,
    requestGetCategories,
    requestGetFavouriteProducts,
    requestGetNoticationByUserId,
    requestReview,
} from '../config/request';
import { ToastContainer } from 'react-toastify';

import ChatMessage from '../utils/ChatMessage';

import { io } from 'socket.io-client';
import ModalAIReview from '../components/ModalAIReview';

export function Provider({ children }) {
    const location = useLocation();
    const [dataUser, setDataUser] = useState({});
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [notication, setNotication] = useState([]);
    const [isOpenModalAIReview, setIsOpenModalAIReview] = useState(false);
    const [idProductReview, setIdProductReview] = useState('');

    const [newMessageAdmin, setNewMessageAdmin] = useState({});
    const [newMessageUser, setNewMessageUser] = useState({});
    const [newNotication, setNewNotication] = useState({});

    const socketRef = useRef(null);

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const fetchCategory = async () => {
        const res = await requestGetCategories();
        setCategories(res.metadata);
    };

    const fetchCart = async () => {
        const res = await requestGetCart();
        setCart(res.metadata);
    };

    const fetchFavorites = async () => {
        try {
            const res = await requestGetFavouriteProducts();
            setFavorites(res.metadata);
        } catch (error) {
            throw error;
        }
    };

    const fetchNotication = async () => {
        const res = await requestGetNoticationByUserId();
        setNotication(res.metadata);
    };

    useEffect(() => {
        if (!dataUser) {
            return;
        }
        const socket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('newMessage', (message) => {
            setNewMessageAdmin(message);
        });

        socket.on('update-status', (notication) => {
            setNewNotication(notication);
        });

        socket.on('newMessageUser', (message) => {
            setNewMessageUser(message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const token = cookies.get('logged');

        fetchCategory();
        if (!token) {
            return;
        }
        fetchAuth();
        fetchCart();
        fetchFavorites();
        fetchNotication();
    }, []);

    const onClose = () => {
        setIsOpenModalAIReview(false);
        setIdProductReview('');
    };

    return (
        <>
            <Context.Provider
                value={{
                    dataUser,
                    categories,
                    cart,
                    fetchCart,
                    favorites,
                    fetchFavorites,
                    newMessageAdmin,
                    newMessageUser,
                    notication,
                    fetchNotication,
                    newNotication,
                    setNotication,
                    setIsOpenModalAIReview,
                    idProductReview,
                    setIdProductReview,
                }}
            >
                {children}
                <ToastContainer />
                {!location.pathname.includes('/admin') && <ChatMessage />}
                <ModalAIReview
                    isOpen={isOpenModalAIReview}
                    idProductReview={idProductReview}
                    setIsOpenModalAIReview={setIsOpenModalAIReview}
                />
            </Context.Provider>
        </>
    );
}
