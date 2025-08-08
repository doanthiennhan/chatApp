import React from 'react';
import { Table, Tag } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Shortage Hours',
    dataIndex: 'shortageHours',
    key: 'shortageHours',
    align: 'right',
  },
  {
    title: 'Shortage Rate',
    dataIndex: 'shortageRate',
    key: 'shortageRate',
    align: 'right',
    render: (rate) => <Tag color={rate > 20 ? 'volcano' : rate > 10 ? 'warning' : 'success'}>{rate}%</Tag>,
  },
];

const data = [
  {
    key: 1,
    name: '2025',
    shortageHours: 150,
    shortageRate: 18.5,
    children: [
      {
        key: 11,
        name: 'Store A',
        shortageHours: 90,
        shortageRate: 22.1,
        children: [
          {
            key: 111,
            name: 'Q2',
            shortageHours: 90,
            shortageRate: 22.1,
            children: [
                {
                    key: 1111,
                    name: 'April',
                    shortageHours: 90,
                    shortageRate: 22.1,
                     children: [
                        {
                            key: 11111,
                            name: 'Energy Drink Shelf',
                            shortageHours: 50,
                            shortageRate: 25,
                        },
                        {
                            key: 11112,
                            name: 'Fresh Produce Shelf 1',
                            shortageHours: 40,
                            shortageRate: 18,
                        },
                    ]
                }
            ]
          },
        ],
      },
      {
        key: 12,
        name: 'Store B',
        shortageHours: 60,
        shortageRate: 15.3,
        children: [
           {
            key: 121,
            name: 'Q2',
            shortageHours: 60,
            shortageRate: 15.3,
          },
        ],
      },
    ],
  },
];

const AnalysisTreeTable = () => <Table columns={columns} dataSource={data} />;

export default AnalysisTreeTable;
