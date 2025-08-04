import React, { useState } from 'react';
import { Input, Button, Space, Upload, Popover, App } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined, AudioOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { sendMessage } from '../../store/slices/chatSlice';

// A placeholder for an emoji picker component
const EmojiPicker = ({ onSelect }) => (
    <div style={{ width: 280, height: 200, overflowY: 'auto' }}>
        {/* Replace with a real emoji picker library */}
        <span onClick={() => onSelect('😀')} style={{ cursor: 'pointer', fontSize: 24 }}>😀</span>
        <span onClick={() => onSelect('😂')} style={{ cursor: 'pointer', fontSize: 24 }}>😂</span>
        <span onClick={() => onSelect('❤️')} style={{ cursor: 'pointer', fontSize: 24 }}>❤️</span>
    </div>
);

const MessageInput = ({ activeConversationId }) => {
    const dispatch = useDispatch();
    const [messageContent, setMessageContent] = useState('');
    const { message } = App.useApp();

    const handleSendMessage = () => {
        if (messageContent.trim() && activeConversationId) {
            dispatch(sendMessage({
                conversationId: activeConversationId,
                message: messageContent.trim(),
                type: 'TEXT',
            })).unwrap()
               .then(() => setMessageContent(''))
               .catch(err => message.error("Gửi tin nhắn thất bại: " + err.message));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessageContent(prev => prev + emoji);
    };

    return (
        <div className="message-input-area">
            <Space.Compact style={{ width: '100%' }}>
                <Input.TextArea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder="Nhập tin nhắn..."
                    style={{ borderRight: 'none' }}
                />
                <Upload>
                    <Button icon={<PaperClipOutlined />} />
                </Upload>
                <Popover content={<EmojiPicker onSelect={handleEmojiSelect} />} title="Emojis" trigger="click">
                    <Button icon={<SmileOutlined />} />
                </Popover>
                <Button icon={<AudioOutlined />} />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} />
            </Space.Compact>
        </div>
    );
};

export default MessageInput;