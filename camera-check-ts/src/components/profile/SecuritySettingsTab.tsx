
import React from 'react';
import { Form, Switch, List, Button, Card, Input, message } from 'antd';
import { changePassword } from '../../services/userService';
import { useTranslation } from 'react-i18next';

interface Device {
  device: string;
  ip: string;
  lastLogin: string;
}

interface SecuritySettingsTabProps {
  devices: Device[];
}

const SecuritySettingsTab = ({ devices }: SecuritySettingsTabProps) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const handleChangePassword = async (values: any) => {
        try {
            await changePassword(values.currentPassword, values.newPassword);
            message.success(t('password_change_success'));
            form.resetFields();
        } catch (error: any) {
            message.error(t('password_change_failure', { error: error.message }));
        }
    };

    return (
        <div>
            <Card title={t('two_factor_auth_title')} style={{ marginBottom: 24 }}>
                <Form.Item label={t('enable_2fa_label')} valuePropName="checked">
                    <Switch />
                </Form.Item>
                <p>{t('2fa_description')}</p>
            </Card>
            <Card title={t('logged_in_devices_title')} style={{ marginBottom: 24 }}>
                <List
                    className="device-list"
                    dataSource={devices}
                    renderItem={(item: Device) => (
                        <List.Item actions={[<Button danger type="text">{t('logout')}</Button>]}>
                            <List.Item.Meta
                                title={item.device}
                                description={`${t('ip_address_label')}: ${item.ip} - ${t('last_login_label')}: ${item.lastLogin}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <Card title={t('change_password_title')}>
                 <Form form={form} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item label={t('current_password_label')} name="currentPassword" rules={[{ required: true, message: t('current_password_required') }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label={t('new_password_label')} name="newPassword" rules={[{ required: true, message: t('new_password_required') }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label={t('confirm_new_password_label')} name="confirmPassword" rules={[
                        { required: true, message: t('confirm_new_password_required') },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('password_mismatch_error')));
                            },
                        }),
                    ]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">{t('update_password_button')}</Button>
                </Form>
            </Card>
        </div>
    );
};

export default SecuritySettingsTab;