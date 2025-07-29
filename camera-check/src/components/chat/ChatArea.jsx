import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDirectMessages, fetchGroupMessages, sendDirectMessage, sendGroupMessage } from "../../store/slices/chatSlice";
import { Input, Button } from "antd";

const ChatArea = () => {
  const dispatch = useDispatch();
  const { selectedChannel, selectedType, messages, loading } = useSelector((state) => state.chat);
  const userId = localStorage.getItem("userId") || "1";
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChannel) return;
    if (selectedType === "group") {
      dispatch(fetchGroupMessages({ groupId: selectedChannel }));
    } else if (selectedType === "direct") {
      dispatch(fetchDirectMessages({ user1: userId, user2: selectedChannel }));
    }
  }, [dispatch, selectedChannel, selectedType, userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedChannel) return;
    if (selectedType === "group") {
      dispatch(sendGroupMessage({ senderId: userId, groupId: selectedChannel, content: input }));
    } else if (selectedType === "direct") {
      dispatch(sendDirectMessage({ senderId: userId, receiverId: selectedChannel, content: input }));
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ padding: 24, height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Chat Area</div>
      {loading && <div>Đang tải tin nhắn...</div>}
      <div style={{ flex: 1, overflowY: "auto", background: "#f7f7f7", borderRadius: 8, padding: 16 }}>
        {messages && messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>{msg.senderName || msg.senderId || "Người gửi"}:</span> {msg.content}
            </div>
          ))
        ) : (
          <div>Chưa có tin nhắn nào</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1, borderRadius: 8 }}
        />
        <Button type="primary" onClick={handleSend} disabled={!input.trim() || !selectedChannel}>
          Gửi
        </Button>
      </div>
    </div>
  );
};
export default ChatArea; 