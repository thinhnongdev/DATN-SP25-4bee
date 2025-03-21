import React, { useState } from 'react';
import axios from 'axios';
import '../Chat/Chatbot.css';

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false); // Trạng thái hiển thị chat

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return; // Không gửi nếu input rỗng

        // Thêm tin nhắn của người dùng vào danh sách
        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            // Gửi yêu cầu tới API mà không cần token
            const response = await axios.post('http://localhost:8080/api/chat', input, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });

            // Thêm phản hồi từ bot
            const botMessage = { text: response.data, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error calling API:', error);
            // Xử lý lỗi chung (không cần xử lý 401 vì endpoint đã public)
            setMessages((prev) => [
                ...prev,
                { text: 'Có lỗi xảy ra, vui lòng thử lại!', sender: 'bot' },
            ]);
        }

        setInput(''); // Xóa input sau khi gửi
    };

    const toggleChat = () => {
        setIsOpen(!isOpen); // Bật/tắt giao diện chat
    };

    return (
        <div>
            {/* Nút icon nổi */}
            <button className="chatbot-icon" onClick={toggleChat}>
                💬 {/* Có thể thay bằng icon khác */}
            </button>

            {/* Giao diện chat chỉ hiển thị khi isOpen = true */}
            {isOpen && (
                <div className="chatbot-container">
                    <h5>TVVA</h5>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="chat-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Hỏi về sản phẩm..."
                            className="chat-input"
                        />
                        <button type="submit" className="chat-button">Gửi</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;