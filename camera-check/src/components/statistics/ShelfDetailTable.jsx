import React from "react";
import { Table } from "antd";

const columns = [
  { title: "Shelf", dataIndex: "name" },
  { title: "Shelf operating hours", dataIndex: "operating" },
  { title: "Shelf shortage hours", dataIndex: "shortageHour" },
  { title: "Shelf shortage rate", dataIndex: "shortage", render: v => v + "%" },
];

export default function ShelfDetailTable({ shelves }) {
  return <Table columns={columns} dataSource={shelves} rowKey="name" pagination={false} />;
}