
import React from 'react';
import { List, Tag, Space, Button } from 'antd';
import { VideoCameraOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Camera } from '../../types';

interface UserCamerasTabProps {
  cameras: Camera[];
}

const UserCamerasTab = ({ cameras }: UserCamerasTabProps) => {
    const { t } = useTranslation();

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'Online': return <Tag color="success">{t('status_online')}</Tag>;
            case 'Offline': return <Tag color="error">{t('status_offline')}</Tag>;
            case 'Error': return <Tag color="warning">{t('status_error')}</Tag>;
            default: return <Tag>{t('status_unknown')}</Tag>;
        }
    };

    return (
        <List
            className="camera-list-item"
            itemLayout="horizontal"
            dataSource={cameras}
            renderItem={(item: Camera) => (
                <List.Item
                    actions={[
                        <Button type="text" icon={<EyeOutlined />}>{t('view_live')}</Button>,
                        <Button type="text" icon={<HistoryOutlined />}>{t('history')}</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />}>{t('delete')}</Button>,
                    ]}>
                    <List.Item.Meta
                        avatar={<VideoCameraOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                        title={item.name}
                        description={item.location}
                    />
                    {getStatusTag(item.status)}
                </List.Item>
            )}
        />
    );
};

export default UserCamerasTab;