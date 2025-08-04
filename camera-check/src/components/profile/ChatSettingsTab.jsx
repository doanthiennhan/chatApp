import React from 'react';
import { Form, Switch, Input, Select, Card } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const ChatSettingsTab = () => {
    return (
        <Card>
            <Form layout="vertical">
                <Form.Item label="Cho phép người lạ gửi tin nhắn" valuePropName="checked">
                    <Switch defaultChecked />
                </Form.Item>
                <Form.Item label="Tự động trả lời khi offline">
                    <TextArea rows={4} placeholder="Tôi hiện đang offline, vui lòng để lại lời nhắn..." />
                </Form.Item>
                <Form.Item label="Hiển thị trạng thái hoạt động">
                    <Select defaultValue="online">
                        <Option value="online">Online</Option>
                        <Option value="hidden">Ẩn danh</Option>
                        <Option value="admin-only">Chỉ hiện với quản trị viên</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ChatSettingsTab;
