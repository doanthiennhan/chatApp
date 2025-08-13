
import React, { useState } from "react";
import { Layout, Row, Col, Card, DatePicker, Checkbox, Input, Typography, Statistic, Table, Select, Button, Progress, Collapse } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import OSAChart from "../components/statistics/OSAChart";
import ShelfShortageLineChart from "../components/statistics/ShelfShortageLineChart";
import RecoveryRateLineChart from "../components/statistics/RecoveryRateLineChart";
import RecoveryStatusBarChart from "../components/statistics/RecoveryStatusBarChart";
import ShortageStatusChart from "../components/statistics/ShortageStatusChart";
import CustomerDemographicChart from "../components/statistics/CustomerDemographicChart";
import CustomerVisitOvertimeChart from "../components/statistics/CustomerVisitOvertimeChart";
import "../styles/Statistics.scss";
import { ChartData, ChartOptions } from "chart.js";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import AnalysisTreeTable from "../components/statistics/AnalysisTreeTable";
import ShelfShortageChart from "../components/statistics/ShelfShortageChart";
import { fakeShortageByShelf } from "../data/fakeStatisticsData";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const createOSAData = (shelfName: string): ChartData<"bar"> => ({
  labels: ["8:00", "8:15", "8:30", "8:45", "9:00", "9:15", "9:30", "9:45", "10:00", "10:15", "10:30", "10:45", "11:00"],
  datasets: [
    {
      label: "OSA rate",
      data: shelfName === 'Energy Drink Shelf' 
        ? [100, 100, 83, 75, 50, 75, 83, 100, 100, 100, 100, 100, 100]
        : [100, 100, 100, 100, 75, 50, 25, 50, 75, 100, 100, 100, 100],
      backgroundColor: "rgba(156, 163, 175, 0.3)",
      borderColor: "rgba(107, 114, 128, 1)",
      borderWidth: 1,
      barPercentage: 0.8,
      type: "bar",
    },
  ],
});

const osaChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const osaRate = context.raw as number;
            const avgOsaRate = 83; // Dummy data
            const durationAboveThreshold = 2.50; // Dummy data
            const durationEmpty = 0.00; // Dummy data
  
            return [
              `OSA rate: ${osaRate}%`,
              `Trung bình OSA rate: ${avgOsaRate}%`,
              `Duration (tỷ lệ trống > ngưỡng): ${durationAboveThreshold} phút`,
              `Duration (trống hoàn toàn): ${durationEmpty} phút`
            ];
          }
        }
      },
    annotation: {
      annotations: {
        line1: {
          type: "line",
          yMin: 40,
          yMax: 40,
          borderColor: "rgba(239, 68, 68, 0.8)",
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: "Alert threshold: 40%",
            enabled: true,
            position: "end",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "rgba(239, 68, 68, 1)",
          },
        },
      },
    },
    datalabels: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        color: '#6B7280',
        font: { size: 11 }
      }
    },
    y: { 
      min: 0, 
      max: 100,
      grid: { color: '#F3F4F6' },
      ticks: { 
        color: '#6B7280',
        font: { size: 11 },
        callback: function(value: any) {
          return value + '%';
        }
      }
    },
  },
};

// Dữ liệu cho bảng detail
const tableDetailColumns: any = [
  { 
    title: "Shelf", 
    dataIndex: "shelf", 
    key: "shelf",
    width: 200
  },
  { 
    title: "Shelf operating hours", 
    dataIndex: "operatingHours", 
    key: "operatingHours",
    align: 'center' as const,
    width: 150
  },
  { 
    title: "Shelf shortage hours", 
    dataIndex: "shortageHours", 
    key: "shortageHours",
    align: 'center' as const,
    width: 150
  },
  { 
    title: "Shelf shortage rate", 
    dataIndex: "shortageRate", 
    key: "shortageRate",
    align: 'center' as const,
    width: 150,
    render: (value: any) => `${value}%`
  },
  { 
    title: "Number of times being alerted", 
    dataIndex: "timesAlerted", 
    key: "timesAlerted",
    align: 'center' as const,
    width: 180
  },
  { 
    title: "Number of shelf replenishments", 
    dataIndex: "replenishments", 
    key: "replenishments",
    align: 'center' as const,
    width: 200,
    render: (value: number) => (
        <Progress percent={(value / 5) * 100} showInfo={false} />
    )
  },
];

const tableDetailData = [
  {
    key: '1',
    shelf: 'Energy Drink Shelf',
    operatingHours: 4,
    shortageHours: 0.7,
    shortageRate: 17.5,
    timesAlerted: 3,
    replenishments: 3,
  },
  {
    key: '2',
    shelf: 'Fresh Produce Shelf I',
    operatingHours: 4,
    shortageHours: 0.4,
    shortageRate: 10,
    timesAlerted: 1,
    replenishments: 1,
  },
  {
    key: '3',
    shelf: 'Medicine Shelf I',
    operatingHours: 4,
    shortageHours: 0.5,
    shortageRate: 12.5,
    timesAlerted: 1,
    replenishments: 1,
  },
];

const shelfList = [
  '(Blank)',
  'Beverage shelf',
  'Canned Goods Rack',
  'Clean Supplies Rack', 
  'Coffee Shelf',
  'Cosmetic Shelf',
  'Dairy Shelf',
  'Detergent Rack',
  'Energy Drink Shelf',
  'Fresh food shelf',
  'Fresh Produce Shelf I',
  'Frozen Goods Rack',
  'Household goods',
  'Medicine Shelf I',
  'Packaged Food',
  'Personal care'
];

export default function Statistics() {
  const [selectedShelves, setSelectedShelves] = useState(['Energy Drink Shelf', 'Fresh Produce Shelf I']);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    setSelectedShelves(e.target.checked ? shelfList : []);
  };

  const handleShelfChange = (shelfName: string, checked: boolean) => {
    if (checked) {
      setSelectedShelves([...selectedShelves, shelfName]);
    } else {
      setSelectedShelves(selectedShelves.filter(s => s !== shelfName));
    }
  };

  const filteredShelves = shelfList.filter(shelf =>
    shelf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout className="statistics-layout">
      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Real-time Shelf monitoring
          </Title>
          <Text className="date-range">From 7:00 AM Apr 8, 2025 to current</Text>
        </div>

        <Card title="Filters" style={{ marginBottom: '24px' }}>
            <Row gutter={16} align="middle">
                <Col>
                <Statistic title="Monitored Shelves" value={15} />
                </Col>
                <Col flex="auto">
                <Input.Search
                    placeholder="Search shelf name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </Col>
            </Row>
            <Collapse bordered={false} style={{ marginTop: 16 }}>
                <Panel header="Select Shelves" key="1">
                    <Checkbox
                        onChange={handleSelectAll}
                        checked={selectedShelves.length === shelfList.length}
                        indeterminate={selectedShelves.length > 0 && selectedShelves.length < shelfList.length}
                        style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}
                    >
                        Select all
                    </Checkbox>
                    <div style={{ height: 200, overflowY: 'auto' }}>
                        {filteredShelves.map(shelf => (
                        <Checkbox
                            key={shelf}
                            checked={selectedShelves.includes(shelf)}
                            onChange={(e) => handleShelfChange(shelf, e.target.checked)}
                            style={{ marginBottom: 8, display: 'block' }}
                        >
                            {shelf}
                        </Checkbox>
                        ))}
                    </div>
                </Panel>
            </Collapse>
        </Card>

        <div className="osa-charts-section">
          <Title level={4} style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
            OSA rate by shelf
          </Title>
          
          <div style={{ height: '500px', overflowY: 'auto', paddingRight: '16px' }}>
            {selectedShelves.map(shelfName => (
              <Card className="osa-chart-card" key={shelfName} style={{ marginBottom: '24px' }}>
                <div className="chart-header">
                  <Text strong>{shelfName}</Text>
                </div>
                <div style={{ height: 200, marginTop: 16 }}>
                  <OSAChart
                    data={createOSAData(shelfName)}
                    options={osaChartOptions}
                    title=""
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="table-detail-section" style={{ marginTop: 32 }}>
          <div className="table-header">
            <Title level={4} style={{ marginBottom: 0, fontSize: 16, fontWeight: 600 }}>
              Table detail
            </Title>
            <div className="table-legend">
              <span className="legend-item">● Failed to meet target</span>
            </div>
          </div>
          
          <Table
            columns={tableDetailColumns}
            dataSource={tableDetailData}
            pagination={false}
            size="small"
            className="detail-table"
            style={{ marginTop: 16 }}
          />
        </div>

        <div className="loss-analysis-section" style={{ marginTop: 32 }}>
          <Title level={4} style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
            Potential loss sales analysis
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card className="analysis-card">
                  <Title level={5}>Shortage Analysis</Title>
                  <Text type="secondary">Shelf shortage rate = Total duration of shelf empty ratio higher than alerting threshold/ total operating hours*100</Text>
                  <Statistic title="Average shelf shortage rate" value="25.3%" />
                  <div style={{ height: 120, marginTop: 8 }}>
                      <ShelfShortageLineChart />
                  </div>
                  <Title level={5} style={{marginTop: '24px'}}>Shortage status by each shelf</Title>
                  <div style={{ height: 200, marginTop: 16 }}>
                      <ShelfShortageChart data={fakeShortageByShelf} />
                  </div>
                  <Title level={5} style={{marginTop: '24px'}}>Customer visit while shelf shortage by age and gender</Title>
                  <div style={{ height: 200, marginTop: 16 }}>
                      <CustomerDemographicChart />
                  </div>
                  <Title level={5} style={{marginTop: '24px'}}>Customer visits while shelf shortage overtime</Title>
                  <div style={{ height: 200, marginTop: 16 }}>
                      <CustomerVisitOvertimeChart />
                  </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card className="analysis-card">
                  <Title level={5}>Timely Recovery Analysis</Title>
                  <Text type="secondary">*On-time shelf recovery rate = (Number of on-time shelf recovery)/(Number of replenishment alerts)*100</Text>
                  <Statistic title="On-time shelf recovery rate" value="61.2%" suffix="Target: 61%" />
                  <div style={{ height: 120, marginTop: 8 }}>
                      <RecoveryRateLineChart />
                  </div>
                  <Title level={5} style={{marginTop: '24px'}}>Recovery status by each shelf</Title>
                  <div style={{ height: 200, marginTop: 16 }}>
                      <RecoveryStatusBarChart />
                  </div>
                  <Title level={5} style={{marginTop: '24px'}}>Table detail</Title>
                  <div style={{marginTop: '16px'}}>
                      <AnalysisTreeTable />
                  </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
