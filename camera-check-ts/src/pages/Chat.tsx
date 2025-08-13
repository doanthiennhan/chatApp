import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import GroupInfoDrawer from '../components/chat/GroupInfoDrawer';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import AddFriendModal from '../components/chat/AddFriendModal';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../store/slices/chatSlice';
import io from 'socket.io-client';
import { getAccessToken } from '../services/identityService';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AppHeader from '../components/layout/AppHeader';
import { useTranslation } from 'react-i18next';

const { Sider, Content } = Layout;

const Chat = () => {
    const dispatch = useDispatch();
    const { conversations, activeConversationId } = useSelector(state => state.chat);
    const [groupInfoVisible, setGroupInfoVisible] = useState(false);
    const [createGroupVisible, setCreateGroupVisible] = useState(false);
    const [addFriendVisible, setAddFriendVisible] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // New state for sidebar collapse
    const { t } = useTranslation();

    useEffect(() => {
        console.log('Chat component mounted');
        const token = getAccessToken();
        if (token) {
            const socket = io('ws://localhost:8099', { query: { token } });

            socket.on('connect', () => console.log('Socket.IO connected'));

            socket.on('message', (msg) => {
                console.log('Received new message from WebSocket:', msg);
                let messagePayload;
                if (typeof msg === 'string') {
                    try {
                        messagePayload = JSON.parse(msg);
                    } catch (e) {
                        console.error("Error parsing websocket message string:", e);
                        return; // Don't process invalid JSON string
                    }
                } else {
                    messagePayload = msg; // Assume it's already an object
                }

                dispatch(addMessage(messagePayload));
            });

            socket.on('disconnect', () => console.log('Socket.IO disconnected'));

            return () => {
                console.log('Chat component unmounting, closing socket');
                socket.close();
            }
        }

        return () => {
            console.log('Chat component unmounting');
        }
    }, [dispatch]);

    const handleShowGroupInfo = () => {
        if (activeConversation?.type === 'GROUP') {
            setGroupInfoVisible(true);
        }
    };

    console.log('Debug: conversations type:', typeof conversations);
    console.log('Debug: conversations isArray:', Array.isArray(conversations));
    
    const activeConversation = (conversations.data || []).find(c => c.id === activeConversationId);

    return (
        <Layout className="chat-layout-wrapper">
            <Sider
                width={300}
                collapsible
                collapsed={sidebarCollapsed}
                onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
                trigger={null} // Hide default trigger
                collapsedWidth={64} // Set collapsed width to button width
                className="chat-sidebar-container"
            >
                <ChatSidebar 
                    onCreateGroup={() => setCreateGroupVisible(true)}
                    onAddFriend={() => setAddFriendVisible(true)}
                />
            </Sider>
            <Content style={{ display: 'flex', flexDirection: 'column' }}>
                <Button
                    type="text"
                    icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                        position: 'absolute',
                        top: 0,
                        left: sidebarCollapsed ? 0 : 300, // Adjust left based on collapsed state
                        zIndex: 1000,
                    }}
                    className={`sidebar-toggle-button ${sidebarCollapsed ? 'collapsed' : ''}`}/>
                <ErrorBoundary>
                    <ChatWindow onShowGroupInfo={handleShowGroupInfo} />
                </ErrorBoundary>
            </Content>
            {activeConversation?.type === 'GROUP' && (
                <GroupInfoDrawer 
                    group={activeConversation}
                    visible={groupInfoVisible}
                    onClose={() => setGroupInfoVisible(false)}
                />
            )}
            <CreateGroupModal 
                visible={createGroupVisible}
                onCancel={() => setCreateGroupVisible(false)}
            />
            <AddFriendModal 
                visible={addFriendVisible}
                onCancel={() => setAddFriendVisible(false)}
            />
        </Layout>
    );
};

export default Chat;