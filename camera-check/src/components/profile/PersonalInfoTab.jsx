import React from 'react';
import { Descriptions, Button } from 'antd';

const PersonalInfoTab = ({ user }) => {
    if (!user) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Không có thông tin người dùng để hiển thị.</div>;
    }
    return (
        <div>
            <Descriptions bordered column={1} title="Thông tin chi tiết">
                <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{user.phone}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
                {/* <Descriptions.Item label="Ngày tham gia">{user.joinDate}</Descriptions.Item>
                <Descriptions.Item label="IP cuối cùng">{user.lastIp}</Descriptions.Item> */}
            </Descriptions>
            <Button type="primary" style={{ marginTop: 16 }}>Chỉnh sửa thông tin</Button>
        </div>
    );
};

export default PersonalInfoTab;
