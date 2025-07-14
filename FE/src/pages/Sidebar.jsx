import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Input, List, Avatar, Button, Tabs, Modal, Form, Typography, Divider } from 'antd';
import { TeamOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { setActiveChat } from '../redux/chatSlice';
import { setActiveGroup, createGroupThunk } from '../redux/groupSlice';

const { Sider } = Layout;
const { TabPane } = Tabs;
const { Text } = Typography;

const Sidebar = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);


  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('2'); 

  const handleCreateGroup = () => {
    setIsCreateGroupModalVisible(true);
  };

  const handleGroupFormSubmit = (values) => {
    dispatch(createGroupThunk({
      name: values.name,
      description: values.description,
      createdBy: currentUser.id,
      members: values.members || [],
    }));
    setIsCreateGroupModalVisible(false);
    groupForm.resetFields();
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  const clearSearchResults = () => {
    setSearchQuery('');
  };

  return (
    <Sider
      width={280}
      style={{
        background: '#fff',
        borderRight: '1px solid #eee',
        height: '100vh',
        overflow: 'auto',
        boxShadow: '2px 0 8px #f0f1f2',
        padding: 0
      }}
      theme="light"
    >
      <div style={{ padding: 24 }}>
        <div className="flex items-center mb-4">
          <Avatar size={40} src={currentUser?.avatar} />
          <div className="ml-3">
            <div className="text-base font-semibold">{currentUser?.name || currentUser?.email}</div>
            <div className="text-xs text-green-500">Online</div>
          </div>
        </div>
        <Input 
          placeholder={"Search groups..."}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          suffix={searchQuery && <Button type="text" size="small" onClick={clearSearchResults}>Clear</Button>}
          className="mb-4"
        />
        <Tabs defaultActiveKey="2" onChange={setActiveTab}>
          {/* Tab group/channel */}
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Groups
              </span>
            }
            key="2"
          >
            <div className="mb-4">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateGroup}
                block
              >
                Create Group
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
      <Modal
        title="Create New Group"
        open={isCreateGroupModalVisible}
        onCancel={() => setIsCreateGroupModalVisible(false)}
        footer={null}
      >
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={handleGroupFormSubmit}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Group description" rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Group
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Sider>
  );
};

export default Sidebar;