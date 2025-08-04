import React from 'react';
import { Form, Switch, List, Button, Card, Input, message } from 'antd';
import { changePassword } from '../../services/userService';

const SecuritySettingsTab = ({ devices }) => {
    const [form] = Form.useForm();

    const handleChangePassword = async (values) => {
        try {
            await changePassword(values.currentPassword, values.newPassword);
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        } catch (error) {
            message.error('Đổi mật khẩu thất bại: ' + error.message);
        }
    };

    return (
        <div>
            <Card title="Xác thực hai bước (2FA)" style={{ marginBottom: 24 }}>
                <Form.Item label="Kích hoạt 2FA" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <p>Bảo vệ tài khoản của bạn bằng một lớp bảo mật bổ sung.</p>
            </Card>
            <Card title="Thiết bị đang đăng nhập" style={{ marginBottom: 24 }}>
                <List
                    className="device-list"
                    dataSource={devices}
                    renderItem={item => (
                        <List.Item actions={[<Button danger type="text">Đăng xuất</Button>]}>
                            <List.Item.Meta
                                title={item.device}
                                description={`IP: ${item.ip} - Lần cuối đăng nhập: ${item.lastLogin}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <Card title="Đổi mật khẩu">
                 <Form form={form} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Cập nhật mật khẩu</Button>
                </Form>
            </Card>
        </div>
    );
};

export default SecuritySettingsTab;
