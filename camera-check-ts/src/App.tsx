import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Camera from "./pages/Camera";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import Statistics from "./pages/Statistics";
import WebSocketProvider from "./components/common/WebSocketProvider";
import MainLayout from "./components/layout/MainLayout";

const App: React.FC = () => {
  return (
    <Router>
      <WebSocketProvider>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<Home />} />
            <Route path="camera" element={<Camera />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route path="statistics" element={<Statistics />} />
            <Route index element={<Navigate to="/home" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </WebSocketProvider>
    </Router>
  );
};

export default App;
