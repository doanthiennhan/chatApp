
import React, { useState } from 'react';
import { Input, Button, Space, Upload, Popover, App } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined, AudioOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { sendMessage } from '../../store/slices/chatSlice';

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
    <div style={{ width: 280, height: 200, overflowY: 'auto' }}>
        {/* Replace with a real emoji picker library */}
        <span onClick={() => onSelect('😀')} style={{ cursor: 'pointer', fontSize: 24 }}>😀</span>
        <span onClick={() => onSelect('😂')} style={{ cursor: 'pointer', fontSize: 24 }}>😂</span>
        <span onClick={() => onSelect('❤️')} style={{ cursor: 'pointer', fontSize: 24 }}>❤️</span>
    </div>
);

const MessageInput = ({ activeConversationId }: { activeConversationId: string }) => {
    const dispatch = useDispatch<AppDispatch>();
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
               .catch((err: any) => message.error("Gửi tin nhắn thất bại: " + err.message));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setMessageContent(prev => prev + emoji);
    };

    return (
        <div className="message-input-area">
            <Space.Compact style={{ width: '100%', alignItems: 'center' }}>
                <Upload>
                    <Button icon={<PaperClipOutlined />} shape="circle" />
                </Upload>
                <Popover content={<EmojiPicker onSelect={handleEmojiSelect} />} title="Emojis" trigger="click">
                    <Button icon={<SmileOutlined />} shape="circle" />
                </Popover>
                <Input.TextArea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder="Nhập tin nhắn..."
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} shape="circle" />
            </Space.Compact>
        </div>
    );
};

export default MessageInput;