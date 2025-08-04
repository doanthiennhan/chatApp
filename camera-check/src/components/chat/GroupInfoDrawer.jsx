import React from 'react';
import { Drawer, Avatar, Typography, List, Button, Tag, Divider, Space } from 'antd';
import { UsergroupAddOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const getRoleTag = (role) => {
    if (role === 'Admin') return <Tag color="error">Admin</Tag>;
    if (role === 'Moderator') return <Tag color="warning">Mod</Tag>;
    return <Tag color="default">Thành viên</Tag>;
}

const GroupInfoDrawer = ({ group, visible, onClose }) => {
    if (!group) return null;

    return (
        <Drawer
            title="Thông tin nhóm"
            placement="right"
            onClose={onClose}
            open={visible}
            width={320}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={80} src={group.avatar} />
                <Title level={4} style={{ marginTop: 16 }}>{group.name}</Title>
                <Text type="secondary">{group.memberCount} thành viên</Text>
            </div>
            <Divider />
            <div>
                <Title level={5}>Thành viên</Title>
                <List
                    dataSource={group.members}
                    renderItem={member => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={member.avatar} />}
                                title={<Text strong>{member.name}</Text>}
                                description={getRoleTag(member.role)}
                            />
                        </List.Item>
                    )}
                />
            </div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<UsergroupAddOutlined />}>Thêm thành viên</Button>
                <Button block icon={<SettingOutlined />}>Quản lý nhóm</Button>
                <Button block danger icon={<LogoutOutlined />}>Rời nhóm</Button>
            </Space>
        </Drawer>
    );
};

export default GroupInfoDrawer;
