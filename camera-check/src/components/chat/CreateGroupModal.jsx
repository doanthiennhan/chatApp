import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Select, Button, Avatar, message, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import { createGroup } from '../../store/slices/chatSlice';
import { searchUsers } from '../../services/identityService';

const { Option } = Select;

function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = React.useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
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

async function fetchUserList(search) {
  try {
    const res = await searchUsers(search);
    return res.data.data.data.map((user) => ({
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

const CreateGroupModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const dispatch = useDispatch();

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
        } catch (info) {
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
                        onChange={(newValue) => {
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