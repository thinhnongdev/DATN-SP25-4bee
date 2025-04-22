import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Row,
  Col,
  Divider,
  Card,
  Modal,
} from "antd";
import { DeleteOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getDiaChiByIdKhachHang,
  getKhachHangById,
  getPutApi,
} from "./KhachHangApi";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";

const { Option } = Select;

const DetailForm = ({ selectedKhachHang, getAllKhachHang, handleClose }) => {
  const [form] = Form.useForm();
  const [khachHang, setKhachHang] = useState(null);
  const [tinhThanhList, setTinhThanhList] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const API_TOKEN = "4f7fc40f-023f-11f0-aff4-822fc4284d92";

  // Fetch provinces
  useEffect(() => {
    axios
      .get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: { Token: API_TOKEN, "Content-Type": "application/json" },
        }
      )
      .then((res) => setTinhThanhList(res.data.data))
      .catch((err) => console.error("Lỗi lấy tỉnh thành:", err));
  }, []);

  // Fetch customer data and addresses
  useEffect(() => {
    if (selectedKhachHang && tinhThanhList.length > 0) {
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
          console.error("❌ Lỗi khi lấy thông tin khách hàng:", error);
          toast.error("Lỗi khi lấy thông tin khách hàng!");
        });

      getDiaChiByIdKhachHang(selectedKhachHang)
        .then(async (response) => {
          if (response.data && Array.isArray(response.data)) {
            const formattedAddresses = await Promise.all(
              response.data.map(async (address) => {
                const quanHuyenList = address.tinh
                  ? await fetchDistricts(address.tinh)
                  : [];
                const xaPhuongList = address.huyen
                  ? await fetchWards(address.huyen)
                  : [];

                return {
                  tinh: address.tinh || "",
                  tinhName:
                    tinhThanhList.find(
                      (t) => t.ProvinceID.toString() === address.tinh
                    )?.ProvinceName || "",
                  huyen: address.huyen || "",
                  huyenName:
                    quanHuyenList.find(
                      (h) => h.DistrictID.toString() === address.huyen
                    )?.DistrictName || "",
                  xa: address.xa || "",
                  xaName:
                    xaPhuongList.find(
                      (x) => x.WardCode.toString() === address.xa
                    )?.WardName || "",
                  diaChiCuThe: address.diaChiCuThe || "",
                  quanHuyenList,
                  xaPhuongList,
                };
              })
            );
            setAddresses(formattedAddresses);
            form.setFieldsValue({ addresses: formattedAddresses });
          }
        })
        .catch((error) => {
          console.error("❌ Lỗi khi lấy địa chỉ:", error);
          toast.error("Lỗi khi lấy địa chỉ!");
        });
    }
  }, [selectedKhachHang, form, tinhThanhList]);

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: Number(provinceId) },
        { headers: { Token: API_TOKEN } }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách quận/huyện:", error);
      return [];
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: Number(districtId) },
        { headers: { Token: API_TOKEN } }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách xã/phường:", error);
      return [];
    }
  };

  const handleProvinceChange = async (value, index) => {
    const districts = await fetchDistricts(value);
    const provinceName =
      tinhThanhList.find((t) => t.ProvinceID.toString() === value)
        ?.ProvinceName || "";
    const newAddresses = [...addresses];
    newAddresses[index] = {
      ...newAddresses[index],
      tinh: value,
      tinhName: provinceName,
      huyen: null,
      huyenName: "",
      xa: null,
      xaName: "",
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
      newAddresses[index].quanHuyenList.find(
        (h) => h.DistrictID.toString() === value
      )?.DistrictName || "";

    newAddresses[index] = {
      ...newAddresses[index],
      huyen: value, // DistrictID
      huyenName: districtName, // Human-readable name
      xa: null,
      xaName: "",
      xaPhuongList: wards,
    };
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses }); // Sync with form
  };

  const handleWardChange = (value, index) => {
    const newAddresses = [...addresses];
    const wardName =
      newAddresses[index].xaPhuongList.find(
        (x) => x.WardCode.toString() === value
      )?.WardName || "";

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
      tinhName: "",
      huyen: null,
      huyenName: "",
      xa: null,
      xaName: "",
      diaChiCuThe: null,
      quanHuyenList: [],
      xaPhuongList: [],
    };
    setAddresses((prev) => [...prev, newAddress]);
  };

  const handleSubmit = async (values) => {
    try {
      const validAddresses = values.addresses.filter(
        (address) => address.tinh && address.huyen && address.xa
      );

      if (validAddresses.length === 0) {
        toast.error("Vui lòng nhập ít nhất một địa chỉ đầy đủ!");
        return;
      }

      const updatedData = {
        maKhachHang: values.maKhachHang,
        tenKhachHang: values.tenKhachHang,
        email: values.email,
        soDienThoai: values.soDienThoai,
        ngaySinh: dayjs(values.ngaySinh).format("YYYY-MM-DD"),
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

      const response = await getPutApi(selectedKhachHang, updatedData);
      if (response && response.status === 200) {
        toast.success("Cập nhật khách hàng thành công!");
        if (typeof getAllKhachHang === "function") {
          await getAllKhachHang();
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi khi cập nhật khách hàng!"
      );
    }
  };
  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
    form.setFieldsValue({ addresses: newAddresses });
  };
  console.log("address sau khi thay đổi:", addresses);

  const handleConfirmSubmit = () => {
    Modal.confirm({
      title: "Xác nhận lưu khách hàng",
      content: "Bạn có chắc chắn muốn lưu thông tin khách hàng này?",
      okText: "Lưu",
      cancelText: "Hủy",
      onOk: () => form.submit(), // Gọi form.submit() để kích hoạt onFinish
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ gioiTinh: "true", ngaySinh: dayjs() }}
      style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}
    >
      <Row gutter={24}>
        {/* Cột trái - Thông tin khách hàng */}
        <Col span={12}>
          <h2>Thông tin khách hàng</h2>
          <Divider />

          {/* Tên khách hàng */}
          <Form.Item
            name="tenKhachHang"
            label="Tên khách hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng!" },
              {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: "Tên không được chứa số hoặc ký tự đặc biệt!",
              },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Vui lòng nhập email hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="soDienThoai"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          {/* Ngày sinh */}
          <Form.Item
            name="ngaySinh"
            label="Ngày sinh"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh!" },
              // {
              //   validator: (_, value) => {
              //     if (!value) return Promise.resolve();

              //     // Tính toán tuổi chính xác
              //     const today = moment();
              //     const age = today.diff(value, "years");

              //     // Kiểm tra tuổi phải từ 18 đến 60
              //     if (age < 18) {
              //       return Promise.reject("Nhân viên phải từ 18 tuổi trở lên!");
              //     }
              //     if (age > 60) {
              //       return Promise.reject("Nhân viên phải dưới 60 tuổi!");
              //     }

              //     // Kiểm tra nếu tuổi chưa đủ 18 hoặc lớn hơn 60 khi chưa qua ngày sinh trong năm nay
              //     const nextBirthday = moment(value).add(age, "years");
              //     if (today.isBefore(nextBirthday)) {
              //       return Promise.reject("Nhân viên phải từ 18 tuổi trở lên!");
              //     }

              //     return Promise.resolve();
              //   },
              // },
            ]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>

          {/* Giới tính */}
          <Form.Item
            name="gioiTinh"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Radio.Group>
              <Radio value="true">Nam</Radio>
              <Radio value="false">Nữ</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        {/* Cột phải - Danh sách địa chỉ */}
        <Col span={12}>
          <h2>Danh sách địa chỉ</h2>
          <Divider />
          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    style={{
                      marginBottom: 20,
                      borderBottom: "1px solid #ddd",
                      paddingBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4>Địa chỉ {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="link"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        ></Button>
                      )}
                    </div>

                    {/* Địa chỉ */}
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "tinh"]}
                          label="Tỉnh/Thành phố"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn tỉnh/thành phố",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn tỉnh/thành phố"
                            onChange={(value) =>
                              handleProvinceChange(value, index)
                            }
                          >
                            {tinhThanhList.map((item) => (
                              <Option
                                key={item.ProvinceID}
                                value={item.ProvinceID.toString()}
                              >
                                {item.ProvinceName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "huyen"]}
                          label="Quận/Huyện"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn quận/huyện",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn quận/huyện"
                            disabled={!addresses[index]?.tinh}
                            onChange={(value) =>
                              handleDistrictChange(value, index)
                            }
                          >
                            {addresses[index]?.quanHuyenList?.map((item) => (
                              <Option
                                key={item.DistrictID}
                                value={item.DistrictID.toString()}
                              >
                                {item.DistrictName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "xa"]}
                          label="Phường/Xã"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn phường/xã",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn phường/xã"
                            disabled={!addresses[index]?.huyen}
                            onChange={(value) => handleWardChange(value, index)}
                            value={addresses[index]?.xa}
                          >
                            {addresses[index]?.xaPhuongList?.map((item) => (
                              <Option
                                key={item.WardCode}
                                value={item.WardCode.toString()}
                              >
                                {item.WardName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Địa chỉ cụ thể */}
                    <Form.Item
                      {...restField}
                      name={[name, "diaChiCuThe"]}
                      label="Địa chỉ cụ thể"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập địa chỉ cụ thể",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập địa chỉ cụ thể" />
                    </Form.Item>
                  </div>
                ))}
                {/* Nút thêm địa chỉ mới */}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 20 }}
                >
                  Thêm địa chỉ mới
                </Button>
              </>
            )}
          </Form.List>
        </Col>
      </Row>

      <Divider />

      <div style={{ textAlign: "right" }}>
        <Button
          type="default"
          onClick={handleClose} // Hàm xử lý đóng form hoặc trở về danh sách
          style={{ marginRight: "10px" }}
        >
          Trở về
        </Button>
        <Button
          type="primary"
          style={{ width: "150px" }}
          onClick={handleConfirmSubmit}
        >
          Cập nhật khách hàng
        </Button>
      </div>
    </Form>
  );
};

export default DetailForm;
