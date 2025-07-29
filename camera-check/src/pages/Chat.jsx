import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import { Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined style={{ fontSize: 20 }} />}
          onClick={() => navigate("/home")}
          style={{
            color: "#1677ff",
            fontWeight: 600,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          Quay lại Home
        </Button>
      </div>
      <Row style={{ flex: 1, height: 'calc(100vh - 80px)' }}>
        <Col xs={24} md={8} lg={6} style={{ height: '100%' }}>
          <Sidebar />
        </Col>
        <Col xs={24} md={16} lg={18} style={{ height: '100%' }}>
          <ChatArea />
        </Col>
      </Row>
    </div>
  );
};

export default Chat; 