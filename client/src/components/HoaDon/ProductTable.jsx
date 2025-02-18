import React, { useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Button, Modal, Table, Typography, InputNumber, Space, Tooltip } from "antd";
import { formatCurrency } from "../../utils/format";

const ProductTable = ({ products, onAddProduct, open, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [tempQuantities, setTempQuantities] = useState({});

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleQuantityChange = (productDetailId, value) => {
        const newQuantity = Math.max(1, parseInt(value) || 1);
        setTempQuantities((prev) => ({ ...prev, [productDetailId]: newQuantity }));
    };

    const handleAddProduct = (productDetail) => {
        if (productDetail) {
            const quantity = tempQuantities[productDetail.id] || 1;
            onAddProduct(productDetail, quantity);
            setTempQuantities((prev) => ({ ...prev, [productDetail.id]: 1 }));
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 70,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'hinhAnh',
            key: 'hinhAnh',
            width: 100,
            align: 'center',
            render: (hinhAnh, record) => (
                <img
                    src={hinhAnh}
                    alt={record.tenSanPham}
                    style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }}
                />
            ),
        },
        {
            title: 'Thông tin',
            key: 'thongTin',
            align: 'center',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Typography.Text strong>{record.tenSanPham}</Typography.Text>
                    <Typography.Text type="secondary">Mã: {record.maSanPham}</Typography.Text>
                    <Typography.Text type="secondary">Màu: {record.mauSac}</Typography.Text>
                    <Typography.Text type="secondary">Kích thước: {record.kichThuoc}</Typography.Text>
                    <Typography.Text type="secondary">Chất liệu: {record.chatLieu}</Typography.Text>
                </Space>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'gia',
            key: 'gia',
            align: 'center',
            render: (gia) => formatCurrency(gia),
        },
        {
            title: 'Số lượng',
            key: 'soLuong',
            align: 'center',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={record.soLuongTonKho} // Kiểm tra số lượng tồn kho
                    value={tempQuantities[record.id] || 1}
                    onChange={(value) => handleQuantityChange(record.id, value)}
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Thêm sản phẩm chi tiết vào hóa đơn">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddProduct(record)}
                        style={{ backgroundColor: 'black' }}
                    >
                        Thêm
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={1000}
            title="Chọn sản phẩm chi tiết"
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{
                        emptyText: 'Không tìm thấy sản phẩm nào'
                    }}
                />
            </Space>
        </Modal>
    );
};

export default ProductTable;
