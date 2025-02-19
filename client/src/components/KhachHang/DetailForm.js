import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Space,
  Col,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getDiaChiByIdKhachHang, getKhachHangById, getPutApi } from "./KhachHangApi";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const DetailForm = ({ selectedKhachHang, getAllKhachHang, handleClose }) => {
  const [form] = Form.useForm();
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);

  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);
  const [errors, setErrors] = useState({});
  const [khachHang, setKhachHang] = useState(null);

  // Add new state for addresses
  const [addresses, setAddresses] = useState([]);

  // Add state to store district and ward lists for each address
  const [addressLists, setAddressLists] = useState({});

  useEffect(() => {
    if (typeof getAllKhachHang !== 'function') {
      console.error('getAllKhachHang prop is not a function:', getAllKhachHang);
    }
  }, [getAllKhachHang]);

  useEffect(() => {
    if (selectedKhachHang) {
      // First get basic customer info
      getKhachHangById(selectedKhachHang)
        .then((response) => {
          setKhachHang(response.data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin khách hàng:", error);
          toast.error("Lỗi khi lấy thông tin khách hàng!");
        });

      // Then get address info
      getDiaChiByIdKhachHang(selectedKhachHang)
        .then(async (response) => {
          if (response.data && Array.isArray(response.data)) {
            setAddresses(response.data);
            
            try {
              // Load province data
              const provinceResponse = await axios.get("http://localhost:5000/data");
              const provinces = provinceResponse.data || [];
              setTinhThanhList(provinces);

              // Initialize lists for each address
              const lists = {};
              
              // Load district and ward data for each address
              response.data.forEach((address, index) => {
                if (address.tinh) {
                  const selectedTinh = provinces.find(p => p.name === address.tinh);
                  if (selectedTinh) {
                    lists[index] = {
                      districts: selectedTinh.data2 || [],
                      wards: []
                    };

                    if (address.huyen) {
                      const selectedHuyen = selectedTinh.data2.find(d => d.name === address.huyen);
                      if (selectedHuyen) {
                        lists[index].wards = selectedHuyen.data3 || [];
                      }
                    }
                  }
                }

                // Set form values for this address
                form.setFieldsValue({
                  [`addresses[${index}].tinh`]: address.tinh,
                  [`addresses[${index}].huyen`]: address.huyen,
                  [`addresses[${index}].xa`]: address.xa,
                });
              });

              setAddressLists(lists);
            } catch (error) {
              console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
              toast.error("Lỗi khi tải dữ liệu địa chỉ!");
            }
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy thông tin địa chỉ:", error);
          toast.error("Lỗi khi lấy thông tin địa chỉ!");
        });
    }
  }, [selectedKhachHang]);

  useEffect(() => {
    if (khachHang) {
      // Set basic customer information
      form.setFieldsValue({
        maKhachHang: khachHang.maKhachHang || "",
        tenKhachHang: khachHang.tenKhachHang || "",
        email: khachHang.email || "",
        soDienThoai: khachHang.soDienThoai || "",
        ngaySinh: khachHang.ngaySinh ? dayjs(khachHang.ngaySinh) : null,
        gioiTinh: khachHang.gioiTinh ? "true" : "false",
      });
    }
  }, [khachHang, form]);

  //   Xử lý thêm địa chỉ mới
  useEffect(() => {
    const fetchTinhThanh = async () => {
      try {
        const response = await axios.get("http://localhost:5000/data");
        console.log("Dữ liệu API nhận được:", response.data); // Kiểm tra dữ liệu

        // Kiểm tra response.data có phải là mảng không
        setTinhThanhList(Array.isArray(response.data) ? response.data : []);
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

  const handleTinhChange = async (tinhName, addressIndex) => {
    try {
      const response = await axios.get("http://localhost:5000/data");
      const selectedTinh = response.data.find((tinh) => tinh.name === tinhName);
      
      if (selectedTinh) {
        // Update lists for this address
        setAddressLists(prev => ({
          ...prev,
          [addressIndex]: {
            districts: selectedTinh.data2 || [],
            wards: []
          }
        }));
        
        // Update address data
        const newAddresses = [...addresses];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          tinh: tinhName,
          huyen: null,
          xa: null
        };
        setAddresses(newAddresses);

        // Clear dependent fields
        form.setFieldsValue({
          [`addresses[${addressIndex}].huyen`]: undefined,
          [`addresses[${addressIndex}].xa`]: undefined,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    }
  };

  const handleHuyenChange = async (huyenName, addressIndex) => {
    const selectedTinh = tinhThanhList.find(
      tinh => tinh.name === addresses[addressIndex].tinh
    );
    
    if (selectedTinh) {
      const selectedHuyen = selectedTinh.data2.find(
        huyen => huyen.name === huyenName
      );

      if (selectedHuyen) {
        // Update lists for this address
        setAddressLists(prev => ({
          ...prev,
          [addressIndex]: {
            ...prev[addressIndex],
            wards: selectedHuyen.data3 || []
          }
        }));

        // Update address data
        const newAddresses = [...addresses];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          huyen: huyenName,
          xa: null
        };
        setAddresses(newAddresses);

        // Clear dependent field
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
    setAddresses([...addresses, { tinh: null, huyen: null, xa: null }]);
  };

  const handleRemoveAddress = (index) => {
    const newAddresses = addresses.filter((_, idx) => idx !== index);
    setAddresses(newAddresses);
  };

  const handleSubmit = async (values) => {
    try {
      // Prepare the customer data
      const updateKhachHang = {
        maKhachHang: values.maKhachHang,
        tenKhachHang: values.tenKhachHang,
        email: values.email,
        soDienThoai: values.soDienThoai,
        ngaySinh: dayjs(values.ngaySinh).format('YYYY-MM-DD'),
        gioiTinh: values.gioiTinh === 'true',
        diaChi: addresses
          .filter(address => address.tinh && address.huyen && address.xa)
          .map(address => ({
            maKhachHang: values.maKhachHang,
            tinh: address.tinh,
            huyen: address.huyen,
            xa: address.xa
          }))
      };

      console.log('Data being sent:', updateKhachHang);

      // Send update request
      const response = await getPutApi(values.maKhachHang, updateKhachHang);

      if (response && response.status === 200) {
        toast.success("Cập nhật khách hàng thành công!");
        
        // Add safety check for getAllKhachHang
        if (typeof getAllKhachHang !== 'function') {
          console.error('getAllKhachHang is not a function:', getAllKhachHang);
          toast.error("Lỗi cập nhật danh sách!");
          return;
        }

        try {
          await getAllKhachHang();
          console.log("Successfully refreshed customer list");
        } catch (refreshError) {
          console.error("Error refreshing customer list:", refreshError);
          toast.error("Cập nhật thành công nhưng không thể làm mới danh sách!");
        }

        handleClose();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Có lỗi khi sửa khách hàng!");
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
      <Form.Item label="Mã khách hàng" name="maKhachHang">
        <Input placeholder="" />
      </Form.Item>
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
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
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
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
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
              rules={[{ required: true, message: 'Vui lòng chọn xã/phường' }]}
            >
              <Select
                value={address.xa}
                onChange={(value) => {
                  const newAddresses = [...addresses];
                  newAddresses[index] = {
                    ...newAddresses[index],
                    xa: value
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
