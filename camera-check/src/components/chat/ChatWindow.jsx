import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Typography, Spin } from 'antd';
import { fetchMessages } from '../../store/slices/chatSlice';

const { Text } = Typography;

const ChatWindow = ({ onShowGroupInfo }) => {
    const dispatch = useDispatch();
    const { activeConversationId, conversations, messages, status } = useSelector(state => state.chat);
    const { data: messageData, currentPage, totalPages, loading: isLoadingMore } = messages;
    const currentUser = useSelector(state => state.auth.userInfo);
    const activeConversation = conversations.find(c => c.id === activeConversationId);

    useEffect(() => {
        if (activeConversationId) {
            dispatch(fetchMessages({ conversationId: activeConversationId }));
        }
    }, [dispatch, activeConversationId]);

    const hasMoreMessages = currentPage < totalPages - 1;

    if (!activeConversation) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text type="secondary">Chọn một cuộc trò chuyện để bắt đầu</Text>
            </div>
        )
    }

    return (
        <div className="chat-window">
            <ChatHeader 
                activeConversation={activeConversation} 
                onShowGroupInfo={onShowGroupInfo} 
            />
            {status === 'loading' ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" tip="Đang tải tin nhắn..." />
                </div>
            ) : (
                <MessageList 
                    messages={messageData} 
                    currentUser={currentUser} 
                    conversationId={activeConversationId}
                    hasMore={hasMoreMessages}
                    isLoadingMore={isLoadingMore}
                    currentPage={currentPage}
                />
            )}
            <MessageInput activeConversationId={activeConversationId} />
        </div>
    );
};

export default ChatWindow;