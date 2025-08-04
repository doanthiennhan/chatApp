import React from 'react';
import { Avatar, Typography, Space, Button, Badge, Dropdown, Menu } from 'antd';
import { 
    PhoneOutlined, 
    VideoCameraOutlined, 
    InfoCircleOutlined, 
    BellOutlined, 
    UsergroupAddOutlined, 
    LogoutOutlined, 
    DeleteOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const MoreActionsMenu = ({ isGroup, isAdmin }) => (
    <Menu>
        {isGroup && <Menu.Item key="add-member" icon={<UsergroupAddOutlined />}>Thêm thành viên</Menu.Item>}
        <Menu.Item key="notifications" icon={<BellOutlined />}>Tắt thông báo</Menu.Item>
        {isGroup && <Menu.Item key="leave-group" icon={<LogoutOutlined />} danger>Rời nhóm</Menu.Item>}
        {isGroup && isAdmin && <Menu.Item key="delete-group" icon={<DeleteOutlined />} danger>Xoá nhóm</Menu.Item>}
    </Menu>
);

const ChatHeader = ({ activeConversation, onShowGroupInfo }) => {
    const currentUser = useSelector(state => state.auth.userInfo);

    if (!activeConversation) return null;

    const getConversationDetails = () => {
        if (activeConversation.type === 'DIRECT') {
            const otherUser = activeConversation.participants?.find(p => p.id !== currentUser?.sub);
            return {
                name: otherUser?.username || 'Direct Message',
                avatar: otherUser?.avatar || null,
                memberCount: null,
                isGroup: false
            };
        }
        return {
            name: activeConversation.name,
            avatar: activeConversation.avatar || null,
            memberCount: activeConversation.participants?.length,
            isGroup: true
        };
    };

    const { name, avatar, memberCount, isGroup } = getConversationDetails();

    return (
        <div className="chat-header">
            <Space>
                <Avatar src={avatar} size={48} />
                <div>
                    <Title level={5} style={{ marginBottom: 0 }}>{name}</Title>
                    {isGroup ? (
                        <Text type="secondary">{memberCount} thành viên</Text>
                    ) : (
                        <Badge status="success" text="Online" />
                    )}
                </div>
            </Space>
            <Space>
                <Button shape="circle" icon={<PhoneOutlined />} />
                <Button shape="circle" icon={<VideoCameraOutlined />} />
                <Button shape="circle" icon={<InfoCircleOutlined />} onClick={onShowGroupInfo} />
                <Dropdown overlay={<MoreActionsMenu isGroup={isGroup} isAdmin={true} />} placement="bottomRight">
                    <Button shape="circle" icon={<MoreOutlined />} />
                </Dropdown>
            </Space>
        </div>
    );
};

export default ChatHeader;