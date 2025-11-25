import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, Typography, Empty } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '../../../../../hooks/useStore';
import { requestCreateMessageAdmin } from '../../../../../config/request';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;

function ChatWindow({ selectedUser, messages, setMessages }) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const { dataUser, newMessageAdmin } = useStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (newMessageAdmin && selectedUser && newMessageAdmin.senderId === selectedUser.senderId) {
            setMessages((prev) => [...prev, newMessageAdmin]);
        }
    }, [newMessageAdmin]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        try {
            const data = {
                text: inputValue,
                receiverId: selectedUser.senderId,
            };
            const res = await requestCreateMessageAdmin(data);
            setMessages((prev) => [...prev, res.metadata]);
            setInputValue('');
        } catch (error) {
            console.log(error);
        }
    };

    if (!selectedUser || !selectedUser.senderId) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
                <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    description={<Text strong>Chọn một cuộc trò chuyện để bắt đầu</Text>}
                />
            </div>
        );
    }

    return (
        <div className="h-[90vh] flex flex-col bg-white border-l border-gray-200">
            {/* Chat Header */}
            <header className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                <Avatar size={40} src={selectedUser.avatar} icon={<UserOutlined />} />
                <div>
                    <Title level={5} className="!mb-0">
                        {selectedUser.fullName}
                    </Title>
                    <Text type="secondary" className="text-xs">
                        {selectedUser.isOnline === 'online' ? (
                            <Text type="success">Đang hoạt động</Text>
                        ) : (
                            <Text type="danger">Đang không hoạt động</Text>
                        )}
                    </Text>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg, index) => {
                    const isUser = msg.senderId === dataUser.id;
                    return (
                        <div key={index} className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                            {!isUser && <Avatar size={32} src={selectedUser.avatar} icon={<UserOutlined />} />}
                            <div className="max-w-[70%]">
                                <div
                                    className={`py-2 px-3 rounded-lg shadow-sm ${
                                        isUser
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800 border border-gray-100'
                                    }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                <div
                                    className={`text-xs text-gray-500 mt-1 ${
                                        isUser ? 'text-right pr-1' : 'text-left pl-1'
                                    }`}
                                >
                                    {dayjs(msg.createdAt).format('HH:mm')}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Footer */}
            <footer className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        onPressEnter={handleSendMessage}
                        className="rounded-lg"
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                    >
                        Gửi
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export default ChatWindow;
