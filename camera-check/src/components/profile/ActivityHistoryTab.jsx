import React from 'react';
import { Timeline } from 'antd';
import { LoginOutlined, VideoCameraOutlined, MessageOutlined } from '@ant-design/icons';

const ActivityHistoryTab = ({ history }) => {
    const getIcon = (action) => {
        if (action.includes('Đăng nhập')) return <LoginOutlined />;
        if (action.includes('Cấu hình')) return <VideoCameraOutlined />;
        if (action.includes('Gửi tin nhắn')) return <MessageOutlined />;
        return null;
    };

    return (
        <Timeline mode="alternate" className="activity-timeline">
            {history.map((item, index) => (
                <Timeline.Item key={index} dot={getIcon(item.action)}>
                    <strong>{item.action}</strong> - {item.time} (IP: {item.ip})
                </Timeline.Item>
            ))}
        </Timeline>
    );
};

export default ActivityHistoryTab;
