import { Alert, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const typeMap = {
  critical: "error",
  warning: "warning",
  info: "info",
};

const AlertItem = ({ alert, onDismiss }) => (
  <Alert
    message={alert.message}
    description={alert.timestamp.toLocaleTimeString()}
    type={typeMap[alert.type]}
    showIcon
    action={
      <Button
        size="small"
        icon={<CloseOutlined />}
        onClick={() => onDismiss(alert.id)}
        type="text"
      />
    }
    style={{ marginBottom: 8 }}
  />
);

export default AlertItem; 