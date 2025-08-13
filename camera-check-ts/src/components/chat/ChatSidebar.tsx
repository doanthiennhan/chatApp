import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, List, Avatar, Badge, Typography, Tabs, Space, Button, Spin } from 'antd';
import { UsergroupAddOutlined, UserAddOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, fetchMoreConversations, setActiveConversationId } from '../../store/slices/chatSlice';
import { formatRelativeTime } from '../../utils';
import { Conversation, User } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ChatSidebarProps {
    onCreateGroup: () => void;
    onAddFriend: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onCreateGroup, onAddFriend }) => {
    const dispatch: AppDispatch = useDispatch();
    const { conversations, activeConversationId } = useSelector((state: RootState) => state.chat);
    const currentUser: User | null = useSelector((state: RootState) => state.auth.userInfo);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchConversations({ search: searchQuery }));
    }, [dispatch, searchQuery]);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollTop + clientHeight >= scrollHeight - 20 && !conversations.loading) {
                if (conversations.currentPage < conversations.totalPages - 1) {
                    dispatch(fetchMoreConversations({ page: conversations.currentPage + 1, search: searchQuery }));
                }
            }
        }
    }, [conversations.loading, conversations.currentPage, conversations.totalPages, dispatch, searchQuery]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    const getConversationDetails = (conv: Conversation) => {
        if (conv.type === 'DIRECT') {
            const otherUser = conv.participants?.find(p => p.id !== currentUser?.id);
            return {
                name: otherUser?.username || t('direct_message'),
                avatar: otherUser?.avatar || null,
            };
        }
        return {
            name: conv.conversationName,
            avatar: conv.conversationAvatar || null,
        };
    };

    const filteredConversations = conversations.data
        .filter((c: Conversation) => {
            if (activeTab === 'personal') return c.type === 'DIRECT';
            if (activeTab === 'group') return c.type === 'GROUP';
            return true;
        });

    const tabItems = [
        { label: t('all'), key: 'all' },
        { label: t('personal'), key: 'personal' },
        { label: t('group'), key: 'group' },
    ];

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <Input.Search
                    placeholder={t('search_placeholder')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Space style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
                    <Button type="primary" block icon={<UserAddOutlined />} onClick={onAddFriend}>{t('add_friend')}</Button>
                    <Button type="primary" block icon={<UsergroupAddOutlined />} onClick={onCreateGroup}>{t('create_group')}</Button>
                </Space>
            </div>
            <Tabs defaultActiveKey="all" centered className="sidebar-tabs" onChange={setActiveTab} items={tabItems} />
            <div ref={scrollContainerRef} className="conversation-list-container" style={{ overflowY: 'auto', height: 'calc(100vh - 240px)' }}>
                <List
                    className="conversation-list"
                    dataSource={filteredConversations}
                    renderItem={(item: Conversation) => {
                        const details = getConversationDetails(item);
                        return (
                            <List.Item
                                className={item.id === activeConversationId ? 'active' : ''}
                                onClick={() => {
                                    dispatch(setActiveConversationId(item.id));
                                }}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={details.avatar} size={40} />}
                                    title={<Text strong>{details.name}</Text>}
                                    description={<Text type="secondary" ellipsis>{item.lastMessage?.message || t('no_message_yet')}</Text>}
                                />
                                <div style={{ textAlign: 'right', alignSelf: 'flex-start' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {item.lastMessage ? formatRelativeTime(item.lastMessage.createdDate) : ''}
                                    </Text>
                                    <br />
                                    {item.unreadCount && item.unreadCount > 0 && <Badge count={item.unreadCount} style={{ marginTop: 4 }}/>}
                                </div>
                            </List.Item>
                        );
                    }}
                />
                {conversations.loading && <div style={{ textAlign: 'center', padding: '10px' }}><Spin /></div>}
            </div>
        </div>
    );
};

export default ChatSidebar;
