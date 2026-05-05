import { useState } from 'react';
import { requestChatbot } from '../config/request';

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        const question = inputValue.trim();
        if (!question) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            text: question,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError('');

        try {
            const res = await requestChatbot({ question });

            const botText = res?.answer || 'Xin lỗi, chatbot chưa trả lời được.';

            const botMessage = {
                id: Date.now() + 1,
                role: 'bot',
                text: botText,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setError('Không thể kết nối chatbot. Vui lòng thử lại.');

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    role: 'bot',
                    text: 'Lỗi kết nối chatbot. Vui lòng thử lại.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white border rounded-2xl shadow-sm">
            <div className="mb-4 flex justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Chatbot trợ giúp</h2>
                    <p className="text-sm text-gray-600">Nhập câu hỏi của bạn và nhận tư vấn nhanh.</p>
                </div>

                {isLoading && <span>Đang gửi...</span>}
            </div>

            <div className="space-y-3 mb-4 max-h-[420px] overflow-y-auto">
                {messages.length === 0 && <div className="text-sm text-gray-500">Chưa có tin nhắn nào.</div>}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-3 rounded-xl ${
                            msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100'
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="flex gap-2">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi..."
                    className="flex-1 border p-2 rounded"
                />

                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-blue-600 text-white px-4 rounded"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
