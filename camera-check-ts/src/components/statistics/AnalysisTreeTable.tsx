
import React from 'react';
import { Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

const AnalysisTreeTable = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('shortage_hours'),
      dataIndex: 'shortageHours',
      key: 'shortageHours',
      align: 'right',
    },
    {
      title: t('shortage_rate'),
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
          name: t('store_a'),
          shortageHours: 90,
          shortageRate: 22.1,
          children: [
            {
              key: 111,
              name: t('qtr_2'),
              shortageHours: 90,
              shortageRate: 22.1,
              children: [
                  {
                      key: 1111,
                      name: t('april'),
                      shortageHours: 90,
                      shortageRate: 22.1,
                       children: [
                          {
                              key: 11111,
                              name: t('energy_drink_shelf'),
                              shortageHours: 50,
                              shortageRate: 25,
                          },
                          {
                              key: 11112,
                              name: t('fresh_produce_shelf_1'),
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
          name: t('store_b'),
          shortageHours: 60,
          shortageRate: 15.3,
          children: [
             {
              key: 121,
              name: t('qtr_2'),
              shortageHours: 60,
              shortageRate: 15.3,
            },
          ],
        },
      ],
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};

export default AnalysisTreeTable;