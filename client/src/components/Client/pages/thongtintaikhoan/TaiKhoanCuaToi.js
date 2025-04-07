import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Radio, Layout, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDiaChiByIdKhachHang, getKhachHangById, getPutApi } from './KhachHangApi';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from './SidebarProfile';

const { Option } = Select;

const DetailForm = () => {
  const [form] = Form.useForm();
  const [khachHang, setKhachHang] = useState(null);
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';
  const token = localStorage.getItem('token');
  // Fetch provinces
  useEffect(() => {
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => setTinhThanhList(res.data.data))
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, []);
  // Hàm fetch thông tin người dùng
  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/getInfoUser',
        JSON.stringify({ token: token }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      return null;
    }
  };
  // Fetch customer data and addresses
  useEffect(() => {
    const fetchData = async () => {
      if (!token || tinhThanhList.length === 0) return;

      try {
        const userInfo = await fetchUserInfo(token);
        const selectedKhachHang = userInfo.id;

        const khachHangResponse = await getKhachHangById(selectedKhachHang);
        const khachHang = khachHangResponse.data;
        setKhachHang(khachHang);
        console.log('Khách hàng:', khachHang);
        form.setFieldsValue({
          maKhachHang: khachHang.maKhachHang || '',
          tenKhachHang: khachHang.tenKhachHang || '',
          email: khachHang.email || '',
          soDienThoai: khachHang.soDienThoai || '',
          ngaySinh: khachHang.ngaySinh ? dayjs(khachHang.ngaySinh) : null,
          gioiTinh: khachHang.gioiTinh ? 'true' : 'false',
        });

        const diaChiResponse = await getDiaChiByIdKhachHang(selectedKhachHang);
        if (Array.isArray(diaChiResponse.data)) {
          const formattedAddresses = await Promise.all(
            diaChiResponse.data.map(async (address) => {
              const quanHuyenList = address.tinh ? await fetchDistricts(address.tinh) : [];
              const xaPhuongList = address.huyen ? await fetchWards(address.huyen) : [];

              return {
                tinh: address.tinh || '',
                tinhName:
                  tinhThanhList.find((t) => t.ProvinceID.toString() === address.tinh)
                    ?.ProvinceName || '',
                huyen: address.huyen || '',
                huyenName:
                  quanHuyenList.find((h) => h.DistrictID.toString() === address.huyen)
                    ?.DistrictName || '',
                xa: address.xa || '',
                xaName:
                  xaPhuongList.find((x) => x.WardCode.toString() === address.xa)?.WardName || '',
                diaChiCuThe: address.diaChiCuThe || '',
                quanHuyenList,
                xaPhuongList,
              };
            }),
          );
          setAddresses(formattedAddresses);
          form.setFieldsValue({ addresses: formattedAddresses });
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu:', error);
        toast.error('Lỗi khi lấy dữ liệu khách hàng hoặc địa chỉ!');
      }
    };

    fetchData();
  }, [form, tinhThanhList, token]);

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await axios.post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: Number(provinceId) },
        { headers: { Token: API_TOKEN } },
      );
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách quận/huyện:', error);
      return [];
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await axios.post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward',
        { district_id: Number(districtId) },
        { headers: { Token: API_TOKEN } },
      );
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách xã/phường:', error);
      return [];
    }
  };

  const handleProvinceChange = async (value, index) => {
    const districts = await fetchDistricts(value);
    const provinceName =
      tinhThanhList.find((t) => t.ProvinceID.toString() === value)?.ProvinceName || '';
    const newAddresses = [...addresses];
    newAddresses[index] = {
      ...newAddresses[index],
      tinh: value,
      tinhName: provinceName,
      huyen: null,
      huyenName: '',
      xa: null,
      xaName: '',
      quanHuyenList: districts,
      xaPhuongList: [],
    };
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses });
  };

  const handleDistrictChange = async (value, index) => {
    const wards = await fetchWards(value);
    const newAddresses = [...addresses];
    const districtName =
      newAddresses[index].quanHuyenList.find((h) => h.DistrictID.toString() === value)
        ?.DistrictName || '';

    newAddresses[index] = {
      ...newAddresses[index],
      huyen: value, // DistrictID
      huyenName: districtName, // Human-readable name
      xa: null,
      xaName: '',
      xaPhuongList: wards,
    };
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses }); // Sync with form
  };

  const handleWardChange = (value, index) => {
    const newAddresses = [...addresses];
    const wardName =
      newAddresses[index].xaPhuongList.find((x) => x.WardCode.toString() === value)?.WardName || '';

    newAddresses[index] = {
      ...newAddresses[index],
      xa: value,
      xaName: wardName,
    };
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses });
  };

  const handleAddAddress = () => {
    const newAddress = {
      tinh: null,
      tinhName: '',
      huyen: null,
      huyenName: '',
      xa: null,
      xaName: '',
      diaChiCuThe: null,
      quanHuyenList: [],
      xaPhuongList: [],
    };
    setAddresses((prev) => [...prev, newAddress]);
  };

  const handleSubmit = async (values) => {
    try {
      const validAddresses = values.addresses.filter(
        (address) => address.tinh && address.huyen && address.xa,
      );

      if (validAddresses.length === 0) {
        toast.error('Vui lòng nhập ít nhất một địa chỉ đầy đủ!');
        return;
      }

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
      const userInfo = await fetchUserInfo(token);
      const idKhachHang = userInfo.id;
      const response = await getPutApi(idKhachHang, updatedData);
      if (response && response.status === 200) {
        message.success('Cập nhật thông tin khách hàng thành công!');
        // if (typeof getAllKhachHang === 'function') {
        //   await getAllKhachHang();
        // }
        // handleClose();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi cập nhật khách hàng!');
    }
  };
  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses });
  };
  console.log('address sau khi thay đổi:', addresses);
  return (
    <Layout style={{ width:'80%', background: '#f0f2f5',justifyContent: 'center', margin: '0 auto' }}>
      <Sidebar /> {/* Use Sidebar component here */}
      <Form
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
          width: '80%',
        }}
      >
        {/* Customer Info Fields */}
        <Form.Item name="maKhachHang" label="Mã khách hàng">
          <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
        </Form.Item>
        <Form.Item name="tenKhachHang" label="Tên khách hàng">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
        <Form.Item name="soDienThoai" label="Số điện thoại">
          <Input />
        </Form.Item>
        <Form.Item name="ngaySinh" label="Ngày sinh">
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
        <Form.Item name="gioiTinh" label="Giới tính">
          <Radio.Group>
            <Radio value="true">Nam</Radio>
            <Radio value="false">Nữ</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Address List */}
        <h3>Danh sách địa chỉ</h3>
        <Form.List name="addresses">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key} style={{ marginBottom: 20, position: 'relative' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'tinh']}
                    label="Tỉnh/Thành phố"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                  >
                    <Select
                      placeholder="Chọn tỉnh/thành phố"
                      onChange={(value) => handleProvinceChange(value, index)}
                      value={addresses[index]?.tinh}
                    >
                      {tinhThanhList.map((item) => (
                        <Option key={item.ProvinceID} value={item.ProvinceID.toString()}>
                          {item.ProvinceName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'huyen']}
                    label="Quận/Huyện"
                    rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                  >
                    <Select
                      placeholder="Chọn quận/huyện"
                      disabled={!addresses[index]?.tinh}
                      onChange={(value) => handleDistrictChange(value, index)}
                      value={addresses[index]?.huyen} // DistrictID as the value
                    >
                      {addresses[index]?.quanHuyenList?.map((item) => (
                        <Option key={item.DistrictID} value={item.DistrictID.toString()}>
                          {item.DistrictName} {/* Display name */}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'xa']}
                    label="Phường/Xã"
                    rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                  >
                    <Select
                      placeholder="Chọn phường/xã"
                      disabled={!addresses[index]?.huyen}
                      onChange={(value) => handleWardChange(value, index)}
                      value={addresses[index]?.xa}
                    >
                      {addresses[index]?.xaPhuongList?.map((item) => (
                        <Option key={item.WardCode} value={item.WardCode.toString()}>
                          {item.WardName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item {...restField} name={[name, 'diaChiCuThe']} label="Địa chỉ cụ thể">
                    <Input
                      placeholder="Nhập địa chỉ cụ thể"
                      value={addresses[index]?.diaChiCuThe || ''}
                      onChange={(e) => handleInputChange(e, index, 'diaChiCuThe')}
                    />
                  </Form.Item>

                  {fields.length > 1 && (
                    <Button
                      type="link"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => {
                        remove(name);
                        setAddresses((prev) => prev.filter((_, i) => i !== index));
                      }}
                      style={{ position: 'absolute', right: 0, top: 0 }}
                    >
                      Xóa địa chỉ
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => {
                  add();
                  handleAddAddress();
                }}
                block
                icon={<PlusOutlined />}
                style={{ marginBottom: 20 }}
              >
                Thêm địa chỉ mới
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Cập nhật khách hàng
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default DetailForm;
