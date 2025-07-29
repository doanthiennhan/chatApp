import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchChannels, setSelectedChannel } from "../../store/slices/chatSlice";
import { Button } from "antd";
import GroupChannelManagement from "../chat/GroupChannelManagement";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { channels, selectedChannel, loading } = useSelector((state) => state.chat);
  const userId = localStorage.getItem("userId") || "1";
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(fetchChannels(userId));
  }, [dispatch, userId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Danh sách kênh</div>
      <Button type="primary" block style={{ marginBottom: 20 }} onClick={() => setOpenModal(true)}>
        Tạo nhóm mới
      </Button>
      {loading && <div>Đang tải...</div>}
      <div>
        {channels && channels.length > 0 ? (
          channels.map((ch) => (
            <div
              key={ch.id || ch.groupId || ch.userId}
              onClick={() => dispatch(setSelectedChannel({ id: ch.id || ch.groupId || ch.userId, type: ch.type || (ch.groupId ? "group" : "direct") }))}
              style={{
                padding: "10px 16px",
                marginBottom: 8,
                borderRadius: 8,
                background: (selectedChannel === (ch.id || ch.groupId || ch.userId)) ? "#e6f4ff" : "#f7f7f7",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {ch.name || ch.groupName || ch.username || ch.email || "Kênh"}
            </div>
          ))
        ) : (
          <div>Không có kênh nào</div>
        )}
      </div>
      <GroupChannelManagement open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};
export default Sidebar; 