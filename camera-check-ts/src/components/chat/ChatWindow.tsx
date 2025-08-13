import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Typography, Spin } from 'antd';
import { fetchMessages } from '../../store/slices/chatSlice';
import { RootState, AppDispatch } from '../../store';
import { Conversation, Message, User } from '../../types';

const { Text } = Typography;

interface ChatWindowProps {
  onShowGroupInfo: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onShowGroupInfo }) => {
  const dispatch: AppDispatch = useDispatch();
  
  const { activeConversationId, conversations, messages, status } = useSelector(
    (state: RootState) => state.chat
  );
const { data: messageData, currentPage, totalPages, loading: isLoadingMore } = messages;
  
  const currentUser: User | null = useSelector(
    (state: RootState) => state.auth.userInfo
  );
  const activeConversation: Conversation | undefined = conversations.data.find(
    (c) => c.id === activeConversationId
  );

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
    );
  }

  return (
    <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatHeader activeConversation={activeConversation} onShowGroupInfo={onShowGroupInfo} />
      
      {status === 'loading' ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Đang tải tin nhắn..." />
        </div>
      ) : (
        <MessageList
          messages={messageData as Message[]}
          conversationId={activeConversationId ?? ''}
          hasMore={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          currentPage={currentPage}
        />
      )}

      <MessageInput activeConversationId={activeConversationId ?? ''} />
    </div>
  );
};

export default ChatWindow;
