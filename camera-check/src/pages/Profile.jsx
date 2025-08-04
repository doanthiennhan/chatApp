import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Spin, message, App } from 'antd';
import {
    UserOutlined,
    VideoCameraOutlined,
    BellOutlined,
    HistoryOutlined,
    LockOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import AppHeader from '../components/layout/AppHeader';
import { useSelector } from 'react-redux';
import { getCamerasByUserId } from '../services/cameraService';
import { getUserProfile, getActivityHistory } from '../services/userService';
import '../styles/UserProfile.css';

// Import tab components
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import UserCamerasTab from '../components/profile/UserCamerasTab';
import NotificationSettingsTab from '../components/profile/NotificationSettingsTab';
import ActivityHistoryTab from '../components/profile/ActivityHistoryTab';
import SecuritySettingsTab from '../components/profile/SecuritySettingsTab';
import ChatSettingsTab from '../components/profile/ChatSettingsTab';

const { Sider, Content } = Layout;

const Profile = () => {
    const [activeTab, setActiveTab] = useState('personal-info');
    const currentUser = useSelector(state => state.auth.userInfo);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [userCameras, setUserCameras] = useState([]);
    const [loadingCameras, setLoadingCameras] = useState(false);
    const [activityHistory, setActivityHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { message } = App.useApp();

    useEffect(() => {
        console.log("Profile component mounted or currentUser changed.");
        console.log("Current User ID:", currentUser?.userId);

        if (currentUser?.userId) {
            // Fetch full user profile
            setLoadingProfile(true);
            console.log("Fetching user profile for ID:", currentUser.userId);
            getUserProfile(currentUser.userId)
                .then(res => {
                    console.log("User profile fetched successfully:", res);
                    setUserProfile(res);
                })
                .catch(err => {
                    console.error("Failed to fetch user profile:", err);
                    message.error("Không thể tải thông tin cá nhân.");
                })
                .finally(() => {
                    setLoadingProfile(false);
                    console.log("Finished fetching user profile. loadingProfile:", false);
                });

            // Fetch user cameras
            setLoadingCameras(true);
            console.log("Fetching user cameras for ID:", currentUser.userId);
            getCamerasByUserId(currentUser.userId)
                .then(res => {
                    console.log("User cameras fetched successfully:", res);
                    setUserCameras(res.data.data);
                })
                .catch(err => {
                    console.error("Failed to fetch user cameras:", err);
                    message.error("Không thể tải danh sách camera.");
                })
                .finally(() => {
                    setLoadingCameras(false);
                    console.log("Finished fetching user cameras. loadingCameras:", false);
                });

            // Fetch activity history
            setLoadingHistory(true);
            console.log("Fetching activity history for ID:", currentUser.userId);
            getActivityHistory(currentUser.userId)
                .then(res => {
                    console.log("Activity history fetched successfully:", res);
                    setActivityHistory(res);
                })
                .catch(err => {
                    console.error("Failed to fetch activity history:", err);
                    message.error("Không thể tải lịch sử hoạt động.");
                })
                .finally(() => {
                    setLoadingHistory(false);
                    console.log("Finished fetching activity history. loadingHistory:", false);
                });
        }
    }, [currentUser]);

    const menuItems = [
        { key: 'personal-info', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'my-cameras', icon: <VideoCameraOutlined />, label: 'Camera của tôi' },
        { key: 'notifications', icon: <BellOutlined />, label: 'Cài đặt thông báo' },
        { key: 'chat-settings', icon: <MessageOutlined />, label: 'Cài đặt trò chuyện' },
        { key: 'security', icon: <LockOutlined />, label: 'Bảo mật' },
        { key: 'history', icon: <HistoryOutlined />, label: 'Lịch sử hoạt động' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'personal-info':
                return <PersonalInfoTab user={userProfile} />;
            case 'my-cameras':
                return <UserCamerasTab cameras={userCameras} />;
            case 'notifications':
                return <NotificationSettingsTab />;
            case 'history':
                return <ActivityHistoryTab history={activityHistory} />;
            case 'security':
                return <SecuritySettingsTab devices={[]} />;
            case 'chat-settings':
                return <ChatSettingsTab />;
            default:
                return <PersonalInfoTab user={userProfile} />;
        }
    };

    const isLoadingAny = loadingProfile || loadingCameras || loadingHistory;

    return (
        <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppHeader />
            <Layout style={{ flex: 1, marginTop: 72 }}>
                <Sider className="profile-sider" width={250}>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        onClick={(e) => setActiveTab(e.key)}
                        items={menuItems}
                        style={{ height: '100%', borderRight: 0 }}
                    />
                </Sider>
                <Content className="profile-content">
                    {loadingProfile || !userProfile ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px', width: '100%' }}>
                            <Spin tip="Đang tải thông tin cá nhân..." size="small" />
                        </div>
                    ) : (
                        <ProfileHeader user={userProfile} />
                    )}
                    <Card className="profile-main-card">
                        {isLoadingAny ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                                <Spin tip="Đang tải dữ liệu..." size="large" />
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Profile;