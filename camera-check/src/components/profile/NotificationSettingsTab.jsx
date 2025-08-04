import React from 'react';
import { Form, Switch, Checkbox, Select, Card, Typography } from 'antd';

const { Title } = Typography;

const NotificationSettingsTab = () => {
    return (
        <Form layout="vertical">
            <Card title="Thông báo sự kiện" style={{ marginBottom: 24 }}>
                <Form.Item label="Khi camera mất kết nối" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item label="Khi có chuyển động bất thường" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item label="Khi có tin nhắn mới" valuePropName="checked">
                    <Switch defaultChecked />
                </Form.Item>
            </Card>
            <Card title="Phương thức nhận">
                <Form.Item label="Chọn phương thức bạn muốn nhận thông báo">
                    <Checkbox.Group>
                        <Checkbox value="email">Email</Checkbox>
                        <Checkbox value="in-app">Tin nhắn trong ứng dụng</Checkbox>
                        <Checkbox value="telegram" disabled>Telegram (sắp có)</Checkbox>
                    </Checkbox.Group>
                </Form.Item>
            </Card>
        </Form>
    );
};

export default NotificationSettingsTab;
