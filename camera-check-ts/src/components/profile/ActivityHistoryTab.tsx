

import React from 'react';
import { Timeline } from 'antd';
import { LoginOutlined, VideoCameraOutlined, MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface HistoryItem {
  action: string;
  time: string;
  ip: string;
}

interface ActivityHistoryTabProps {
  history: HistoryItem[];
}

const ActivityHistoryTab = ({ history }: ActivityHistoryTabProps) => {
    const { t } = useTranslation();

    const getIcon = (action: string) => {
        if (action.includes(t('login_action'))) return <LoginOutlined />;
        if (action.includes(t('configure_action'))) return <VideoCameraOutlined />;
        if (action.includes(t('send_message_action'))) return <MessageOutlined />;
        return null;
    };

    return (
        <Timeline mode="alternate" className="activity-timeline">
            {history.map((item, index) => (
                <Timeline.Item key={index} dot={getIcon(item.action)}>
                    <strong>{item.action}</strong> - {item.time} ({t('ip_address_label')}: {item.ip})
                </Timeline.Item>
            ))}
        </Timeline>
    );
};

export default ActivityHistoryTab;