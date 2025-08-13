import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Select, Button, Avatar, message, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import { createGroup } from '../../store/slices/chatSlice';
import { searchUsers } from '../../services/identityService';
import { User } from '../../types';
import { RootState, AppDispatch } from '../../store';

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

interface CreateGroupModalProps {
  visible: boolean;
  onCancel: () => void;
}

interface GroupFormValues {
  name: string;
  members: UserOption[]; // This will hold the selected members from DebounceSelect
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onCancel }) => {
    const [form] = Form.useForm<GroupFormValues>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
    const dispatch: AppDispatch = useDispatch();

    const handleCreate = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            await dispatch(createGroup({
                name: values.name,
                participantIds: selectedMembers.map(m => m.value) // Extract IDs from selected members
            })).unwrap();

            message.success(`Nhóm "${values.name}" đã được tạo thành công!`);
            form.resetFields();
            setSelectedMembers([]);
            onCancel();
        } catch (info: any) {
            console.log('Validate Failed:', info);
            message.error('Tạo nhóm thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Tạo nhóm mới"
            okText="Tạo nhóm"
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleCreate}
            width={600}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên nhóm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhóm!' }]}
                >
                    <Input placeholder="Nhập tên nhóm..." maxLength={100} />
                </Form.Item>
                <Form.Item
                    name="members"
                    label="Mời thành viên"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thành viên!' }]}
                >
                    <DebounceSelect
                        mode="multiple"
                        value={selectedMembers}
                        placeholder="Tìm kiếm bạn bè bằng email hoặc tên..."
                        fetchOptions={fetchUserList}
                        onChange={(newValue: UserOption[]) => {
                            setSelectedMembers(newValue);
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

export default CreateGroupModal;