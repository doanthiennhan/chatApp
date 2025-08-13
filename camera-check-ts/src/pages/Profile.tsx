
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Menu, Card, Spin, App } from 'antd';
import {
    UserOutlined,
    VideoCameraOutlined,
    BellOutlined,
    HistoryOutlined,
    LockOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import AppHeader from '../components/layout/AppHeader';
import { getCamerasByUserId } from '../services/cameraService';
import { getUserProfile, getActivityHistory } from '../services/userService';
import '../styles/UserProfile.scss';

import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import UserCamerasTab from '../components/profile/UserCamerasTab';
import NotificationSettingsTab from '../components/profile/NotificationSettingsTab';
import ActivityHistoryTab from '../components/profile/ActivityHistoryTab';
import SecuritySettingsTab from '../components/profile/SecuritySettingsTab';
import ChatSettingsTab from '../components/profile/ChatSettingsTab';
import { useTranslation } from 'react-i18next';

const { Sider, Content } = Layout;

const Profile = () => {
    const [activeTab, setActiveTab] = useState('personal-info');
    const currentUser = useSelector((state: any) => state.auth.userInfo);
    const accessToken = localStorage.getItem("accessToken");
    console.log("Profile Render - Access Token:", accessToken);

    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [userCameras, setUserCameras] = useState([]);
    const [loadingCameras, setLoadingCameras] = useState(false);
    const [activityHistory, setActivityHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { message } = App.useApp();
    const { t } = useTranslation();

        useEffect(() => {
        console.log("Profile component mounted or currentUser changed.");
        console.log("Current User ID:", currentUser?.userId);

        if (!currentUser?.userId) {
            console.log("No current user ID found, data fetching skipped.");
            // Optionally redirect to login if no user is found
            // navigate('/login'); // Uncomment if you want to force redirect
            return; // Stop further execution if no user
        }

        console.log("Current User ID is available, proceeding with data fetching.");
        // Original data fetching logic starts here
        console.log("Starting profile data fetch...");
            setLoadingProfile(true);
            console.log("Fetching user profile for ID:", currentUser.userId);
            getUserProfile(currentUser.userId)
                .then(res => {
                    console.log("User profile fetched successfully:", res);
                    setUserProfile(res);
                })
                .catch(err => {
                    console.error("Failed to fetch user profile:", err);
                    message.error(t("profile_load_error"));
                })
                .finally(() => {
                    setLoadingProfile(false);
                    console.log("Finished fetching user profile. loadingProfile:", false);
                });

            console.log("Starting camera data fetch...");
            setLoadingCameras(true);
            console.log("Fetching user cameras for ID:", currentUser.userId);
            getCamerasByUserId(currentUser.userId)
                .then(res => {
                    console.log("User cameras fetched successfully:", res);
                    setUserCameras(res.data.data);
                })
                .catch(err => {
                    console.error("Failed to fetch user cameras:", err);
                    message.error(t("camera_list_load_error"));
                })
                .finally(() => {
                    setLoadingCameras(false);
                    console.log("Finished fetching user cameras. loadingCameras:", false);
                });

            console.log("Starting activity history data fetch...");
            setLoadingHistory(true);
            console.log("Fetching activity history for ID:", currentUser.userId);
            getActivityHistory(currentUser.userId)
                .then(res => {
                    console.log("Activity history fetched successfully:", res);
                    setActivityHistory(res);
                })
                .catch(err => {
                    console.error("Failed to fetch activity history:", err);
                    message.error(t("activity_history_load_error"));
                })
                .finally(() => {
                    setLoadingHistory(false);
                    console.log("Finished fetching activity history. loadingHistory:", false);
                });
        }, [currentUser, message, t]);

    const menuItems = [
        { key: 'personal-info', icon: <UserOutlined />, label: t('personal_info') },
        { key: 'my-cameras', icon: <VideoCameraOutlined />, label: t('my_cameras') },
        { key: 'notifications', icon: <BellOutlined />, label: t('notification_settings') },
        { key: 'chat-settings', icon: <MessageOutlined />, label: t('chat_settings') },
        { key: 'security', icon: <LockOutlined />, label: t('security') },
        { key: 'history', icon: <HistoryOutlined />, label: t('activity_history') },
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

    console.log("Profile Render - isLoadingAny:", isLoadingAny);
    console.log("Profile Render - userProfile:", userProfile);
    console.log("Profile Render - loadingProfile:", loadingProfile);
    console.log("Profile Render - loadingCameras:", loadingCameras);
    console.log("Profile Render - loadingHistory:", loadingHistory);

    return (
        <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}>
            <Layout>
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
                            <Spin size="small" />
                        </div>
                    ) : (
                        <ProfileHeader user={userProfile} />
                    )}
                    <Card className="profile-main-card">
                        {isLoadingAny ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                                <Spin size="large" />
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