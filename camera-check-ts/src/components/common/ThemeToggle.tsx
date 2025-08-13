import React, { useContext } from 'react';
import { Button, Tooltip, Popover, Space, theme } from 'antd'; // Import theme
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { useToken } = theme; // Destructure useToken

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { token } = useToken(); // Get theme tokens

  const tooltipTitle = theme === 'light' ? t('switch_to_dark_mode') : t('switch_to_light_mode');

  return (
    <Tooltip title={tooltipTitle}>
      <Button
        shape="circle"
        icon={
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            {theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          </span>
        }
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        style={{
          width: 40,
          height: 40,
          color: token.colorText, // Set icon color
          borderColor: token.colorBorder, // Set border color
          backgroundColor: token.colorBgContainer, // Set background color
          boxShadow: `0 0 12px 0 ${token.colorPrimary}1A`, // Use primary color with transparency for shadow
        }}
      />
    </Tooltip>
  );
};

export default ThemeToggle;