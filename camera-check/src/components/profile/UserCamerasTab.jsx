import React from 'react';
import { List, Tag, Space, Button } from 'antd';
import { VideoCameraOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';

const getStatusTag = (status) => {
    switch (status) {
        case 'Online': return <Tag color="success">Online</Tag>;
        case 'Offline': return <Tag color="error">Offline</Tag>;
        case 'Error': return <Tag color="warning">Error</Tag>;
        default: return <Tag>{status}</Tag>;
    }
};

const UserCamerasTab = ({ cameras }) => {
    return (
        <List
            className="camera-list-item"
            itemLayout="horizontal"
            dataSource={cameras}
            renderItem={item => (
                <List.Item
                    actions={[
                        <Button type="text" icon={<EyeOutlined />}>Xem trực tiếp</Button>,
                        <Button type="text" icon={<HistoryOutlined />}>Lịch sử</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />}>Xoá</Button>,
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
