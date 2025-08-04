import React, { useState, useEffect } from 'react';
import { Input, List, Avatar, Badge, Typography, Tabs, Space, Button } from 'antd';
import { UsergroupAddOutlined, UserAddOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, setActiveConversation } from '../../store/slices/chatSlice';
import { formatRelativeTime } from '../../utils';

const { Text } = Typography;
const { TabPane } = Tabs;

const ChatSidebar = ({ onCreateGroup, onAddFriend }) => {
    const dispatch = useDispatch();
    const { conversations, activeConversationId, status } = useSelector(state => state.chat);
    const currentUser = useSelector(state => state.auth.userInfo);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const getConversationDetails = (conv) => {
        if (conv.type === 'DIRECT') {
            const otherUser = conv.participants?.find(p => p.id !== currentUser?.sub);
            return {
                name: otherUser?.username || 'Direct Message',
                avatar: otherUser?.avatar || null,
            };
        }
        return {
            name: conv.name,
            avatar: conv.avatar || null,
        };
    };

    const filteredConversations = conversations
        .filter(c => {
            if (activeTab === 'personal') return c.type === 'DIRECT';
            if (activeTab === 'group') return c.type === 'GROUP';
            return true;
        })
        .filter(c => {
            const details = getConversationDetails(c);
            return details.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <Input.Search
                    placeholder="Tìm kiếm..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Space style={{ width: '100%', justifyContent: 'center' }}>
                    <Button icon={<UserAddOutlined />} onClick={onAddFriend}>Thêm bạn</Button>
                    <Button icon={<UsergroupAddOutlined />} onClick={onCreateGroup}>Tạo nhóm</Button>
                </Space>
            </div>
            <Tabs defaultActiveKey="all" centered className="sidebar-tabs" onChange={setActiveTab}>
                <TabPane tab="Tất cả" key="all" />
                <TabPane tab="Cá nhân" key="personal" />
                <TabPane tab="Nhóm" key="group" />
            </Tabs>
            <List
                className="conversation-list"
                dataSource={filteredConversations}
                loading={status === 'loading'}
                renderItem={item => {
                    const details = getConversationDetails(item);
                    return (
                        <List.Item
                            className={item.id === activeConversationId ? 'active' : ''}
                            onClick={() => dispatch(setActiveConversation(item.id))}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={details.avatar} />}
                                title={<Text strong>{details.name}</Text>}
                                description={<Text type="secondary" ellipsis>{item.lastMessage?.content || 'Chưa có tin nhắn'}</Text>}
                            />
                            <div style={{ textAlign: 'right' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.lastMessage ? formatRelativeTime(item.lastMessage.timestamp) : ''}
                                </Text>
                                <br />
                                {item.unreadCount > 0 && <Badge count={item.unreadCount} style={{ marginTop: 4 }}/>}
                            </div>
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};

export default ChatSidebar;