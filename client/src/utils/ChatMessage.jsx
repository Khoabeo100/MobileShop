import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { requestCreateMessage, requestGetMessages } from '../config/request';
import { useStore } from '../hooks/useStore';

function ModernChatMessage() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // 👉 id user đang đăng nhập (bạn thay bằng lấy từ context/localStorage)
    const { dataUser, newMessageUser } = useStore();

    const fetchData = async () => {
        if (isOpen) {
            setIsLoading(true);
            const res = await requestGetMessages();

            const mappedMessages = res.metadata.map((msg) => ({
                id: msg.id,
                text: msg.text,
                senderId: msg.senderId === dataUser.id ? 'user' : 'admin',
                createdAt: msg.createdAt,
            }));

            setMessages(mappedMessages);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (newMessageUser) {
            setMessages((prev) => [...prev, newMessageUser]);
            setIsTyping(false);
        }
    }, [newMessageUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (inputValue.trim() === '') return;

        const newMessage = {
            id: Date.now(),
            text: inputValue,
            senderId: dataUser.id,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');

        if (textareaRef.current) {
            textareaRef.current.style.height = '48px';
        }

        const data = {
            senderId: dataUser.id,
            text: inputValue,
        };
        await requestCreateMessage(data);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = useMemo(() => {
        return (createdAt) => {
            const now = new Date();
            const messageTime = new Date(createdAt);
            const diffMs = now - messageTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes < 1 ? 'Vừa xong' : `${diffMinutes} phút trước`;
            } else if (diffHours < 24) {
                return `${diffHours} giờ trước`;
            } else {
                return messageTime.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }
        };
    }, []);

    const ChatBubble = React.memo(({ message }) => {
        const isUser = message.senderId === dataUser.id;

        return (
            <div className={`flex items-end gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && message.avatar && (
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                        <img src={message.avatar} alt="Support" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                    <div
                        className={`relative px-4 py-3 rounded-2xl ${
                            isUser
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                        }`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>

                    <div className={`text-xs text-gray-500 mt-2 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.createdAt)}
                    </div>
                </div>

                {isUser && (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md">
                        B
                    </div>
                )}
            </div>
        );
    });

    const TypingIndicator = React.memo(() => (
        <div className="flex items-end gap-3 mb-6">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                <img
                    src="https://cdn2.cellphones.com.vn/x/media/favicon/default/logo-cps.png"
                    alt="Support"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-1">
                    <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    ></div>
                </div>
            </div>
        </div>
    ));

    const FloatingButton = () => (
        <div className="fixed bottom-6 right-6 z-50 cursor-pointer" onClick={() => setIsOpen(true)}>
            <div className="relative">
                <div className="w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:bg-blue-700 hover:scale-110 hover:shadow-2xl">
                    <MessageCircle size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <FloatingButton />

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                                        <img
                                            src="https://cdn2.cellphones.com.vn/x/media/favicon/default/logo-cps.png"
                                            alt="Support"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Quản lý Admin</h3>
                                    <p className="text-sm text-green-600 font-medium">Đang hoạt động</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 ml-2"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {dataUser.role === 'admin' && (
                            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-200">
                                    <div className="flex justify-center mb-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-12 w-12 text-red-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Chỉ dành cho tài khoản người dùng
                                    </h2>
                                    <p className="text-gray-600 mt-2">
                                        Vui lòng đăng nhập bằng tài khoản{' '}
                                        <span className="font-medium text-indigo-600">người dùng</span> để chat.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-gray-600 text-sm">Website chưa có Admin</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <ChatBubble key={message.id} message={message} />
                                    ))}

                                    {isTyping && <TypingIndicator />}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        disabled={dataUser.role === 'admin'}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Nhập tin nhắn..."
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder-gray-500"
                                        rows="1"
                                        style={{ maxHeight: '120px', minHeight: '48px' }}
                                    />
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center transition-all transform hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-blue-600 shadow-md"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ModernChatMessage;
