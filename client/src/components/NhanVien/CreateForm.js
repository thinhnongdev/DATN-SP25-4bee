import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Radio,
  Input,
  Form,
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  Divider,
  Modal,
  message,
} from 'antd';
import { getPostApi, scanQRCode } from './NhanVienApi';
import axios from 'axios';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

function CreateForm({ handleClose, getAllNhanVien }) {
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [quanHuyenList, setQuanHuyenList] = useState([]);
  const [xaPhuongList, setXaPhuongList] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);
  const API_TOKEN = '4f7fc40f-023f-11f0-aff4-822fc4284d92';

  const [formData, setFormData] = useState({
    tenNhanVien: '',
    email: '',
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: '',
    trangThai: true,
    anh: '',
    canCuocCongDan: '',
    tinh: '',
    huyen: '',
    xa: '',
    diaChiCuThe: '',
  });

  useEffect(() => {
    // Lấy danh sách tỉnh/thành phố
    axios
      .get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
        headers: { Token: API_TOKEN, 'Content-Type': 'application/json' },
      })
      .then((res) => setTinhThanhList(res.data.data))
      .catch((err) => console.error('Lỗi lấy tỉnh thành:', err));
  }, []);

  const handleProvinceChange = (value) => {
    setSelectedTinh(value);
    setFormData({
      ...formData,
      tinh: value,
      huyen: null,
      xa: null,
      diaChiCuThe: null,
    });
    // Lấy danh sách quận/huyện
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
        { province_id: value },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setQuanHuyenList(res.data.data))
      .catch((err) => console.error('Lỗi lấy quận huyện:', err));
  };

  const handleDistrictChange = (value) => {
    setSelectedHuyen(value);
    setFormData({ ...formData, huyen: value, xa: null });
    // Lấy danh sách phường/xã
    axios
      .post(
        'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id',
        { district_id: value },
        { headers: { Token: API_TOKEN } },
      )
      .then((res) => setXaPhuongList(res.data.data))
      .catch((err) => console.error('Lỗi lấy phường xã:', err));
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const nhanVien = await scanQRCode(data.text);
        setFormData({
          tenNhanVien: nhanVien.tenNhanVien,
          email: nhanVien.email,
          soDienThoai: nhanVien.soDienThoai,
          ngaySinh: nhanVien.ngaySinh,
          gioiTinh: nhanVien.gioiTinh ? 'Nam' : 'Nữ',
          trangThai: nhanVien.trangThai,
          anh: nhanVien.anh || '',
        });
        toast.success('Đã tìm thấy nhân viên từ mã QR!');
        setIsModalVisible(false);
      } catch (error) {
        toast.error('Không tìm thấy nhân viên từ QR!');
      }
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/nhan_vien/check-email?email=${email}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      return response.data.exists;
    } catch (error) {
      console.error('Lỗi kiểm tra email:', error);
      return false;
    }
  };

  const handleUploadImage = async (files) => {
    console.log('đường dẫn ảnh:', files);
    if (!files || files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh!');
      return;
    }

    try {
      toast.info('Đang tải ảnh lên...');

      // Upload từng file lên Cloudinary
      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default'); // Thay thế bằng upload preset của bạn

          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dhh5mdeqo/image/upload', // Thay thế bằng cloud_name của bạn
            formData,
          );
          console.log('dường dan anh:', response.data.secure_url);
          return response.data.secure_url; // Lấy URL sau khi upload thành công
        }),
      );

      const uploadedUrls = uploadedImages.filter(String);
      if (uploadedUrls.length === 0) {
        throw new Error('Không có ảnh nào được tải lên.');
      }

      setFormData((prev) => ({ ...prev, anh: uploadedUrls[0] }));

      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Không thể tải ảnh lên, vui lòng thử lại.');
    }
  };

  // Theo dõi khi formData thay đổi
  useEffect(() => {
    console.log('formData đã cập nhật:', formData);
  }, [formData]);

  //Submit
  const handleSubmit = async () => {
    if (!formData.anh) {
      toast.error('Vui lòng tải lên ảnh nhân viên!');
      return;
    }
  
    Modal.confirm({
      title: 'Xác nhận tạo nhân viên mới?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn tạo nhân viên này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        const newNhanVien = {
          tenNhanVien: formData.tenNhanVien,
          email: formData.email,
          soDienThoai: formData.soDienThoai,
          ngaySinh: formData.ngaySinh,
          gioiTinh: formData.gioiTinh === 'Nam',
          trangThai: formData.trangThai,
          anh: String(formData.anh),
          canCuocCongDan: formData.canCuocCongDan,
          tinh: formData.tinh,
          huyen: formData.huyen,
          xa: formData.xa,
          diaChiCuThe: formData.diaChiCuThe,
        };
  
        // Hiển thị loading trong nút (nếu dùng state bên ngoài)
        setLoading(true);
  
        try {
          const response = await getPostApi(newNhanVien);
          if (response && response.data) {
            toast.success('Nhân viên mới đã được tạo!');
            getAllNhanVien();
            handleClose();
          }
        } catch (error) {
          toast.error('Có lỗi khi tạo nhân viên!');
          console.error('ERROR', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };
  return (
    <Card className="create-form-container">
      <Form form={form} layout="vertical" >
        <Row gutter={24}>
          <Col span={8}>
            <h5>Thông tin nhân viên</h5>
            <Divider />

            <div className="left-section">
              <div
                className="avatar-section"
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  border: '2px dashed #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginLeft: 100,
                  marginBottom: 55,
                }}
              >
                {formData.anh ? (
                  <img
                    src={formData.anh}
                    alt="Ảnh nhân viên"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#999',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span>Chọn ảnh</span>
                    <span style={{ fontSize: '20px', cursor: 'pointer' }}></span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleUploadImage(e.target.files)}
                />
              </div>

              <Form.Item
                name="tenNhanVien"
                label="Tên nhân viên"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhân viên!' },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: 'Tên không được chứa số hoặc ký tự đặc biệt!',
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tên nhân viên"
                  value={formData.tenNhanVien}
                  onChange={(e) => setFormData({ ...formData, tenNhanVien: e.target.value })}
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={16}>
            <div className="right-section">
              {/* <Button
                title="Quét mã QR"
                block
                onClick={showModal}
                style={{
                  marginBottom: "16px",
                  width: "80px",
                  marginLeft: "700px",
                  position: "absolute",
                }}
              >
                Quét QR
              </Button>

              <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
              >
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                />
              </Modal> */}
              <h5>Thông tin chi tiết</h5>
              <Divider />

              <Form.Item
                name="canCuocCongDan"
                label="Số CCCD"
                rules={[
                  { required: true, message: 'Vui lòng nhập số CCCD!' },
                  {
                    pattern: /^[0-9]{12}$/,
                    message: 'Số CCCD phải gồm 12 chữ số và không chứa kí tự đặc biệt!',
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số CCCD"
                  onChange={(e) => setFormData({ ...formData, canCuocCongDan: e.target.value })}
                  value={formData.canCuocCongDan}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gioiTinh"
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                  >
                    <Radio.Group
                      value={formData.gioiTinh}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                      style={{ display: 'flex', justifyContent: 'flex-start' }}
                    >
                      <Radio value={true}>Nam</Radio>
                      <Radio value={false}>Nữ</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ngaySinh"
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày sinh!' },
                      // {
                      //   validator: (_, value) => {
                      //     if (!value) return Promise.resolve();

                      //     // Tính toán tuổi chính xác
                      //     const today = moment();
                      //     const age = today.diff(value, "years");

                      //     // Kiểm tra tuổi phải từ 18 đến 60
                      //     if (age < 18) {
                      //       return Promise.reject(
                      //         "Nhân viên phải từ 18 tuổi trở lên!"
                      //       );
                      //     }
                      //     if (age > 60) {
                      //       return Promise.reject(
                      //         "Nhân viên phải dưới 60 tuổi!"
                      //       );
                      //     }

                      //     // Kiểm tra nếu tuổi chưa đủ 18 hoặc lớn hơn 60 khi chưa qua ngày sinh trong năm nay
                      //     const nextBirthday = moment(value).add(age, "years");
                      //     if (today.isBefore(nextBirthday)) {
                      //       return Promise.reject(
                      //         "Nhân viên phải từ 18 tuổi trở lên!"
                      //       );
                      //     }

                      //     return Promise.resolve();
                      //   },
                      // },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="YYYY-MM-DD"
                      value={formData.ngaySinh ? moment(formData.ngaySinh) : null}
                      onChange={(date, dateString) =>
                        setFormData({ ...formData, ngaySinh: dateString })
                      }
                      disabledDate={(current) => current && current > moment().endOf('day')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve(); // Không check nếu không có giá trị

                      const exists = await checkEmailExists(value);
                      if (exists) {
                        return Promise.reject('Email đã tồn tại trong hệ thống!');
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Nhập email"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  value={formData.email}
                />
              </Form.Item>

              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  {
                    pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                    message: 'Số điện thoại không hợp lệ!',
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  value={formData.soDienThoai}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tỉnh/Thành phố"
                    name="tinh"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng chọn tỉnh/thành phố',
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn tỉnh/thành phố"
                      style={{ width: '100%' }}
                      onChange={handleProvinceChange}
                      value={formData.tinh}
                    >
                      {tinhThanhList.map((item) => (
                        <Option key={item.ProvinceID} value={item.ProvinceID}>
                          {item.ProvinceName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Quận/Huyện"
                    name="huyen"
                    rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                  >
                    <Select
                      placeholder="Chọn quận/huyện"
                      style={{ width: '100%' }}
                      onChange={handleDistrictChange}
                      value={formData.huyen}
                    >
                      {quanHuyenList.map((item) => (
                        <Option key={item.DistrictID} value={item.DistrictID}>
                          {item.DistrictName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Phường/Xã"
                    name="xa"
                    rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                  >
                    <Select
                      placeholder="Chọn phường/xã"
                      style={{ width: '100%' }}
                      onChange={(value) => setFormData({ ...formData, xa: value })}
                      value={formData.xa}
                    >
                      {xaPhuongList.map((item) => (
                        <Option key={item.WardCode} value={item.WardCode}>
                          {item.WardName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ cụ thể"
                    name="diaChiCuThe"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập địa chỉ cụ thể',
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập địa chỉ cụ thể"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diaChiCuThe: e.target.value,
                        })
                      }
                      value={formData.diaChiCuThe}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
                <Button
                  type="default"
                  onClick={handleClose} // Hàm xử lý đóng form hoặc trở về danh sách
                  style={{ marginRight: '10px' }}
                >
                  Trở về
                </Button>
               <Button type="primary" onClick={handleSubmit} loading={loading}>
  Tạo nhân viên
</Button>

              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default CreateForm;
