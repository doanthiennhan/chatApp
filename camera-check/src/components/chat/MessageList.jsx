import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, Typography, Image, Spin, Button } from 'antd';
import { 
    FileTextOutlined, 
    DownloadOutlined 
} from '@ant-design/icons';
import { formatRelativeTime } from '../../utils';
import { fetchMoreMessages } from '../../store/slices/chatSlice';

const { Text } = Typography;

const renderMessageContent = (msg) => {
    switch (msg.type) {
        case 'IMAGE':
            return (
                <div className="message-image-content">
                    <Image src={msg.message} style={{ maxWidth: 250, borderRadius: 12 }} />
                </div>
            );
        case 'FILE':
            return (
                <div className="message-file-content">
                    <FileTextOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                    <div>
                        <a href={msg.message} target="_blank" rel="noopener noreferrer">Tệp đính kèm</a>
                    </div>
                    <Button icon={<DownloadOutlined />} type="text" href={msg.message} download />
                </div>
            );
        case 'TEXT':
        default:
            return <Text>{msg.message}</Text>;
    }
}

const MessageList = ({ messages, currentUser, conversationId, hasMore, isLoadingMore, currentPage }) => {
    const messageListRef = useRef(null);
    const scrollStateBeforeLoad = useRef({ scrollHeight: 0, scrollTop: 0 });
    const isInitialLoad = useRef(true);
    const dispatch = useDispatch();

    useEffect(() => {
        isInitialLoad.current = true;
        scrollStateBeforeLoad.current = { scrollHeight: 0, scrollTop: 0 };
    }, [conversationId]);

    useLayoutEffect(() => {
        const container = messageListRef.current;
        if (!container) return;

        if (scrollStateBeforeLoad.current.scrollHeight > 0) {
            const newScrollHeight = container.scrollHeight;
            const heightDiff = newScrollHeight - scrollStateBeforeLoad.current.scrollHeight;
            container.scrollTop = scrollStateBeforeLoad.current.scrollTop + heightDiff;
            
            scrollStateBeforeLoad.current = { scrollHeight: 0, scrollTop: 0 };
        }
        else if (isInitialLoad.current && messages.length > 0) {
            container.scrollTop = container.scrollHeight;
            isInitialLoad.current = false;
        }
    }, [messages]);

    const handleScroll = useCallback(() => {
        const container = messageListRef.current;
        if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
            scrollStateBeforeLoad.current = {
                scrollHeight: container.scrollHeight,
                scrollTop: container.scrollTop,
            };
            dispatch(fetchMoreMessages({ conversationId, page: currentPage + 1 }));
        }
    }, [hasMore, isLoadingMore, dispatch, conversationId, currentPage]);

    useEffect(() => {
        const messageListElement = messageListRef.current;
        messageListElement.addEventListener('scroll', handleScroll);
        return () => {
            messageListElement.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className="message-list" ref={messageListRef}>
            {isLoadingMore && <div style={{ textAlign: 'center' }}><Spin /></div>}
            {messages.map(msg => {
                if (msg.type === 'SYSTEM') {
                    return <div key={msg.id} className="system-message">{msg.message}</div>
                }
                const isSent = msg.me;
                return (
                    <div key={msg.id} className={`message-container ${isSent ? 'sent' : 'received'}`}>
                        <Avatar src={msg.sender?.avatar} />
                        <div className="message-content">
                            <div className="message-sender-info">
                                <Text strong className="message-sender-name">{isSent ? 'Bạn' : msg.sender?.email}</Text>
                                <Text type="secondary" className="message-timestamp">{formatRelativeTime(msg.createdDate)}</Text>
                            </div>
                            <div className="message-bubble">
                                {renderMessageContent(msg)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageList;
