
import React from 'react';
import { Card, Avatar, Typography, Tag, Space, Button } from 'antd';
import { UserOutlined, CheckCircleOutlined, EditOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { User } from '../../types';

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
    const { t } = useTranslation();

    return (
        <Card className="profile-header-card">
            <Avatar size={80} src={user.avatar} icon={<UserOutlined />} />
            <div style={{ flex: 1 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    {user.username}
                    <Tag color="green" icon={<CheckCircleOutlined />} style={{ marginLeft: 8 }}>{t('online')}</Tag>
                </Title>
                <Text type="secondary">{user.role}</Text>
            </div>
            <Space>
                <Button icon={<EditOutlined />}>{t('edit')}</Button>
                <Button icon={<LockOutlined />}>{t('change_password')}</Button>
                <Button danger icon={<LogoutOutlined />}>{t('logout')}</Button>
            </Space>
        </Card>
    );
};

export default ProfileHeader;