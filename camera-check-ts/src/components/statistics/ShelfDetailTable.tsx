
import React from "react";
import { Table } from "antd";
import { useTranslation } from 'react-i18next';

interface Shelf {
  name: string;
  operating: number;
  shortageHour: number;
  shortage: number;
}

interface ShelfDetailTableProps {
  shelves: Shelf[];
}

export default function ShelfDetailTable({ shelves }: ShelfDetailTableProps) {
  const { t } = useTranslation();

  const columns = [
    { title: t("shelf"), dataIndex: "name" },
    { title: t("shelf_operating_hours"), dataIndex: "operating" },
    { title: t("shelf_shortage_hours"), dataIndex: "shortageHour" },
    { title: t("shelf_shortage_rate"), dataIndex: "shortage", render: (v: number) => v + "%" },
  ];

  return <Table columns={columns} dataSource={shelves} rowKey="name" pagination={false} />;
}