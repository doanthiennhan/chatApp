
import React from 'react';
import { Descriptions, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { User } from '../../types';

interface PersonalInfoTabProps {
  user: User | null;
}

const PersonalInfoTab = ({ user }: PersonalInfoTabProps) => {
    const { t } = useTranslation();

    if (!user) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>{t('no_user_info_to_display')}</div>;
    }
    return (
        <div>
            <Descriptions bordered column={1} title={t('personal_details_title')}>
                <Descriptions.Item label={t('username')}>{user.username}</Descriptions.Item>
                <Descriptions.Item label={t('email')}>{user.email}</Descriptions.Item>
                <Descriptions.Item label={t('phone_number')}>{user.phone}</Descriptions.Item>
                <Descriptions.Item label={t('role')}>{user.role}</Descriptions.Item>
                {/* <Descriptions.Item label={t('join_date')}>{user.joinDate}</Descriptions.Item>
                <Descriptions.Item label={t('last_ip')}>{user.lastIp}</Descriptions.Item> */}
            </Descriptions>
            <Button type="primary" style={{ marginTop: 16 }}>{t('edit_info_button')}</Button>
        </div>
    );
};

export default PersonalInfoTab;