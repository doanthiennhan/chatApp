
import React from 'react';
import { Drawer, Avatar, Typography, List, Button, Tag, Divider, Space } from 'antd';
import { UsergroupAddOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const GroupInfoDrawer = ({ group, visible, onClose }: { group: any, visible: boolean, onClose: () => void }) => {
    const { t } = useTranslation();

    const getRoleTag = (role: string) => {
        if (role === 'Admin') return <Tag color="error">{t('role_admin')}</Tag>;
        if (role === 'Moderator') return <Tag color="warning">{t('role_moderator')}</Tag>;
        return <Tag color="default">{t('role_member')}</Tag>;
    }

    if (!group) return null;

    return (
        <Drawer
            title={t('group_info_title')}
            placement="right"
            onClose={onClose}
            open={visible}
            width={320}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={80} src={group.conversationAvatar} />
                <Title level={4} style={{ marginTop: 16 }}>{group.conversationName}</Title>
                <Text type="secondary">{group.memberCount} {t('members')}</Text>
            </div>
            <Divider />
            <div>
                <Title level={5}>{t('members_list_title')}</Title>
                <List
                    dataSource={group.members}
                    renderItem={(member: any) => (
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
                <Button block icon={<UsergroupAddOutlined />}>{t('add_member_button')}</Button>
                <Button block icon={<SettingOutlined />}>{t('manage_group_button')}</Button>
                <Button block danger icon={<LogoutOutlined />}>{t('leave_group_button')}</Button>
            </Space>
        </Drawer>
    );
};

export default GroupInfoDrawer;