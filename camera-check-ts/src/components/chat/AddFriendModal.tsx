import React, { useState, useMemo } from 'react';
import { Modal, Form, Button, Avatar, message, Select, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { sendFriendRequest } from '../../services/chatService';
import { searchUsers } from '../../services/identityService';
import debounce from 'lodash/debounce';
import { User } from '../../types';

const { Option } = Select;

interface UserOption {
  label: React.ReactNode;
  value: string;
}

interface DebounceSelectProps {
  fetchOptions: (value: string) => Promise<UserOption[]>;
  debounceTimeout?: number;
  [key: string]: any; // Allow other props
}

function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) {
  const [fetching, setFetching] = useState<boolean>(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const fetchRef = React.useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {...props}
      options={options}
    />
  );
}

async function fetchUserList(search: string): Promise<UserOption[]> {
  try {
    const res = await searchUsers(search);
    return res.data.data.data.map((user: User) => ({
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={user.avatar} size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          {user.email} ({user.username})
        </div>
      ),
      value: user.id,
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    message.error('Không thể tải danh sách người dùng.');
    return [];
  }
}

interface AddFriendModalProps {
  visible: boolean;
  onCancel: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendRequest = async () => {
        if (!selectedUser) {
            message.warning('Vui lòng chọn một người dùng để gửi lời mời kết bạn.');
            return;
        }
        setLoading(true);
        try {
            await sendFriendRequest(selectedUser.value);
            message.success(`Đã gửi lời mời kết bạn đến ${selectedUser.label.props.children[1].props.children[0]}.`);
            form.resetFields();
            setSelectedUser(null);
            onCancel();
        } catch (error) {
            message.error("Gửi lời mời kết bạn thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Thêm bạn bè"
            okText="Gửi lời mời"
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleSendRequest}
            confirmLoading={loading}
            width={500}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="userSearch"
                    label="Tìm kiếm người dùng"
                    rules={[{ required: true, message: 'Vui lòng tìm kiếm và chọn một người dùng!' }]}
                >
                    <DebounceSelect
                        showSearch
                        value={selectedUser}
                        placeholder="Tìm kiếm người dùng bằng email hoặc tên..."
                        fetchOptions={fetchUserList}
                        onChange={(newValue: UserOption) => {
                            setSelectedUser(newValue);
                        }}
                        style={{
                            width: '100%',
                        }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddFriendModal;