import React from 'react';
import { Card, Avatar, Typography, Tag, Space, Button } from 'antd';
import { UserOutlined, CheckCircleOutlined, EditOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfileHeader = ({ user }) => {
    return (
        <Card className="profile-header-card">
            <Avatar size={80} src={user.avatar} icon={<UserOutlined />} />
            <div style={{ flex: 1 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    {user.username}
                    <Tag color="green" icon={<CheckCircleOutlined />} style={{ marginLeft: 8 }}>Online</Tag>
                </Title>
                <Text type="secondary">{user.role}</Text>
            </div>
            <Space>
                <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
                <Button icon={<LockOutlined />}>Đổi mật khẩu</Button>
                <Button danger icon={<LogoutOutlined />}>Đăng xuất</Button>
            </Space>
        </Card>
    );
};

export default ProfileHeader;
