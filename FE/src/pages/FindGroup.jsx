import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Modal, Input, Button, Form, Alert, List, Avatar, Empty 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchGroupById, setActiveGroup } from '../store/slices/groupSlice';

const FindGroup = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [searched, setSearched] = useState(false);
  const { searchResults, groups } = useSelector(state => state.group);

  const handleSearch = () => {
    if (searchText.trim()) {
      dispatch(searchGroupById(searchText.trim()));
      setSearched(true);
    }
  };

  const handleJoinGroup = (groupId) => {
    dispatch(setActiveGroup(groupId));
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Modal
      title="Find Group by ID"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="mb-4">
        <div className="flex mb-4">
          <Input
            placeholder="Enter group ID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            prefix={<SearchOutlined />}
            className="mr-2"
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {searched && searchResults.length === 0 && (
          <Alert 
            message="No groups found with that ID" 
            type="info" 
            showIcon 
            className="mb-4"
          />
        )}

        {searchResults.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={searchResults}
            renderItem={group => (
              <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    key="join" 
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={group.avatar} size={48} />}
                  title={group.name}
                  description={group.description}
                />
              </List.Item>
            )}
          />
        )}

        {!searched && (
          <Empty 
            description="Search for groups by their unique ID" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Modal>
  );
};

export default FindGroup;