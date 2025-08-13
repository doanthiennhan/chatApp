

import React from 'react';
import { Form, Switch, Checkbox, Select, Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const NotificationSettingsTab = () => {
    const { t } = useTranslation();

    return (
        <Form layout="vertical">
            <Card title={t('event_notifications_title')} style={{ marginBottom: 24 }}>
                <Form.Item label={t('camera_disconnected_notification')} valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item label={t('unusual_motion_notification')} valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item label={t('new_message_notification')} valuePropName="checked">
                    <Switch defaultChecked />
                </Form.Item>
            </Card>
            <Card title={t('delivery_method_title')}>
                <Form.Item label={t('choose_delivery_method_label')}>
                    <Checkbox.Group>
                        <Checkbox value="email">{t('email')}</Checkbox>
                        <Checkbox value="in-app">{t('in_app_message')}</Checkbox>
                        <Checkbox value="telegram" disabled>{t('telegram_soon')}</Checkbox>
                    </Checkbox.Group>
                </Form.Item>
            </Card>
        </Form>
    );
};

export default NotificationSettingsTab;