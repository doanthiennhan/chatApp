import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Layout, Input, Button, List, Avatar, Typography, 
  Divider, Empty, Space, Tag, Tooltip, Badge
} from 'antd';
import { 
  SendOutlined, UserAddOutlined, InfoCircleOutlined, 
  TeamOutlined, UserOutlined
} from '@ant-design/icons';
import { sendDirectMessage } from "../redux/chatSlice";
import { sendGroupMsg, addMemberToGroup, setActiveGroup } from "../redux/groupSlice";
import { Modal, Form, Select, message } from 'antd';

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;

const ChatArea = () => {
  const dispatch = useDispatch();
  const [messageText, setMessageText] = useState('');
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [isGroupInfoVisible, setIsGroupInfoVisible] = useState(false);
  const [addMemberForm] = Form.useForm();
  const messagesEndRef = useRef(null);
  
  const currentUser = useSelector(state => state.auth.user);
  const { directMessages, activeChatId } = useSelector(state => state.chat);
  const { groups, groupMessages, activeGroupId } = useSelector(state => state.group);

  const isGroupChat = activeGroupId && !activeChatId;

  // Determine current chat data
  const activeChat = isGroupChat
    ? groups.find(group => group.id === activeGroupId)
    : null; // Đã bỏ: const [id1, id2] = activeChatId?.split('-') || [];
  
  // Determine messages to display
  const messages = isGroupChat
    ? groupMessages[activeGroupId] || []
    : directMessages[activeChatId] || [];

  // Get active group members with user details
  const activeGroupMembers = isGroupChat && activeChat
    ? activeChat.members.map(memberId => {
        return { id: memberId, name: 'Unknown User' }; // Đã bỏ: return users.find(user => user.id === memberId) || { id: memberId, name: 'Unknown User' };
      })
    : [];

  // Find users who are not members of the active group
  const nonGroupMembers = []; // Đã bỏ: users.filter(
  //   user => !activeGroupMembers?.some(member => member.id === user.id)
  // );

  // Handle scrolling to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    if (isGroupChat) {
      dispatch(sendGroupMsg({
        groupId: activeGroupId,
        senderId: currentUser.id,
        text: messageText.trim()
      }));
    } else {
      // Đã bỏ: const [id1, id2] = activeChatId.split('-');
      // Đã bỏ: const receiverId = id1 === currentUser.id ? id2 : id1;
      
      dispatch(sendDirectMessage({
        senderId: currentUser.id,
        receiverId: 'receiverId', // Placeholder, actual receiverId is not available here
        text: messageText.trim()
      }));
    }
    
    setMessageText('');
  };

  // Handle add member to group
  const handleAddMember = () => {
    setIsAddMemberModalVisible(true);
  };

  // Submit add member form
  const handleAddMemberSubmit = (values) => {
    dispatch(addMemberToGroup({
      groupId: activeGroupId,
      userId: values.userId
    }));
    setIsAddMemberModalVisible(false);
    addMemberForm.resetFields();
    message.success('Member added to group');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle key down for sending messages with Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render empty state if no active chat
  if (!activeChat) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#fafbfc'
      }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 16 }}><path fill="#ddd" d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm2 0v14h12V5H6Zm2 4h8v2H8V9Zm0 4h5v2H8v-2Z"/></svg>
          <div style={{ fontSize: 18 }}>Select a chat or group to start messaging</div>
        </div>
      </div>
    );
  }

  return (
    <Layout className="flex-1 bg-white">
      {/* Chat Header */}
      <Header className="flex items-center justify-between h-16 px-4 bg-white border-b">
        <div className="flex items-center">
          <Avatar size={40} src={activeChat.avatar} />
          <div className="ml-3">
            <div className="font-semibold">{activeChat.name}</div>
            <div className="text-xs text-gray-500">
              {isGroupChat
                ? `${activeGroupMembers.length} members`
                : 'Direct Message'
              }
            </div>
          </div>
        </div>

        {isGroupChat && (
          <Space>
            <Tooltip title="Add Member">
              <Button 
                icon={<UserAddOutlined />} 
                onClick={handleAddMember}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Group Info">
              <Button 
                icon={<InfoCircleOutlined />} 
                onClick={() => setIsGroupInfoVisible(true)}
                type="text"
              />
            </Tooltip>
          </Space>
        )}
      </Header>

      {/* Messages Area */}
      <Content className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={message => {
            const isCurrentUser = message.senderId === currentUser.id;
            const sender = null; // Đã bỏ: users.find(user => user.id === message.senderId);
            
            return (
              <List.Item style={{ padding: '8px 0' }}>
                <div 
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} w-full`}
                >
                  <div className={`max-w-[70%] ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                    {!isCurrentUser && isGroupChat && (
                      <div className="mb-1 text-xs font-medium text-gray-500">
                        {sender?.name || 'Unknown User'}
                      </div>
                    )}
                    <div className={`relative p-3 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div>{message.text}</div>
                      <div className={`mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                  {!isCurrentUser && (
                    <Avatar 
                      src={sender?.avatar} 
                      size={32}
                      className={isCurrentUser ? 'ml-2' : 'mr-2'}
                    />
                  )}
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </Content>

      {/* Message Input */}
      <Footer className="p-3 border-t bg-white" style={{ padding: '12px' }}>
        <div className="flex">
          <TextArea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 mr-2"
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            Send
          </Button>
        </div>
      </Footer>

      {/* Add Member Modal */}
      <Modal
        title="Add Member to Group"
        open={isAddMemberModalVisible}
        onCancel={() => setIsAddMemberModalVisible(false)}
        footer={null}
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          onFinish={handleAddMemberSubmit}
        >
          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user to add' }]}
          >
            <Select placeholder="Select user to add to group">
              {nonGroupMembers.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  <div className="flex items-center">
                    <Avatar src={user.avatar} size={24} className="mr-2" />
                    <span>{user.name}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add to Group
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Group Info Modal */}
      <Modal
        title="Group Information"
        open={isGroupInfoVisible}
        onCancel={() => setIsGroupInfoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsGroupInfoVisible(false)}>
            Close
          </Button>
        ]}
      >
        {activeChat && isGroupChat && (
          <div>
            <div className="flex items-center mb-4">
              <Avatar size={64} src={activeChat.avatar} />
              <div className="ml-4">
                <Title level={4}>{activeChat.name}</Title>
                <Text type="secondary">{activeChat.description}</Text>
              </div>
            </div>
            
            <Divider orientation="left">Group ID</Divider>
            <div className="mb-4">
              <Tag color="blue" className="text-base py-1 px-2">{activeChat.id}</Tag>
              <Text type="secondary" className="ml-2">Share this ID to let others find your group</Text>
            </div>
            
            <Divider orientation="left">Members ({activeGroupMembers.length})</Divider>
            <List
              itemLayout="horizontal"
              dataSource={activeGroupMembers}
              renderItem={member => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={member.avatar} />}
                    title={member.name}
                    description={
                      member.id === activeChat.createdBy ? 'Group Creator' : 'Member'
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ChatArea;