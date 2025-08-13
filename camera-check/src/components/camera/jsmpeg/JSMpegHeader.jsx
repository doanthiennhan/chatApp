import React from 'react';
import { Badge } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const JSMpegHeader = ({ camera, viewerCount }) => {

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>{camera?.name || 'Unknown Camera'} - Live View 📹</span>
      <Badge count={viewerCount} showZero>
        <EyeOutlined style={{ fontSize: 20, color: "#1677ff" }} />
      </Badge>
    </div>
  );
};

export default JSMpegHeader; 