import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GroupChannelManagement from "./pages/GroupChannelManagement";
import { useSelector } from "react-redux";
import Sidebar from "./pages/Sidebar";
import ChatArea from "./pages/ChatArea";

const ChatLayout = () => (
  <div style={{
    display: 'flex',
    height: '100vh',
    background: '#fafbfc',
    minWidth: 0
  }}>
    <Sidebar />
    <div style={{ flex: 1, minWidth: 0, height: '100vh', background: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
      <ChatArea />
    </div>
  </div>
);

const AppRouter = () => {
  const user = useSelector((state) => state.auth.user);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/groups" element={user ? <GroupChannelManagement /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? <ChatLayout /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 