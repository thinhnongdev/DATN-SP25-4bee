import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Spin,
  DatePicker,
  Radio,
  Table,
  Tag,
  Space,
  Progress,
  Typography,
} from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title: AntTitle } = Typography;

const ThongkeList = () => {
  const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [statsView, setStatsView] = useState("Ngày");
  const [activeTab, setActiveTab] = useState("Số lượng");
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const [revenueDay, setRevenueDay] = useState(null);
  const [growthDay, setGrowthDay] = useState(null);
  const [revenueWeek, setRevenueWeek] = useState(null);
  const [growthWeek, setGrowthWeek] = useState(null);
  const [revenueMonth, setRevenueMonth] = useState(null);
  const [growthMonth, setGrowthMonth] = useState(null);
  const [revenueYear, setRevenueYear] = useState(null);
  const [growthYear, setGrowthYear] = useState(null);

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 1 }],
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Fetch doanh thu ngày, tuần, tháng, năm
  useEffect(() => {
    if (!token) return;

    const fetchRevenueData = async () => {
      try {
        const endpoints = [
          { url: "http://localhost:8080/thong-ke/doanh-thu-ngay", setRevenue: setRevenueDay, setGrowth: setGrowthDay },
          { url: "http://localhost:8080/thong-ke/doanh-thu-tuan", setRevenue: setRevenueWeek, setGrowth: setGrowthWeek },
          { url: "http://localhost:8080/thong-ke/doanh-thu-thang", setRevenue: setRevenueMonth, setGrowth: setGrowthMonth },
          { url: "http://localhost:8080/thong-ke/doanh-thu-nam", setRevenue: setRevenueYear, setGrowth: setGrowthYear },
        ];

        const requests = endpoints.map(({ url, setRevenue, setGrowth }) =>
          axios.get(url, { headers: getAuthHeaders() }).then((response) => {
            setRevenue(response.data.revenue);
            setGrowth(response.data.growth);
          })
        );

        await Promise.all(requests);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
      }
    };

    fetchRevenueData();
  }, [token]);

  // Fetch dữ liệu biểu đồ cột
  useEffect(() => {
    if (!token) return;

    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        let url = "";
        let revenueUrl = "";
        const startDateFormatted = dateRange[0].isValid() ? dateRange[0].format("YYYY-MM-DD") : "";
        const endDateFormatted = dateRange[1].isValid() ? dateRange[1].format("YYYY-MM-DD") : "";

        if (activeTab === "Số lượng") {
          if (statsView === "Ngày") {
            url = `http://localhost:8080/thong-ke/so-luong-ban?startDate=${startDateFormatted}&endDate=${endDateFormatted}`;
          } else if (statsView === "Tháng") {
            url = "http://localhost:8080/thong-ke/so-luong-theo-thang";
          } else {
            url = "http://localhost:8080/thong-ke/so-luong-theo-nam";
          }
        } else {
          if (statsView === "Ngày") {
            revenueUrl = `http://localhost:8080/thong-ke/doanh-thu?start=${startDateFormatted}&end=${endDateFormatted}`;
          } else if (statsView === "Tháng") {
            revenueUrl = "http://localhost:8080/thong-ke/doanh-thu-thang-cot";
          } else {
            revenueUrl = "http://localhost:8080/thong-ke/doanh-thu-cac-thang-trong-nam";
          }
        }

        let chartData = {};
        if (url) {
          const response = await axios.get(url, { headers: getAuthHeaders() });
          let data = response.data.data || response.data;

          const labels = data.map((item) => item.date || "");
          const values = data.map((item) => item.soluong || item.soLuong || 0);

          chartData = {
            labels,
            datasets: [
              {
                label: "Số lượng",
                data: values,
                backgroundColor: "rgba(75, 85, 255, 0.8)",
                borderWidth: 1,
                minBarLength: 10,
              },
            ],
          };
        }

        if (revenueUrl) {
          const revenueResponse = await axios.get(revenueUrl, { headers: getAuthHeaders() });
          let revenueData = revenueResponse.data.data || revenueResponse.data;

          const revenueLabels = revenueData.map((item) => item.date || "");
          const revenueValues = revenueData.map((item) => item.revenue || 0);

          chartData = {
            labels: revenueLabels,
            datasets: [
              {
                label: "Doanh thu",
                data: revenueValues,
                backgroundColor: "rgba(75, 85, 255, 0.8)",
                borderWidth: 1,
                minBarLength: 10,
              },
            ],
          };
        }

        setChartData(chartData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
        setChartData({
          labels: ["Không có dữ liệu"],
          datasets: [{ label: "Không có dữ liệu", data: [0], backgroundColor: "rgba(75, 85, 255, 0.8)" }],
        });
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [dateRange, statsView, activeTab, token]);

  // Fetch dữ liệu thống kê đơn hàng (biểu đồ tròn)
  useEffect(() => {
    if (!token) return;

    const fetchStatistics = async () => {
      try {
        const response = await axios.get("http://localhost:8080/thong-ke/statistics", { headers: getAuthHeaders() });
        const data = response.data;

        const allStatuses = [
          "Chờ xác nhận",
          "Đã xác nhận",
          "Đang giao",
          "Hoàn thành",
          "Đã hủy",
          "Đã hoàn hàng",
        ];

        const total = data.reduce((sum, item) => sum + item.soLuong, 0);
        setTotalOrders(total);

        const formattedData = allStatuses.map((status) => {
          const found = data.find((item) => item.maHoaDon === status);
          return found ? found.soLuong : 0;
        });

        setPieChartData({
          labels: allStatuses,
          datasets: [
            {
              data: formattedData,
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(201, 203, 207, 0.7)",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [token]);

  // Fetch đơn hàng gần đây
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8080/thong-ke/don-hang-gan-day", { headers: getAuthHeaders() })
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          key: item.stt,
          orderNumber: item.stt,
          invoiceCode: item.mahoadon,
          status: getStatusLabel(item.trangthai),
          statusType: getStatusType(item.trangthai),
          fulfillmentStatus: getFulfillmentLabel(item.loaidon),
          fulfillmentType: getFulfillmentType(item.loaidon),
          date: dayjs(item.ngaytao).format("DD/MM/YYYY HH:mm"),
          customer: item.khachHang,
          amount: item.doanhSo ?? 0,
        }));
        setRecentOrders(formattedData);
      })
      .catch((error) => console.error("Lỗi khi lấy đơn hàng:", error));
  }, [token]);

  // Fetch top sản phẩm thịnh hành
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8080/thong-ke/top-san-pham", { headers: getAuthHeaders() })
      .then((response) => {
        const formattedData = response.data.map((item, index) => ({
          key: index + 1,
          product: item[0],
          sold: item[1],
          icon: `https://via.placeholder.com/32?text=${item[0][0]}`,
        }));
        setTopProducts(formattedData);
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu top sản phẩm:", error));
  }, [token]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0 ₫";
    return `${value.toLocaleString("vi-VN")} ₫`;
  };

  // Các hàm xử lý trạng thái và màu sắc (giữ nguyên)
  const getStatusLabel = (status) => {
    switch (status) {
      case 1: return "Chờ xác nhận";
      case 2: return "Đã xác nhận";
      case 3: return "Đang giao";
      case 4: return "Hoàn thành";
      case 5: return "Đã hủy";
      case 6: return "Đã hoàn hàng";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case "warning": return "orange";
      case "processing": return "blue";
      case "success": return "green";
      case "purple": return "purple";
      case "danger": return "red";
      case "gray": return "gray";
      default: return "default";
    }
  };

  const getStatusType = (status) => {
    switch (status) {
      case 1: return "warning";
      case 2: return "success";
      case 3: return "processing";
      case 4: return "purple";
      case 5: return "danger";
      case 6: return "gray";
      default: return "default";
    }
  };

  const getFulfillmentLabel = (type) => (type === 1 ? "Online" : "Tại quầy");
  const getFulfillmentColor = (fulfillmentType) => (fulfillmentType === "online" ? "blue" : "gold");
  const getFulfillmentType = (type) => (type === 1 ? "online" : "offline");

  const orderColumns = [
    { title: "STT", dataIndex: "orderNumber", key: "orderNumber" },
    { title: "Mã Hoá Đơn", dataIndex: "invoiceCode", key: "invoiceCode" },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (text, record) => <Tag color={getStatusColor(record.statusType)}>{text}</Tag>,
    },
    {
      title: "LOẠI",
      dataIndex: "fulfillmentStatus",
      key: "fulfillmentStatus",
      render: (text, record) => <Tag color={getFulfillmentColor(record.fulfillmentType)}>{text}</Tag>,
    },
    { title: "NGÀY TẠO", dataIndex: "date", key: "date" },
    { title: "KHÁCH HÀNG", dataIndex: "customer", key: "customer" },
    { title: "DOANH SỐ", dataIndex: "amount", key: "amount", render: (amount) => formatCurrency(amount) },
  ];

  const productColumns = [
    {
      title: "SẢN PHẨM",
      dataIndex: "product",
      key: "product",
      render: (text) => <Space>{text}</Space>,
    },
    {
      title: "ĐÃ BÁN",
      dataIndex: "sold",
      key: "sold",
      render: (text) => (
        <Space>
          <span>{text}</span>
          <Progress
            percent={Math.min(text * 5, 100)}
            showInfo={false}
            size="small"
            strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
            style={{ width: 100 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Tổng quan bán hàng"
            style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <p>Xem doanh số và tóm tắt hiện tại của bạn</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={6}>
          <Card style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Statistic
              title="Doanh số hôm nay"
              value={revenueDay}
              precision={0}
              valueStyle={{ color: growthDay >= 0 ? "#3f8600" : "#cf1322" }}
              suffix={
                <>
                  ₫
                  <Tag color={growthDay >= 0 ? "success" : "error"} style={{ marginLeft: 8 }}>
                    {growthDay >= 0 ? `+${growthDay}%` : `${growthDay}%`}
                  </Tag>
                </>
              }
            />
            <div style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "8px" }}>So với ngày trước</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Statistic
              title="Doanh số tuần này"
              value={revenueWeek}
              precision={0}
              valueStyle={{ color: growthWeek >= 0 ? "#3f8600" : "#cf1322" }}
              suffix={
                <>
                  ₫
                  <Tag color={growthWeek >= 0 ? "success" : "error"} style={{ marginLeft: 8 }}>
                    {growthWeek >= 0 ? `+${growthWeek}%` : `${growthWeek}%`}
                  </Tag>
                </>
              }
            />
            <div style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "8px" }}>So với tuần trước</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Statistic
              title="Doanh số tháng này"
              value={revenueMonth}
              precision={0}
              valueStyle={{ color: growthMonth >= 0 ? "#3f8600" : "#cf1322" }}
              suffix={
                <>
                  ₫
                  <Tag color={growthMonth >= 0 ? "success" : "error"} style={{ marginLeft: 8 }}>
                    {growthMonth >= 0 ? `+${growthMonth}%` : `${growthMonth}%`}
                  </Tag>
                </>
              }
            />
            <div style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "8px" }}>So với tháng trước</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Statistic
              title="Doanh số năm nay"
              value={revenueYear}
              precision={0}
              valueStyle={{ color: growthYear >= 0 ? "#3f8600" : "#cf1322" }}
              suffix={
                <>
                  ₫
                  <Tag color={growthYear >= 0 ? "success" : "error"} style={{ marginLeft: 8 }}>
                    {growthYear >= 0 ? `+${growthYear}%` : `${growthYear}%`}
                  </Tag>
                </>
              }
            />
            <div style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "8px" }}>So với năm trước</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={16}>
          <Card
            style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
            title="Thống kê"
            extra={
              <Space>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates || [dayjs().startOf("month"), dayjs()])}
                  format="YYYY-MM-DD"
                />
                <Radio.Group
                  value={statsView}
                  onChange={(e) => setStatsView(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="Ngày">Ngày</Radio.Button>
                  <Radio.Button value="Tháng">Tháng</Radio.Button>
                  <Radio.Button value="Năm">Năm</Radio.Button>
                </Radio.Group>
              </Space>
            }
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
              <TabPane tab="Số lượng" key="Số lượng">
                {loadingChart ? (
                  <Spin style={{ width: "100%", padding: "20px" }} />
                ) : (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" }, tooltip: { mode: "index" } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: activeTab } } },
                    }}
                  />
                )}
              </TabPane>
              <TabPane tab="Doanh số" key="Doanh số">
                {loadingChart ? (
                  <Spin style={{ width: "100%", padding: "20px" }} />
                ) : (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: "top" },
                        tooltip: {
                          mode: "index",
                          callbacks: { label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}` },
                        },
                      },
                      scales: { y: { beginAtZero: true, title: { display: true, text: "Doanh số (₫)" } } },
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{ height: "100%", padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
            title="Thống kê đơn hàng"
            extra={<AntTitle level={5} style={{ margin: 0 }}>{totalOrders} Đơn hàng</AntTitle>}
          >
            {isLoading ? (
              <div style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin tip="Đang tải dữ liệu..." />
              </div>
            ) : (
              <Pie
                data={pieChartData}
                options={{
                  plugins: {
                    legend: { position: "right", labels: { boxWidth: 15, padding: 15, font: { family: "Arial", size: 12 } } },
                    tooltip: { bodyFont: { family: "Arial", size: 14 } },
                  },
                  maintainAspectRatio: false,
                }}
                height={230}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={16}>
          <Card
            style={{ padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
            title="Đơn hàng gần đây"
          >
            <Table columns={orderColumns} dataSource={recentOrders} pagination={false} size="small" scroll={{ y: 250 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Top sản phẩm thịnh hành"
            style={{ height: "100%", padding: "20px", borderRadius: "6px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <Table columns={productColumns} dataSource={topProducts} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThongkeList;