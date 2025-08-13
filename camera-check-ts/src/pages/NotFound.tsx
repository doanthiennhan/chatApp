
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("not_found_subtitle")}
      extra={
        <Button type="primary" onClick={() => navigate("/")}>{t("back_home_button")}</Button>
      }
    />
  );
};

export default NotFound;