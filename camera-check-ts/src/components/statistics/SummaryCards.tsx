
import React from "react";
import { Card, Statistic, Progress, Tag, Row, Col } from "antd";
import { useTranslation } from 'react-i18next';

interface Summary {
  avgShortage: number;
  onTimeRecovery: number;
  onTimeTarget: number;
}

interface SummaryCardsProps {
  summary: Summary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card>
          <Statistic title={t("average_shelf_shortage_rate")} value={summary.avgShortage + "%"} />
          <Progress percent={summary.avgShortage} status="active" />
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <Statistic title={t("on_time_shelf_recovery_rate")} value={summary.onTimeRecovery + "%"} />
          <Tag color={summary.onTimeRecovery >= summary.onTimeTarget ? "green" : "red"}>
            {t("target")}: {summary.onTimeTarget}%
          </Tag>
        </Card>
      </Col>
    </Row>
  );
}