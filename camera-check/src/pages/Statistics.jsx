import React, { useState } from "react";
import { Layout, Row, Col, Card, DatePicker, Checkbox, Input, Typography, Statistic, Table, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import OSAChart from "../components/statistics/OSAChart";
import ShelfShortageLineChart from "../components/statistics/ShelfShortageLineChart";
import RecoveryRateLineChart from "../components/statistics/RecoveryRateLineChart";
import RecoveryStatusBarChart from "../components/statistics/RecoveryStatusBarChart";
import ShortageStatusChart from "../components/statistics/ShortageStatusChart";
import CustomerDemographicChart from "../components/statistics/CustomerDemographicChart";
import CustomerVisitOvertimeChart from "../components/statistics/CustomerVisitOvertimeChart";
import "../styles/Statistics.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dữ liệu mẫu cho OSA Chart
const createOSAData = (shelfName) => ({
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

const osaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
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
        callback: function(value) {
          return value + '%';
        }
      }
    },
  },
};

// Dữ liệu cho bảng detail
const tableDetailColumns = [
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
    align: 'center',
    width: 150
  },
  { 
    title: "Shelf shortage hours", 
    dataIndex: "shortageHours", 
    key: "shortageHours",
    align: 'center',
    width: 150
  },
  { 
    title: "Shelf shortage rate", 
    dataIndex: "shortageRate", 
    key: "shortageRate",
    align: 'center',
    width: 150,
    render: (value) => `${value}%`
  },
  { 
    title: "Number of times being alerted", 
    dataIndex: "timesAlerted", 
    key: "timesAlerted",
    align: 'center',
    width: 180
  },
  { 
    title: "Number of shelf replenishments", 
    dataIndex: "replenishments", 
    key: "replenishments",
    align: 'center',
    width: 200
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
    replenishments: '●',
  },
  {
    key: '2',
    shelf: 'Fresh Produce Shelf I',
    operatingHours: 4,
    shortageHours: 0.4,
    shortageRate: 10,
    timesAlerted: 1,
    replenishments: '●',
  },
  {
    key: '3',
    shelf: 'Medicine Shelf I',
    operatingHours: 4,
    shortageHours: 0.5,
    shortageRate: 12.5,
    timesAlerted: 1,
    replenishments: '●',
  },
];

// Danh sách shelves
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

  const handleSelectAll = (e) => {
    setSelectedShelves(e.target.checked ? shelfList : []);
  };

  const handleShelfChange = (shelfName, checked) => {
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
      <Layout>
        {/* Left Sidebar */}
        <Sider className="statistics-sider" width={280}>
          <div className="shelf-monitoring-header">
            <Title level={4} style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
              Real-time Shelf monitoring
            </Title>
            <Text className="date-range">From 7:00 AM Apr 8, 2025 to current</Text>
          </div>

          <div className="shelf-count-card">
            <div className="shelf-count">
              <span className="count-number">15</span>
              <Text className="count-label">Tổng số kệ được theo dõi</Text>
            </div>
          </div>

          <div className="shelf-name-section">
            <Text strong className="section-title">Shelf name</Text>
            
            <Input
              placeholder="Search shelf name"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16, marginTop: 8 }}
            />

            <Checkbox
              onChange={handleSelectAll}
              checked={selectedShelves.length === shelfList.length}
              indeterminate={selectedShelves.length > 0 && selectedShelves.length < shelfList.length}
              style={{ marginBottom: 16 }}
            >
              Select all
            </Checkbox>

            <div className="shelf-checkbox-list">
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
          </div>
        </Sider>

        {/* Main Content */}
        <Content className="statistics-content">
          {/* OSA Rate Charts Section */}
          <div className="osa-charts-section">
            <Title level={4} style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
              OSA rate by shelf
            </Title>
            
            <Row gutter={[24, 24]}>
              {selectedShelves.slice(0, 2).map(shelfName => (
                <Col span={12} key={shelfName}>
                  <Card className="osa-chart-card">
                    <div className="chart-header">
                      <Text strong>{shelfName}</Text>
                      <div className="chart-info">
                        <Text className="chart-timestamp">Timestamp: 8:45:10 AM</Text>
                        <Text className="chart-status">Trống kệ OSA rate: 83%</Text>
                        <Text className="chart-duration">Duration (empty ratio &gt; alert threshold): 2.50 minute</Text>
                        <Text className="chart-duration">Duration (empty ratio &lt; 100%): 0.00 minute</Text>
                      </div>
                    </div>
                    <div style={{ height: 200, marginTop: 16 }}>
                      <OSAChart 
                        data={createOSAData(shelfName)} 
                        options={osaChartOptions}
                        title=""
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Table Detail Section */}
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

          {/* Potential Loss Sales Analysis Section */}
          <div className="loss-analysis-section" style={{ marginTop: 32 }}>
            <Title level={4} style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
              Potential loss sales analysis
            </Title>
            
            <Row gutter={[24, 24]}>
              {/* Left Column - Date Filter and Metrics */}
              <Col span={8}>
                <Card className="analysis-card">
                  <div className="date-filter">
                    <Text>Date</Text>
                    <Select defaultValue="2025/04/01 - 2025/04/30" style={{ width: '100%', marginTop: 8 }}>
                      <Option value="2025/04/01 - 2025/04/30">2025/04/01 - 2025/04/30</Option>
                    </Select>
                  </div>
                  
                                     <div className="metrics-grid" style={{ marginTop: 24 }}>
                     <div className="metric-item">
                       <Text className="metric-label">Average shelf shortage rate</Text>
                       <Title level={2} className="metric-value">25.3%</Title>
                     </div>
                     
                     <div className="metric-item" style={{ marginTop: 20 }}>
                       <Text className="metric-label">Average shelf shortage rate</Text>
                       <Title level={2} className="metric-value">26%</Title>
                     </div>
                     
                     <div style={{ marginTop: 20 }}>
                       <div style={{ height: 120 }}>
                         <ShelfShortageLineChart />
                       </div>
                     </div>
                   </div>
                </Card>
              </Col>

              {/* Middle Column - Charts */}
              <Col span={8}>
                <Card className="analysis-card">
                  <div className="analysis-content">
                    <div className="metric-section">
                      <Text className="metric-description">
                        Shelf shortage rate = Total duration of shelf empty ratio higher than alerting threshold/ total operating hours*100
                      </Text>
                      <Title level={2} className="metric-main-value">61.2%</Title>
                      <Text className="metric-target">Target: 61%</Text>
                    </div>
                    
                                         <div className="metric-section" style={{ marginTop: 20 }}>
                       <Text className="metric-label">On-time shelf recovery rate overtime</Text>
                       <div style={{ height: 120, marginTop: 8 }}>
                         <RecoveryRateLineChart />
                       </div>
                     </div>
                  </div>
                </Card>
              </Col>

              {/* Right Column - Recovery Rate */}
              <Col span={8}>
                <Card className="analysis-card">
                  <div className="recovery-section">
                    <Text className="metric-description">
                      *On-time shelf recovery rate = (Number of on-time shelf recovery)/(Number of replenishment alerts)*100
                    </Text>
                    <Title level={2} className="metric-main-value">61.2%</Title>
                    
                                         <div style={{ marginTop: 20 }}>
                       <Text className="metric-label">Recovery status by each shelf</Text>
                       <div style={{ height: 120, marginTop: 8 }}>
                         <RecoveryStatusBarChart />
                       </div>
                     </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Bottom Row - Shortage Status and Customer Visits */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                             <Col span={12}>
                 <Card className="analysis-card">
                   <Text className="section-title">Shortage status by each shelf</Text>
                   <div style={{ height: 200, marginTop: 16 }}>
                     <ShortageStatusChart />
                   </div>
                 </Card>
               </Col>
               
               <Col span={12}>
                 <Card className="analysis-card">
                   <Text className="section-title">Customer visit while shelf shortage by age and gender</Text>
                   <div style={{ height: 200, marginTop: 16 }}>
                     <CustomerDemographicChart />
                   </div>
                 </Card>
               </Col>
            </Row>

            {/* Customer Visits Overtime */}
                         <Row style={{ marginTop: 24 }}>
               <Col span={24}>
                 <Card className="analysis-card">
                   <Text className="section-title">Customer visits while shelf shortage overtime</Text>
                   <div style={{ height: 200, marginTop: 16 }}>
                     <CustomerVisitOvertimeChart />
                   </div>
                 </Card>
               </Col>
             </Row>

            {/* Table Detail at Bottom */}
            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card className="analysis-card">
                  <Text className="section-title">Table detail</Text>
                  <div className="expandable-table" style={{ marginTop: 16 }}>
                    <div className="table-row">
                      <Text>Year</Text>
                      <Text>Shelf operating hour</Text>
                      <Text>Shelf shortage hour</Text>
                    </div>
                    <div className="table-expandable">
                      <Button type="text" className="expand-btn">+ Store</Button>
                      <Button type="text" className="expand-btn">= 2025</Button>
                      <Button type="text" className="expand-btn">= Qtr 2</Button>
                      <Button type="text" className="expand-btn">= April</Button>
                    </div>
                    
                    <div className="shelf-details">
                      <div className="shelf-detail-row">
                        <Text>= Beverage shelf 1</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                      <div className="shelf-detail-row">
                        <Text>= Canned goods rack</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                      <div className="shelf-detail-row">
                        <Text>= Coffee shelf</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                      <div className="shelf-detail-row">
                        <Text>= Cosmetics shelf</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                      <div className="shelf-detail-row">
                        <Text>= Dairy shelf</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                      <div className="shelf-detail-row highlighted">
                        <Text>= Detergent rack</Text>
                        <Text>8</Text>
                        <Text>0.1</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}