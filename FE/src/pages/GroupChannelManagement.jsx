import React from 'react';
import { Card, Tabs, Typography, Row, Col, Form, Input, Button, message } from 'antd';
import { createGroup } from '../api/groupService';
import { addMembersToGroup } from '../api/groupService';
import { getUserChannels } from '../api/groupService';
import { useSelector } from 'react-redux';
import { List, Spin, Alert, Empty } from 'antd';

const { Title } = Typography;
const { TabPane } = Tabs;

const GroupChannelManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleCreateGroup = async (values) => {
    setLoading(true);
    try {
      await createGroup(values);
      setLoading(false);
      message.success('Tạo group thành công!');
      form.resetFields();
    } catch (err) {
      setLoading(false);
      message.error(err?.response?.data?.message || 'Tạo group thất bại!');
    }
  };

  const [addMemberForm] = Form.useForm();
  const [addMemberLoading, setAddMemberLoading] = React.useState(false);

  const handleAddMembers = async (values) => {
    setAddMemberLoading(true);
    try {
      const memberIds = values.memberIds
        .split(/[\s,]+/)
        .map((v) => v.trim())
        .filter((v) => v);
      await addMembersToGroup({ groupId: values.groupId, memberIds });
      setAddMemberLoading(false);
      message.success('Thêm thành viên thành công!');
      addMemberForm.resetFields();
    } catch (err) {
      setAddMemberLoading(false);
      message.error(err?.response?.data?.message || 'Thêm thành viên thất bại!');
    }
  };

  const user = useSelector((state) => state.auth.user);
  const userId = user?.sub || user?.id; // sub là chuẩn JWT, id nếu backend trả về
  const [channels, setChannels] = React.useState([]);
  const [channelsLoading, setChannelsLoading] = React.useState(false);
  const [channelsError, setChannelsError] = React.useState(null);

  const fetchChannels = React.useCallback(async () => {
    if (!userId) return;
    setChannelsLoading(true);
    setChannelsError(null);
    try {
      const res = await getUserChannels(userId);
      setChannels(res.data || res);
      setChannelsLoading(false);
    } catch (err) {
      setChannelsError(err?.response?.data?.message || 'Lỗi khi tải danh sách group/channel');
      setChannelsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return (
    <Row justify="center" style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: 40 }}>
      <Col span={20}>
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(31, 41, 55, 0.10)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            Quản lý Group / Channel
          </Title>
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Tạo Group mới" key="1">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateGroup}
                style={{ maxWidth: 400, margin: '0 auto', marginTop: 32 }}
              >
                <Form.Item
                  label="Tên group"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên group!' }]}
                >
                  <Input placeholder="Nhập tên group" size="large" />
                </Form.Item>
                <Form.Item
                  label="Mô tả"
                  name="description"
                >
                  <Input.TextArea placeholder="Mô tả (tùy chọn)" rows={3} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                  >
                    Tạo group
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Thêm thành viên vào Group" key="2">
              <Form
                form={addMemberForm}
                layout="vertical"
                onFinish={handleAddMembers}
                style={{ maxWidth: 400, margin: '0 auto', marginTop: 32 }}
              >
                <Form.Item
                  label="ID group"
                  name="groupId"
                  rules={[{ required: true, message: 'Vui lòng nhập ID group!' }]}
                >
                  <Input placeholder="Nhập groupId" size="large" />
                </Form.Item>
                <Form.Item
                  label="Danh sách thành viên (userId hoặc email, cách nhau bởi dấu phẩy hoặc xuống dòng)"
                  name="memberIds"
                  rules={[{ required: true, message: 'Vui lòng nhập danh sách thành viên!' }]}
                >
                  <Input.TextArea placeholder="user1, user2, ..." rows={3} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={addMemberLoading}
                  >
                    Thêm thành viên
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Danh sách Group/Channel của bạn" key="3">
              <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 32 }}>
                {channelsLoading ? (
                  <Spin tip="Đang tải danh sách..." style={{ width: '100%' }} />
                ) : channelsError ? (
                  <Alert type="error" message={channelsError} />
                ) : channels.length === 0 ? (
                  <Empty description="Không có group/channel nào" />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={channels}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={<b>{item.name || item.channelName || 'Không tên'}</b>}
                          description={item.type ? `Loại: ${item.type}` : ''}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  );
};

export default GroupChannelManagement; 