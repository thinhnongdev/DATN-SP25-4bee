import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Radio, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDiaChiByIdKhachHang, getKhachHangById, getPutApi } from './KhachHangApi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { data } from 'react-router-dom';

const { Option } = Select;

const DetailForm = ({ selectedKhachHang, getAllKhachHang, handleClose }) => {
  const [form] = Form.useForm();
  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedXa, setSelectedXa] = useState(null);
  const [khachHang, setKhachHang] = useState(null);
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';

  // Add new state for addresses
  const [addresses, setAddresses] = useState([]);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setFormKey((prev) => prev + 1);
  }, [addresses]);
  
  useEffect(() => {
    if (selectedKhachHang) {
      // Lấy thông tin khách hàng
      getKhachHangById(selectedKhachHang)
        .then((response) => {
          setKhachHang(response.data);
          console.log('khach hang tra ve', response.data);
          form.setFieldsValue({
            maKhachHang: response.data.maKhachHang || '',
            tenKhachHang: response.data.tenKhachHang || '',
            email: response.data.email || '',
            soDienThoai: response.data.soDienThoai || '',
            ngaySinh: response.data.ngaySinh ? dayjs(response.data.ngaySinh) : null,
            gioiTinh: response.data.gioiTinh ? 'true' : 'false',
          });
        })
        .catch((error) => {
          console.error('Lỗi khi lấy thông tin khách hàng:', error);
          toast.error('Lỗi khi lấy thông tin khách hàng!');
        });

      // Lấy thông tin địa chỉ
      // getDiaChiByIdKhachHang(selectedKhachHang)
      //   .then((response) => {
      //     if (response.data && Array.isArray(response.data)) {
      //       console.log('dia chi tra ve', response.data);

      //       // Thêm danh sách huyện và xã vào từng địa chỉ
      //       const updatedAddresses = response.data.map((address) => ({
      //         ...address,
      //         quanHuyenList: [], // Danh sách quận/huyện
      //         xaPhuongList: [], // Danh sách xã/phường
      //       }));

      //       setAddresses(updatedAddresses);
      //       form.setFieldsValue({ addresses: updatedAddresses });

      //       // Tải danh sách quận/huyện và xã cho từng địa chỉ
      //       updatedAddresses.forEach((address, index) => {
      //         if (address.tinh) handleProvinceChange(address.tinh, index, true);
      //         if (address.huyen) handleDistrictChange(address.huyen, index, true);
      //       });
      //     }
      //   })
      //   .catch((error) => {
      //     console.error('Lỗi khi lấy thông tin địa chỉ:', error);
      //     toast.error('Lỗi khi lấy thông tin địa chỉ!');
      //   });
      getDiaChiByIdKhachHang(selectedKhachHang)
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          console.log("📌 Địa chỉ trả về từ API:", response.data);
    
          // Đảm bảo dữ liệu không bị mất
          const updatedAddresses = response.data.map((address) => ({
            ...address,
            tinh: address.tinh || "", // Nếu undefined thì thành rỗng
            huyen: address.huyen || "",
            xa: address.xa || "",
          }));
    
          setAddresses(updatedAddresses);
          console.log("🔄 Danh sách địa chỉ sau khi cập nhật state:", updatedAddresses);
    
          // Đợi state cập nhật xong mới set vào form
          setTimeout(() => {
            form.setFieldsValue({ addresses: updatedAddresses });
            console.log("📋 Giá trị form sau khi setFieldsValue:", form.getFieldsValue());
          }, 100);
        }
      })
      .catch((error) => console.error("❌ Lỗi khi lấy địa chỉ:", error));
    }
  }, [selectedKhachHang]);         
  useEffect(() => {
    if (addresses.length > 0) {
      console.log("🔄 Cập nhật form với addresses:", addresses);
      
      form.setFieldsValue({ addresses });
  
      console.log("📋 Giá trị form sau khi setFieldsValue:", form.getFieldsValue());
    }
  }, [addresses]); // Chạy lại khi addresses thay đổi
  useEffect(() => {
    if (addresses.length > 0) {
      console.log("🔍 Kiểm tra addresses trước khi set:", JSON.stringify(addresses, null, 2));
  
      // Định dạng lại addresses nếu cần
      const formattedAddresses = addresses.map(addr => ({
        tinh: addr.tinh || "",
        huyen: addr.huyen || "",
        xa: addr.xa || "",
        moTa: addr.moTa || "",
      }));
  
      console.log("✅ addresses sau khi format:", formattedAddresses);
  
      form.setFieldsValue({ addresses: formattedAddresses });
  
      console.log("📋 Giá trị form sau khi setFieldsValue:", form.getFieldsValue());
    }
  }, [addresses]);
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      console.log("🔍 Trước khi setFieldsValue - addresses:", addresses);
  
      const formattedAddresses = addresses.map(addr => ({
        tinh: addr.tinh || "",
        huyen: addr.huyen || "",
        xa: addr.xa || "",
        moTa: addr.moTa || "",
      }));
  
      console.log("✅ addresses sau khi format:", formattedAddresses);
  
      // Kiểm tra form có addresses chưa
      const currentValues = form.getFieldsValue();
      if (!currentValues.addresses) {
        form.setFieldsValue({ addresses: [] }); // Khởi tạo nếu chưa có
      }
  
      // Set dữ liệu vào form
      form.setFieldsValue({ addresses: formattedAddresses });
  
      console.log("📋 Giá trị form sau khi setFieldsValue:", form.getFieldsValue());
    }
  }, [addresses]);
      
  //   Xử lý thêm địa chỉ mới
  useEffect(() => {
    // Lấy danh sách tỉnh/thành phố
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => setTinhThanhList(res.data.data))
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, []);

  useEffect(() => {
    console.log('Danh sách tỉnh/thành đã cập nhật:', tinhThanhList);
  }, [tinhThanhList]);

  const handleProvinceChange = (provinceId, index, isInitialLoad = false) => {
    const provinceIdNumber = Number(provinceId); // Chuyển về kiểu số

    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: provinceIdNumber }, // Sử dụng kiểu số
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => {
        const newAddresses = [...addresses];
        newAddresses[index] = {
          ...newAddresses[index],
          tinh: provinceId,
          quanHuyenList: res.data.data, // Cập nhật danh sách huyện
          xaPhuongList: isInitialLoad ? newAddresses[index].xaPhuongList : [], // Reset xã nếu không phải lần đầu
        };
        setAddresses(newAddresses);
        form.setFieldsValue({
          [`addresses[${index}].tinh`]: provinceId,
          [`addresses[${index}].huyen`]: isInitialLoad ? newAddresses[index].huyen : null,
          [`addresses[${index}].xa`]: isInitialLoad ? newAddresses[index].xa : null,
        });

        if (!isInitialLoad) {
          form.setFieldsValue({
            [`addresses[${index}].huyen`]: null,
            [`addresses[${index}].xa`]: null,
          });
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy quận/huyện:', err);
        toast.error('Lỗi lấy quận/huyện!'); // Hiển thị thông báo lỗi
      });
  };

  const handleDistrictChange = (districtId, index) => {
    console.log("🟢 District ID gửi lên API:", districtId);
  
    if (!districtId) {
      console.error("❌ District ID không hợp lệ:", districtId);
      return;
    }
  
    axios
      .post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: Number(districtId) }, // Chuyển về kiểu số nếu cần
        {
          headers: {
            Token: API_TOKEN, // Đảm bảo API_TOKEN đúng
            "Content-Type": "application/json",
          },
        }
      )  
      .then((res) => {  
        console.log("✅ Dữ liệu trả về từ API:", res.data);
        const newAddresses = [...addresses];
        newAddresses[index].xaPhuongList = res.data.data;
        setAddresses(newAddresses);
      })
      .catch((err) => {
        console.error("❌ Lỗi lấy phường/xã:", err.response?.data || err);
      });
  };
  
  
  

  const handleWardChange = (value, index) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address, i) => (i === index ? { ...address, xa: value } : address)),
    );
  };

  useEffect(() => {
    if (typeof getAllKhachHang !== 'function') {
      console.error('getAllKhachHang prop is not a function:', getAllKhachHang);
    }
  }, [getAllKhachHang]);

  const handleAddAddress = () => {
    const newAddress = {
      maKhachHang: khachHang?.maKhachHang,
      tinh: null,
      huyen: null,
      xa: null,
      diaChiCuThe: null,
    };
    setAddresses((prev) => [...prev, newAddress]);
  };

  const handleRemoveAddress = (index) => {
    setAddresses((prev) => prev.filter((_, idx) => idx !== index));
    form.setFieldsValue({
      [`addresses[${index}].tinh`]: undefined,
      [`addresses[${index}].huyen`]: undefined,
      [`addresses[${index}].xa`]: undefined,
      [`addresses[${index}].diaChiCuThe`]: undefined,
    });
  };

  const handleSubmit = async (values) => {
    try {
      // Validate addresses
      const validAddresses = addresses.filter(
        (address) => address.tinh && address.huyen && address.xa,
      );

      if (validAddresses.length === 0) {
        toast.error('Vui lòng nhập ít nhất một địa chỉ đầy đủ!');
        return;
      }

      // Prepare update data
      const updatedData = {
        maKhachHang: values.maKhachHang,
        tenKhachHang: values.tenKhachHang,
        email: values.email,
        soDienThoai: values.soDienThoai,
        ngaySinh: dayjs(values.ngaySinh).format('YYYY-MM-DD'),
        gioiTinh: values.gioiTinh,
        trangThai: true,
        diaChi: validAddresses.map((address) => ({
          maKhachHang: values.maKhachHang,
          tinh: address.tinh,
          huyen: address.huyen,
          xa: address.xa,
          diaChiCuThe: address.diaChiCuThe,
        })),
      };
      console.log('du lieu thay doi', updatedData);
      // Send update request with correct ID
      const response = await getPutApi(selectedKhachHang, updatedData);

      if (response && response.status === 200) {
        toast.success('Cập nhật khách hàng thành công!');
        if (typeof getAllKhachHang === 'function') {
          await getAllKhachHang();
        }
        handleClose();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi cập nhật khách hàng!');
    }
  };

  return (
    <Form key={formKey}
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        gioiTinh: 'true',
        ngaySinh: dayjs(),
      }}
      style={{
        background: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <Form.Item name="maKhachHang" label="Mã khách hàng">
        <Input
          style={{
            pointerEvents: 'none', // Ngăn chặn sự kiện click và nhập dữ liệu
            opacity: 0.5, // Làm mờ input để hiển thị trạng thái vô hiệu hóa
            backgroundColor: '#f5f5f5', // Màu nền giống như input bị disable
          }}
        />
      </Form.Item>
      <Form.Item name="tenKhachHang" label="Tên khách hàng">
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input />
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
        <div key={index} style={{ marginBottom: '20px', position: 'relative' }}>
          {/* Select tỉnh/thành phố */}
          {/* Tỉnh/Thành phố */}
          <Form.Item name={`addresses[${index}].tinh`} label="Tỉnh/Thành phố">
            <Select
              placeholder="Chọn tỉnh/thành phố"
              style={{ width: '100%' }}
              value={address.tinh ? address.tinh.toString() : undefined} // Đảm bảo giá trị khớp với Option
              onChange={(value) => handleProvinceChange(value, index)}
            >
              {tinhThanhList.map((item) => (
                <Option key={item.ProvinceID} value={item.ProvinceID.toString()}>
                  {item.ProvinceName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Quận/Huyện */}
          <Form.Item name={`addresses[${index}].huyen`} label="Quận/Huyện">
            <Select
              placeholder="Chọn quận/huyện"
              style={{ width: '100%' }}
              disabled={!address.tinh}
              value={address.huyen ? address.huyen.toString() : undefined}
              onChange={(value) => handleDistrictChange(value, index)}
            >
              {addresses[index]?.quanHuyenList?.map((item) => (
                <Option key={item.DistrictID} value={item.DistrictID.toString()}>
                  {item.DistrictName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Phường/Xã */}
          <Form.Item name={`addresses[${index}].xa`} label="Phường/Xã">
            <Select
              placeholder="Chọn phường/xã"
              style={{ width: '100%' }}
              disabled={!address.huyen}
              value={address.xa ? address.xa.toString() : undefined}
              onChange={(value) => handleWardChange(value, index)}
            >
              {addresses[index]?.xaPhuongList?.map((item) => (
                <Option key={item.WardCode} value={item.WardCode.toString()}>
                  {item.WardName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
          >
            <Input
              placeholder="Nhập địa chỉ cụ thể"
              value={address.diaChiCuThe} // Lấy đúng giá trị từ từng địa chỉ
              onChange={(e) => {
                const newAddresses = [...addresses];
                newAddresses[index].diaChiCuThe = e.target.value;
                setAddresses(newAddresses); // Cập nhật lại state
              }}
            />
          </Form.Item>

          {/* Nút Xóa địa chỉ */}
          {addresses.length > 1 && (
            <Button
              type="link"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemoveAddress(index)}
              style={{ position: 'absolute', right: 0, top: 0 }}
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
        style={{ marginBottom: '20px' }}
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
