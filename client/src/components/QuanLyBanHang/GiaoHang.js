import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, message } from "antd";
import axios from "axios";

const GiaoHang = ({ customerId, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [provinceData, setProvinceData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);

  // Lấy danh sách địa chỉ của khách hàng (nếu có)
  useEffect(() => {
    if (customerId) {
      axios
        .get(`http://localhost:5000/api/khach_hang/diaChi/${customerId}`)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data);
            if (data.length === 1) {
              setSelectedAddress(data[0]);
              onAddressSelect(data[0]); // Gửi địa chỉ lên BanHang.js
            } else {
              setIsModalVisible(true);
            }
          }
        })
        .catch(() => message.error("Lỗi khi lấy địa chỉ khách hàng."));
    }

    // Lấy dữ liệu tỉnh/thành phố từ db.json
    axios
      .get("http://localhost:5000/data")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProvinceData(response.data);
        } else {
          console.error("Dữ liệu tỉnh/thành phố không hợp lệ:", response.data);
          setProvinceData([]);
        }
      })
      .catch(() => {
        console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố");
        setProvinceData([]);
      });
  }, [customerId]);

  // Xử lý chọn tỉnh/thành phố
  const handleProvinceChange = (value) => {
    setProvince(value);
    const selectedProvince = provinceData.find((p) => p.full_name === value);
    setDistrictData(selectedProvince ? selectedProvince.data2 : []);
    setDistrict(null);
    setWard(null);
  };

  // Xử lý chọn quận/huyện
  const handleDistrictChange = (value) => {
    setDistrict(value);
    const selectedDistrict = districtData.find((d) => d.full_name === value);
    setWardData(selectedDistrict ? selectedDistrict.data3 : []);
    setWard(null);
  };

  // Xử lý chọn xã/phường
  const handleWardChange = (value) => {
    setWard(value);
  };

  // Xử lý chọn địa chỉ từ danh sách có sẵn
  const handleAddressSelect = () => {
    if (!selectedAddress) {
      message.error("Vui lòng chọn một địa chỉ hợp lệ.");
      return;
    }
    onAddressSelect(selectedAddress);
    setIsModalVisible(false);
  };

  // Xác nhận địa chỉ nhập thủ công
  const handleAddressSubmit = () => {
    if (!manualAddress || !province || !district || !ward) {
      message.error("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    const fullAddress = `${manualAddress}, ${ward}, ${district}, ${province}`;
    const newAddress = {
      id: Math.random().toString(36).substr(2, 9),
      fullAddress,
      province,
      district,
      ward,
    };

    onAddressSelect(newAddress);
  };

  return (
    <div>
      {/* Nếu khách hàng đã có nhiều địa chỉ, hiển thị modal chọn địa chỉ */}
      {customerId && addresses.length > 1 && (
        <>
          <Button onClick={() => setIsModalVisible(true)}>Chọn địa chỉ</Button>
          <Modal
            title="Chọn địa chỉ giao hàng"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>,
              <Button key="confirm" type="primary" onClick={handleAddressSelect}>
                Xác nhận
              </Button>,
            ]}
          >
            <Select
              style={{ width: "100%" }}
              value={selectedAddress ? selectedAddress.id : undefined}
              onChange={(value) =>
                setSelectedAddress(addresses.find((addr) => addr.id === value))
              }
            >
              {addresses.map((address) => (
                <Select.Option key={address.id} value={address.id}>
                  {address.fullAddress}
                </Select.Option>
              ))}
            </Select>
          </Modal>
        </>
      )}

      {/* Nếu khách hàng mới (không có customerId), nhập địa chỉ thủ công */}
      {!customerId && (
        <div>
          <Select
            placeholder="Chọn tỉnh/thành phố"
            onChange={handleProvinceChange}
            value={province}
            style={{ width: "100%", marginBottom: 10 }}
          >
            {(provinceData || []).map((p) => (
              <Select.Option key={p.id} value={p.full_name}>
                {p.full_name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Chọn quận/huyện"
            onChange={handleDistrictChange}
            value={district}
            style={{ width: "100%", marginBottom: 10 }}
            disabled={!province}
          >
            {(districtData || []).map((d) => (
              <Select.Option key={d.id} value={d.full_name}>
                {d.full_name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Chọn xã/phường"
            onChange={(value) => setWard(value)}
            value={ward}
            style={{ width: "100%", marginBottom: 10 }}
            disabled={!district}
          >
            {(wardData || []).map((w) => (
              <Select.Option key={w.id} value={w.full_name}>
                {w.full_name}
              </Select.Option>
            ))}
          </Select>

          <Input
            placeholder="Nhập địa chỉ chi tiết"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <Button type="primary" onClick={handleAddressSubmit}>
            Xác nhận địa chỉ
          </Button>
        </div>
      )}
    </div>
  );
};

export default GiaoHang;
