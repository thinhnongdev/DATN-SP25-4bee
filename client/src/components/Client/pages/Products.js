import React, { useEffect, useState } from "react";
import { Row, Col, Select, Typography, Slider, Button, Space } from "antd";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/client/sanpham', {
      });
      console.log('Data fetched:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [filters, setFilters] = useState({
    color: [],
    size: [],
    fabric: [],
    priceRange: [0, 200],
  });

  const colors = [...new Set(products.map((p) => p.color))];
  const fabrics = [...new Set(products.map((p) => p.fabric))];
  const sizes = [...new Set(products.flatMap((p) => p.size))];

  const filteredProducts = products.filter((product) => {
    return (
      (filters.color.length === 0 || filters.color.includes(product.color)) &&
      (filters.fabric.length === 0 ||
        filters.fabric.includes(product.fabric)) &&
      (filters.size.length === 0 ||
        product.size.some((s) => filters.size.includes(s))) &&
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1]
    );
  });

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      color: [],
      size: [],
      fabric: [],
      priceRange: [0, 200],
    });
  };

  return (
    <div className="container" style={{ margin: "32px auto" }}>
      <Title level={2}>Bộ sưu tập của chúng tôi</Title>

      {/* Bộ lọc */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} lg={6}>
          <Title level={4}>Bộ lọc</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Title level={5}>Màu sắc</Title>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Chọn màu sắc"
                value={filters.color}
                onChange={(value) => handleFilterChange("color", value)}
              >
                {colors.map((color) => (
                  <Option key={color} value={color}>
                    {color}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Title level={5}>Kích thước</Title>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Chọn kích thước"
                value={filters.size}
                onChange={(value) => handleFilterChange("size", value)}
              >
                {sizes.map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
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
                {fabrics.map((fabric) => (
                  <Option key={fabric} value={fabric}>
                    {fabric}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Title level={5}>Khoảng giá</Title>
              <Slider
                range
                min={0}
                max={200}
                value={filters.priceRange}
                onChange={(value) => handleFilterChange("priceRange", value)}
                tipFormatter={(value) => `${value}đ`}
              />
            </div>

            <Button type="default" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </Space>
        </Col>

        {/* Lưới sản phẩm */}
        <Col xs={24} lg={18}>
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                <ProductCard {...product} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Products;
