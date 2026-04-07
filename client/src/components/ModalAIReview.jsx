import React, { useEffect, useState } from 'react';
import {
    X,
    Gamepad2,
    Briefcase,
    Camera,
    Video,
    Globe,
    GraduationCap,
    Brain,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { requestReview } from '../config/request';

function ModalAIReview({ isOpen, idProductReview, setIsOpenModalAIReview }) {
    const [selectedPurpose, setSelectedPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [dataReview, setDataReview] = useState({});

    if (!isOpen) return null;

    const onClose = () => {
        setSelectedPurpose('');
        setDataReview({});
        setShowAnalysis(false);
        setIsOpenModalAIReview(false);
    };

    // Các mục đích sử dụng điện thoại
    const purposes = [
        {
            id: 'gaming',
            label: 'Chơi Game',
            icon: Gamepad2,
            gradient: 'from-red-500 via-pink-500 to-purple-500',
            description: 'PUBG, Liên Quân, Genshin Impact',
            bgColor: 'bg-red-50 hover:bg-red-100',
            borderColor: 'border-red-200 hover:border-red-300',
        },
        {
            id: 'office',
            label: 'Công Việc',
            icon: Briefcase,
            gradient: 'from-blue-500 via-cyan-500 to-teal-500',
            description: 'Gọi video, email, chat, quản lý file',
            bgColor: 'bg-blue-50 hover:bg-blue-100',
            borderColor: 'border-blue-200 hover:border-blue-300',
        },
        {
            id: 'camera',
            label: 'Nhiếp Ảnh',
            icon: Camera,
            gradient: 'from-purple-500 via-indigo-500 to-blue-500',
            description: 'Chụp ảnh, chỉnh sửa, lưu giữ kỷ niệm',
            bgColor: 'bg-purple-50 hover:bg-purple-100',
            borderColor: 'border-purple-200 hover:border-purple-300',
        },
        {
            id: 'video',
            label: 'Quay Video',
            icon: Video,
            gradient: 'from-orange-500 via-red-500 to-pink-500',
            description: 'TikTok, YouTube, Vlog, dựng clip',
            bgColor: 'bg-orange-50 hover:bg-orange-100',
            borderColor: 'border-orange-200 hover:border-orange-300',
        },
        {
            id: 'social',
            label: 'Mạng Xã Hội',
            icon: Globe,
            gradient: 'from-green-500 via-emerald-500 to-teal-500',
            description: 'Facebook, Instagram, TikTok, Zalo',
            bgColor: 'bg-green-50 hover:bg-green-100',
            borderColor: 'border-green-200 hover:border-green-300',
        },
        {
            id: 'student',
            label: 'Học Tập',
            icon: GraduationCap,
            gradient: 'from-yellow-500 via-amber-500 to-orange-500',
            description: 'Học online, Google Meet, tra cứu tài liệu',
            bgColor: 'bg-yellow-50 hover:bg-yellow-100',
            borderColor: 'border-yellow-200 hover:border-yellow-300',
        },
    ];

    const handleSubmit = async () => {
        if (!selectedPurpose) {
            alert('Vui lòng chọn mục đích sử dụng!');
            return;
        }

        setIsLoading(true);
        setShowAnalysis(true);

        try {
            const data = {
                purpose: selectedPurpose,
                productId: idProductReview,
            };
            const res = await requestReview(data);
            setDataReview(res.reviewData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                {showAnalysis ? <AnalysisUI /> : <SelectionUI />}
            </div>
        </div>
    );

    function SelectionUI() {
        return (
            <>
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <Brain size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">AI Review Điện Thoại</h2>
                            <p className="text-blue-100 text-sm">
                                Để AI phân tích và tư vấn smartphone phù hợp nhất cho bạn
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Sparkles className="text-blue-500" size={20} />
                            Bạn sẽ sử dụng điện thoại này để làm gì?
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Chọn mục đích chính để AI có thể đưa ra đánh giá chính xác nhất
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {purposes.map((purpose) => {
                            const IconComponent = purpose.icon;
                            const isSelected = selectedPurpose === purpose.id;

                            return (
                                <div
                                    key={purpose.id}
                                    onClick={() => setSelectedPurpose(purpose.id)}
                                    className={`
                                        relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-105
                                        ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50'
                                                : `${purpose.borderColor} ${purpose.bgColor} hover:shadow-lg`
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
                                    )}
                                    <div className="relative z-10">
                                        <div
                                            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${purpose.gradient} mb-3`}
                                        >
                                            <IconComponent size={24} className="text-white" />
                                        </div>
                                        <h4 className="text-base font-bold text-gray-800 mb-2">{purpose.label}</h4>
                                        <p className="text-gray-600 text-xs leading-relaxed">{purpose.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedPurpose || isLoading}
                            className={`
                                px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 flex items-center gap-2
                                ${
                                    selectedPurpose && !isLoading
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang phân tích...
                                </>
                            ) : (
                                <>
                                    <Brain size={18} />
                                    Bắt đầu phân tích AI
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    function AnalysisUI() {
        const selectedPurposeData = purposes.find((p) => p.id === selectedPurpose);
        const IconComponent = selectedPurposeData?.icon || Brain;

        if (isLoading) {
            return (
                <div className="p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        const createMarkup = () => {
            return { __html: dataReview.analysis };
        };

        return (
            <>
                <div className="relative bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 p-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <Brain size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Kết Quả Phân Tích AI</h2>
                            <p className="text-blue-100 text-sm">
                                {dataReview.productName} - Mục đích: {dataReview.purpose}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div dangerouslySetInnerHTML={createMarkup()} />
                </div>
            </>
        );
    }
}

export default ModalAIReview;
