import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, DatePicker, Radio, Col } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getDiaChiByIdKhachHang,
  getKhachHangById,
  getPutApi,
} from "./KhachHangApi";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const DetailForm = ({ selectedKhachHang, getAllKhachHang, handleClose }) => {
  const [form] = Form.useForm();
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);
  const [khachHang, setKhachHang] = useState(null);

  // Add new state for addresses
  const [addresses, setAddresses] = useState([]);

  // Add state to store district and ward lists for each address
  const [addressLists, setAddressLists] = useState([]);

  useEffect(() => {
    if (typeof getAllKhachHang !== "function") {
      console.error("getAllKhachHang prop is not a function:", getAllKhachHang);
    }
  }, [getAllKhachHang]);

  useEffect(() => {
    if (selectedKhachHang) {
      // Get customer info
      getKhachHangById(selectedKhachHang)
        .then((response) => {
          setKhachHang(response.data);

          form.setFieldsValue({
            maKhachHang: response.data.maKhachHang || "",
            tenKhachHang: response.data.tenKhachHang || "",
            email: response.data.email || "",
            soDienThoai: response.data.soDienThoai || "",
            ngaySinh: response.data.ngaySinh
              ? dayjs(response.data.ngaySinh)
              : null,
            gioiTinh: response.data.gioiTinh ? "true" : "false",
          });
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin khách hàng:", error);
          toast.error("Lỗi khi lấy thông tin khách hàng!");
        });

      // Get address info separately
      getDiaChiByIdKhachHang(selectedKhachHang)
        .then((response) => {
          if (response.data && Array.isArray(response.data)) {
            setAddresses(response.data);

            // Set form values for addresses
            response.data.forEach((address, index) => {
              form.setFieldsValue({
                [`addresses[${index}].tinh`]: address.tinh,
                [`addresses[${index}].huyen`]: address.huyen,
                [`addresses[${index}].xa`]: address.xa,
              });

              // Load district and ward data if needed
              if (address.tinh) handleTinhChange(address.tinh, index);
              if (address.huyen) handleHuyenChange(address.huyen, index);
            });
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin địa chỉ:", error);
          toast.error("Lỗi khi lấy thông tin địa chỉ!");
        });
    }
  }, [selectedKhachHang, form]);

  //   Xử lý thêm địa chỉ mới
  useEffect(() => {
    const fetchTinhThanh = async () => {
      try {
        const response = await axios.get("http://localhost:5000/data");
        console.log("Dữ liệu API nhận được:", response.data); // Kiểm tra dữ liệu

        // Kiểm tra response.data có phải là mảng không
        setTinhThanhList(Array.isArray(response.data) ? response.data : []);
        console.log("Tinh", setTinhThanhList);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
        setTinhThanhList([]); // Nếu lỗi, đặt giá trị mặc định là []
      }
    };

    fetchTinhThanh();
  }, []);

  useEffect(() => {
    console.log("Danh sách tỉnh/thành đã cập nhật:", tinhThanhList);
  }, [tinhThanhList]);

  const handleTinhChange = (tinhName, addressIndex) => {
    const selectedTinh = tinhThanhList.find((tinh) => tinh.name === tinhName);
    if (selectedTinh) {
      setAddressLists((prev) => ({
        ...prev,
        [addressIndex]: {
          districts: selectedTinh.data2 || [],
          wards: [],
        },
      }));

      // Cập nhật dữ liệu địa chỉ
      const newAddresses = [...addresses];
      newAddresses[addressIndex] = {
        ...newAddresses[addressIndex],
        tinh: tinhName,
        huyen: null,
        xa: null,
      };
      setAddresses(newAddresses);

      // Xóa giá trị quận/huyện, xã/phường
      form.setFieldsValue({
        [`addresses[${addressIndex}].huyen`]: undefined,
        [`addresses[${addressIndex}].xa`]: undefined,
      });
    }
  };

  const handleHuyenChange = (huyenName, addressIndex) => {
    const selectedTinh = tinhThanhList.find(
      (tinh) => tinh.name === addresses[addressIndex]?.tinh
    );
    if (selectedTinh) {
      const selectedHuyen = selectedTinh.data2.find(
        (huyen) => huyen.name === huyenName
      );
      if (selectedHuyen) {
        setAddressLists((prev) => ({
          ...prev,
          [addressIndex]: {
            ...prev[addressIndex],
            wards: selectedHuyen.data3 || [],
          },
        }));

        // Cập nhật dữ liệu địa chỉ
        const newAddresses = [...addresses];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          huyen: huyenName,
          xa: null,
        };
        setAddresses(newAddresses);

        // Xóa giá trị xã/phường
        form.setFieldsValue({
          [`addresses[${addressIndex}].xa`]: undefined,
        });
      }
    }
  };

  // Khi chọn xã/phường
  const handleXaChange = (xaId) => {
    setSelectedXa(xaId);
    console.log("tỉnh", selectedTinh);
    console.log("huyện", selectedHuyen);
    console.log("xã", selectedXa);
  };

  useEffect(() => {
    console.log("danh sách huyện:", quanHuyenList);
  }, [quanHuyenList]);

  const handleAddAddress = () => {
    const newAddress = {
      maKhachHang: selectedKhachHang,
      tinh: null,
      huyen: null,
      xa: null,
    };
    setAddresses(newAddress);
  };

  const handleRemoveAddress = (index) => {
    setAddresses((prev) => prev.filter((_, idx) => idx !== index));
    form.setFieldsValue({
      [`addresses[${index}].tinh`]: undefined,
      [`addresses[${index}].huyen`]: undefined,
      [`addresses[${index}].xa`]: undefined,
    });
  };

  const handleSubmit = async (values) => {
    // Validate addresses
    const validAddresses = addresses.filter(
      (address) => address.tinh && address.huyen && address.xa
    );

    if (validAddresses.length === 0) {
      toast.error("Vui lòng nhập ít nhất một địa chỉ đầy đủ!");
      return;
    }

    // Prepare update data
    const updatedData = {
      tenKhachHang: values.tenKhachHang,
      email: values.email,
      soDienThoai: values.soDienThoai,
      ngaySinh: dayjs(values.ngaySinh).format("YYYY-MM-DD"),
      gioiTinh: values.gioiTinh,
      diaChi: validAddresses.map((address) => ({
        maKhachHang: values.maKhachHang,
        tinh: address.tinh,
        huyen: address.huyen,
        xa: address.xa,
      })),
    };

    // Send update request
    try {
      const response = await getPutApi(selectedKhachHang.id, updatedData);
      if (response && response.data) {
        toast.success("Khách hàng mới đã được tạo!");
        console.log("Khách hàng mới:", response.data);
        getAllKhachHang();
        handleClose();
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo hhách hàng!");
      console.error("ERROR", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ gender: "male", dob: dayjs("1990-01-01") }}
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      {/* Thông tin khách hàng */}
      <Form.Item label="Tên khách hàng" name="tenKhachHang">
        <Input placeholder="" />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input placeholder="" />
      </Form.Item>
      <Form.Item label="Số điện thoại" name="soDienThoai">
        <Input placeholder="" />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="ngaySinh">
        <DatePicker format="DD-MM-YYYY" />
      </Form.Item>
      <Form.Item label="Giới tính" name="gioiTinh">
        <Radio.Group>
          <Radio value="true">Nam</Radio>
          <Radio value="false">Nữ</Radio>
        </Radio.Group>
      </Form.Item>
      Danh sách địa chỉ
      <h3>Danh sách địa chỉ</h3>
      {addresses.map((address, index) => (
        <div key={index} style={{ marginBottom: "20px", position: "relative" }}>
          <h4>Địa chỉ {index + 1}</h4>
          <Col md={12} xs={24}>
            <Form.Item
              label="Tỉnh/Thành phố"
              name={`addresses[${index}].tinh`}
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                value={address.tinh}
                onChange={(value) => handleTinhChange(value, index)}
                placeholder="Chọn tỉnh/thành phố"
              >
                {tinhThanhList.map((tinh) => (
                  <Option key={tinh.id} value={tinh.name}>
                    {tinh.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quận/Huyện"
              name={`addresses[${index}].huyen`}
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                value={address.huyen}
                onChange={(value) => handleHuyenChange(value, index)}
                placeholder="Chọn quận/huyện"
                disabled={!address.tinh}
              >
                {addressLists[index]?.districts.map((huyen) => (
                  <Option key={huyen.id} value={huyen.name}>
                    {huyen.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Xã/Phường"
              name={`addresses[${index}].xa`}
              rules={[{ required: true, message: "Vui lòng chọn xã/phường" }]}
            >
              <Select
                value={address.xa}
                onChange={(value) => {
                  const newAddresses = [...addresses];
                  newAddresses[index] = {
                    ...newAddresses[index],
                    xa: value,
                  };
                  setAddresses(newAddresses);
                }}
                placeholder="Chọn xã/phường"
                disabled={!address.huyen}
              >
                {addressLists[index]?.wards.map((xa) => (
                  <Option key={xa.id} value={xa.name}>
                    {xa.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {addresses.length > 1 && (
            <Button
              type="link"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemoveAddress(index)}
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              Xóa địa chỉ
            </Button>
          )}
        </div>
      ))}
      <Button
        type="dashed"
        onClick={handleAddAddress}
        block
        icon={<PlusOutlined />}
        style={{ marginBottom: "20px" }}
      >
        Thêm địa chỉ mới
      </Button>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Cập nhật khách hàng
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DetailForm;
