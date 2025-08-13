
import React from 'react';
import { Form, Switch, Input, Select, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;

const ChatSettingsTab = () => {
    const { t } = useTranslation();

    return (
        <Card>
            <Form layout="vertical">
                <Form.Item label={t('allow_stranger_messages')} valuePropName="checked">
                    <Switch defaultChecked />
                </Form.Item>
                <Form.Item label={t('auto_reply_offline')}>
                    <TextArea rows={4} placeholder={t('auto_reply_placeholder')} />
                </Form.Item>
                <Form.Item label={t('show_activity_status')}>
                    <Select defaultValue="online">
                        <Option value="online">{t('online')}</Option>
                        <Option value="hidden">{t('hidden')}</Option>
                        <Option value="admin-only">{t('admin_only')}</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ChatSettingsTab;