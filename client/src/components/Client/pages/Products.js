import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Select,
  Typography,
  Slider,
  Button,
  Space,
  Input,
  Divider,
  Card,
  Empty,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/client/sanpham");
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [filters, setFilters] = useState({
    color: [],
    size: [],
    fabric: [],
    priceRange: [0, 2000],
  });


  const clearFilters = () => {
    setFilters({
      color: [],
      size: [],
      fabric: [],
      priceRange: [0, 2000],
    });
    setSearchKeyword("");
  };

  const colors = [...new Set(products.flatMap((p) => p.tenMauSac || []))];
const fabrics = [...new Set(products.map((p) => p.tenChatLieu).filter(Boolean))];
const sizes = [...new Set(products.flatMap((p) => p.tenKichThuoc || []))];

const handleFilterChange = (type, value) => {
  setFilters((prev) => ({
    ...prev,
    [type]: value,
  }));
};

const filteredProducts = products.filter((product) => {
  return (
    (filters.color.length === 0 || (product.tenMauSac || []).some((c) => filters.color.includes(c))) &&
    (filters.size.length === 0 || (product.tenKichThuoc || []).some((s) => filters.size.includes(s))) &&
    (filters.fabric.length === 0 || filters.fabric.includes(product.tenChatLieu)) &&
    product.gia >= filters.priceRange[0] * 1000 &&
    product.gia <= filters.priceRange[1] * 1000 &&
    product.ten.toLowerCase().includes(searchKeyword.toLowerCase())
  );
});


  return (
    <div style={{ padding: "32px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
        Bộ sưu tập của chúng tôi
      </Title>

      <Row gutter={[24, 24]}>
        {/* BỘ LỌC */}
        <Col xs={24} lg={6}>
          <Card bordered>
            <Title level={4}>Bộ lọc</Title>

            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginBottom: 20 }}
            />

            <Divider />

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Màu sắc</Title>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn màu"
                  value={filters.color}
                  onChange={(value) => handleFilterChange("color", value)}
                >
                  {colors.map((c) => (
                    <Option key={c}>{c}</Option>
                  ))}
                </Select>
              </div>

              <div>
                <Title level={5}>Kích thước</Title>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn size"
                  value={filters.size}
                  onChange={(value) => handleFilterChange("size", value)}
                >
                  {sizes.map((s) => (
                    <Option key={s}>{s}</Option>
                  ))}
                </Select>
              </div>

              <div>
                <Title level={5}>Chất liệu</Title>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn chất liệu"
                  value={filters.fabric}
                  onChange={(value) => handleFilterChange("fabric", value)}
                >
                  {fabrics.map((f) => (
                    <Option key={f}>{f}</Option>
                  ))}
                </Select>
              </div>

              <div>
                <Title level={5}>Khoảng giá (nghìn)</Title>
                <Slider
                  range
                  min={0}
                  max={2000}
                  value={filters.priceRange}
                  onChange={(value) => handleFilterChange("priceRange", value)}
                  tipFormatter={(val) => `${val}k`}
                />
              </div>

              <Button onClick={clearFilters} block>
                Xóa bộ lọc
              </Button>
            </Space>
          </Card>
        </Col>

        {/* DANH SÁCH SẢN PHẨM */}
        <Col xs={24} lg={18}>
          <Row gutter={[16, 16]}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Col xs={24} sm={12} md={8} key={product.id}>
                  <ProductCard {...product} />
                </Col>
              ))
            ) : (
              <Col span={24} style={{ textAlign: "center", marginTop: 40 }}>
                <Empty description="Không tìm thấy sản phẩm phù hợp" />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Products;
