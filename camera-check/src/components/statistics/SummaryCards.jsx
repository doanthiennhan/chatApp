import React from "react";
import { Card, Statistic, Progress, Tag, Row, Col } from "antd";

export default function SummaryCards({ summary }) {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card>
          <Statistic title="Average shelf shortage rate" value={summary.avgShortage + "%"} />
          <Progress percent={summary.avgShortage} status="active" />
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <Statistic title="On-time shelf recovery rate" value={summary.onTimeRecovery + "%"} />
          <Tag color={summary.onTimeRecovery >= summary.onTimeTarget ? "green" : "red"}>
            Target: {summary.onTimeTarget}%
          </Tag>
        </Card>
      </Col>
    </Row>
  );
}