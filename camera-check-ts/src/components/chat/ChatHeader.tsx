import React from 'react';
import { Avatar, Typography, Space, Button, Badge, Dropdown, MenuProps } from 'antd';
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
import { Conversation, User } from '../../types';
import { RootState } from '../../store';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface MoreActionsMenuProps {
    isGroup: boolean;
    isAdmin: boolean;
}

const MoreActionsMenu: React.FC<MoreActionsMenuProps> = ({ isGroup, isAdmin }) => {
    const { t } = useTranslation();
    const items: MenuProps['items'] = [
        isGroup ? { key: "add-member", icon: <UsergroupAddOutlined />, label: t('add_member_button') } : null,
        { key: "notifications", icon: <BellOutlined />, label: t('mute_notifications') },
        isGroup ? { key: "leave-group", icon: <LogoutOutlined />, label: t('leave_group_button'), danger: true } : null,
        isGroup && isAdmin ? { key: "delete-group", icon: <DeleteOutlined />, label: t('delete_group_button'), danger: true } : null,
    ].filter(item => item !== null) as MenuProps['items'];

    return <Dropdown menu={{ items }} placement="bottomRight"><Button shape="circle" icon={<MoreOutlined />} /></Dropdown>;
};

interface ChatHeaderProps {
    activeConversation: Conversation | null;
    onShowGroupInfo: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ activeConversation, onShowGroupInfo }) => {
    const currentUser = useSelector((state: RootState) => state.auth.userInfo);
    const { t } = useTranslation();

    if (!activeConversation) return null;

    const getConversationDetails = () => {
        if (activeConversation.type === 'DIRECT') {
                        const otherUser = activeConversation.participants?.find(p => p.id !== currentUser?.id);
            return {
                name: otherUser?.username || t('direct_message'),
                avatar: otherUser?.avatar || null,
                memberCount: null,
                isGroup: false
            };
        }
        return {
            name: activeConversation.conversationName,
            avatar: activeConversation.conversationAvatar || null,
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
                        <Text type="secondary">{memberCount} {t('members')}</Text>
                    ) : (
                        <Badge status="success" text={t('online_status')} />
                    )}
                </div>
            </Space>
            <Space>
                <Button shape="circle" icon={<PhoneOutlined />} />
                <Button shape="circle" icon={<VideoCameraOutlined />} />
                <Button shape="circle" icon={<InfoCircleOutlined />} onClick={onShowGroupInfo} />
                <MoreActionsMenu isGroup={isGroup} isAdmin={true} />
            </Space>
        </div>
    );
};

export default ChatHeader;