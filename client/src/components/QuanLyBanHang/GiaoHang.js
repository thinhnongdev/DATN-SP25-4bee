import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Modal,
  Select,
  Input,
  Button,
  message,
  Space,
  
  Divider,
  Tag,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  HomeOutlined,
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
  MinusCircleOutlined,
  SyncOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";

const AddressFormat = {
  DISPLAY: "display",
  VALUE: "value",
};

// Cache để lưu trữ mapping giữa id và tên
const addressCache = {
  provinces: new Map(),
  districts: new Map(),
  wards: new Map(),
};

// Ở phần khai báo addressHelpers
const addressHelpers = {
  // Lưu thông tin địa chỉ vào cache
  cacheAddressInfo: (type, id, name) => {
    if (!addressCache[type] || !id || !name) return;

    // Chuyển đổi id thành string để đảm bảo nhất quán
    const idStr = id.toString();

    // Lưu theo định dạng rõ ràng
    addressCache[type].set(`id_${idStr}`, name); // Lưu ID -> tên
    addressCache[type].set(`name_${name}`, idStr); // Lưu tên -> ID
  },

  // Lấy tên từ id
  getNameById: (type, id) => {
    if (!id || !addressCache[type]) return id;

    const idStr = id.toString();
    const result = addressCache[type].get(`id_${idStr}`);

    if (!result) {
    }
    return result || id;
  },

  // Lấy id từ tên
  getIdByName: (type, name) => {
    if (!name || !addressCache[type]) return null;

    const result = addressCache[type].get(`name_${name}`);

    if (!result) {
    }
    return result ? parseInt(result, 10) : null; // Trả về ID dưới dạng số
  },

  // Format địa chỉ đầy đủ
  formatFullAddress: (address, format = AddressFormat.DISPLAY) => {
    if (!address) return "";

    const { diaChiCuThe, xa, huyen, tinh } = address;
    const parts = [];

    if (diaChiCuThe) parts.push(diaChiCuThe);

    if (format === AddressFormat.DISPLAY) {
      if (xa) parts.push(addressHelpers.getNameById("wards", xa));
      if (huyen) parts.push(addressHelpers.getNameById("districts", huyen));
      if (tinh) parts.push(addressHelpers.getNameById("provinces", tinh));
    } else {
      if (xa) parts.push(xa);
      if (huyen) parts.push(huyen);
      if (tinh) parts.push(tinh);
    }

    return parts.join(", ");
  },
};
// Thêm hàm này vào addressHelpers
addressHelpers.parseAddressString = (addressString) => {
  if (!addressString || typeof addressString !== "string") {
    return {
      diaChiCuThe: "",
      xaId: "",
      huyenId: "",
      tinhId: "",
      xaName: "Không xác định",
      huyenName: "Không xác định",
      tinhName: "Không xác định",
    };
  }

  // Tách chuỗi địa chỉ bằng dấu phẩy
  const parts = addressString.split(/,\s*/);
  if (parts.length < 4) {
    return {
      diaChiCuThe: addressString,
      xaId: "",
      huyenId: "",
      tinhId: "",
      xaName: "Không xác định",
      huyenName: "Không xác định",
      tinhName: "Không xác định",
    };
  }

  try {
    // Lấy ID từ cuối chuỗi
    const tinhId = parts[parts.length - 1].trim();
    const huyenId = parts[parts.length - 2].trim();
    const xaId = parts[parts.length - 3].trim();

    // Phần còn lại là địa chỉ chi tiết
    const diaChiCuThe = parts.slice(0, parts.length - 3).join(", ");

    // Lấy tên từ cache
    const tinhName =
      addressHelpers.getNameById("provinces", parseInt(tinhId, 10)) ||
      "Không xác định";
    const huyenName =
      addressHelpers.getNameById("districts", parseInt(huyenId, 10)) ||
      "Không xác định";
    const xaName =
      addressHelpers.getNameById("wards", parseInt(xaId, 10)) ||
      "Không xác định";

    return {
      diaChiCuThe,
      xaId,
      huyenId,
      tinhId,
      xaName,
      huyenName,
      tinhName,
      fullAddress: `${
        diaChiCuThe ? diaChiCuThe + ", " : ""
      }${xaName}, ${huyenName}, ${tinhName}`,
    };
  } catch (error) {
    console.error("⚠ Lỗi khi xử lý địa chỉ:", addressString, error);
    return {
      diaChiCuThe: addressString,
      xaId: "",
      huyenId: "",
      tinhId: "",
      xaName: "Không xác định",
      huyenName: "Không xác định",
      tinhName: "Không xác định",
    };
  }
};
// Thêm vào addressHelpers
addressHelpers.formatAddress = (address) => {
  if (!address) return "";

  // Nếu đã có fullAddress thì dùng luôn
  if (address.fullAddress) return address.fullAddress;

  // Tạo chuỗi địa chỉ đầy đủ theo format yêu cầu
  const diaChiCuThe = address.diaChiCuThe || "";

  // Ưu tiên dùng tên nếu có, nếu không thì dùng ID
  const xaName =
    address.xaName ||
    addressHelpers.getNameById("wards", address.xa) ||
    address.xa;
  const huyenName =
    address.huyenName ||
    addressHelpers.getNameById("districts", address.huyen) ||
    address.huyen;
  const tinhName =
    address.tinhName ||
    addressHelpers.getNameById("provinces", address.tinh) ||
    address.tinh;

  return `${
    diaChiCuThe ? diaChiCuThe + ", " : ""
  }${xaName}, ${huyenName}, ${tinhName}`;
};

// Cập nhật định nghĩa component để sử dụng forwardRef
const GiaoHang = React.forwardRef(
  ({ customerId, hoaDonId, onAddressSelect, onShippingFeeUpdate }, ref) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isManuallyEditing, setIsManuallyEditing] = useState(false);
    const [manualAddress, setManualAddress] = useState("");
    const [provinceData, setProvinceData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [wardData, setWardData] = useState([]);
    const [province, setProvince] = useState(null);
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);
    const [isNewAddressMode, setIsNewAddressMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [calculatingFee, setCalculatingFee] = useState(false);
    const [addressDataLoaded, setAddressDataLoaded] = useState(false);
    const [districtMap, setDistrictMap] = useState({}); // Map tên district -> district_id của GHN
    const [wardMap, setWardMap] = useState({}); // Map tên ward -> ward code của GHN
    // Thêm state mới để lưu trữ danh sách quận/huyện và xã/phường cho địa chỉ đã chọn
    const [addressSubmitAttempted, setAddressSubmitAttempted] = useState(false);
    const [addressList, setAddressList] = useState({
      districts: [],
      wards: [],
    });
    const [recipientInfo, setRecipientInfo] = useState({
      tenNguoiNhan: "",
      soDienThoai: "",
    });
    const [recipientFormSubmitted, setRecipientFormSubmitted] = useState(false);
    useEffect(() => {
      if (hoaDonId && !customerId) {
        // Chỉ gọi API khi là khách lẻ
        const fetchRecipientInfo = async () => {
          try {
            const response = await axios.get(
              `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (response.data) {
              const { tenNguoiNhan, soDienThoai } = response.data;
              if (tenNguoiNhan || soDienThoai) {
                setRecipientInfo({
                  tenNguoiNhan: tenNguoiNhan || "",
                  soDienThoai: soDienThoai || "",
                });
              }
            }
          } catch (error) {
            console.error("Lỗi khi lấy thông tin người nhận:", error);
          }
        };

        fetchRecipientInfo();
      }
    }, [hoaDonId, customerId]);

    const handleRecipientChange = (e) => {
      const { name, value } = e.target;
      setRecipientInfo((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
      if (isModalVisible && isNewAddressMode) {
        setAddressDataLoaded(false);
        setDistrictData([]);
        setWardData([]);
      }
    }, [isModalVisible, isNewAddressMode]);

    // 1. Cập nhật useEffect theo dõi customerId và hoaDonId
    useEffect(() => {
      // Reset state để tránh dữ liệu cũ
      setSelectedAddress(null);
    
      if (customerId) {
        // Trường hợp có khách hàng rõ ràng
        console.log("Đang tải địa chỉ cho khách hàng ID:", customerId);
        setIsNewAddressMode(false); // Đảm bảo form nhập mới không mở khi có khách hàng
        fetchCustomerAddresses(customerId);
      } else {
        // Trường hợp khách lẻ
        setAddresses([]);
        
        if (hoaDonId) {
          // Chỉ kiểm tra địa chỉ đã có và hiển thị form nếu cần
          fetchAnonymousInvoiceAddress().then((hasAddress) => {
            if (hasAddress) {
              // Nếu đã có địa chỉ, không mở form và xóa flag
              setIsNewAddressMode(false);
              sessionStorage.removeItem(`new_order_${hoaDonId}`);
            } else {
              // Nếu không có địa chỉ và là đơn mới, mở form
              const isNewOrder = sessionStorage.getItem(`new_order_${hoaDonId}`) === "true";
              setIsNewAddressMode(!hasAddress && isNewOrder);
            }
          });
        }
      }
    }, [customerId, hoaDonId]);
    
    // 2. Đơn giản hóa useEffect theo dõi hoaDonId
    useEffect(() => {
      if (hoaDonId) {
        // Reset các giá trị form khi chuyển tab
        setManualAddress("");
        setProvince(null);
        setDistrict(null);
        setWard(null);
        setDistrictData([]);
        setWardData([]);
        setAddressDataLoaded(false);
        setIsManuallyEditing(false);
        
        // QUAN TRỌNG: KHÔNG reset isNewAddressMode ở đây
        // Để useEffect theo dõi customerId và hoaDonId xử lý
      }
    }, [hoaDonId]);
    useEffect(() => {
      setSelectedAddress(null);
      setManualAddress("");
      setProvince(null);
      setDistrict(null);
      setWard(null);
      setDistrictData([]);
      setWardData([]);
      setAddressDataLoaded(false);
      setIsManuallyEditing(false);

      if (customerId) fetchCustomerAddresses(customerId);
      else setIsNewAddressMode(true);
    }, [customerId]);

    // Thêm useEffect để đảm bảo các danh sách quận/huyện và xã/phường được tải đúng khi có selectedAddress
    useEffect(() => {
      const loadAddressData = async () => {
        if (selectedAddress && provinceData.length > 0) {
          console.log("Đang tải dữ liệu địa chỉ chi tiết:", selectedAddress);

          // Set giá trị cơ bản
          setManualAddress(selectedAddress.diaChiCuThe || "");
          setProvince(selectedAddress.tinh || null);

          // Tìm tỉnh/thành phố trong danh sách
          const matchingProvince = provinceData.find(
            (p) => p.name === selectedAddress.tinh
          );

          if (matchingProvince) {
            console.log("Đã tìm thấy tỉnh:", matchingProvince.name);
            // Cập nhật danh sách quận/huyện
            setDistrictData(matchingProvince.data2 || []);
            setDistrict(selectedAddress.huyen || null);

            // Tìm quận/huyện trong danh sách
            const matchingDistrict = matchingProvince.data2.find(
              (d) => d.name === selectedAddress.huyen
            );

            if (matchingDistrict) {
              console.log("Đã tìm thấy huyện:", matchingDistrict.name);
              // Cập nhật danh sách xã/phường
              setWardData(matchingDistrict.data3 || []);
              setWard(selectedAddress.xa || null);
            } else {
              console.log(
                "Không tìm thấy huyện tương ứng:",
                selectedAddress.huyen
              );
            }
          } else {
            console.log("Không tìm thấy tỉnh tương ứng:", selectedAddress.tinh);
          }
        }
      };

      loadAddressData();
    }, [selectedAddress, provinceData]);

    useEffect(() => {
      if (provinceData.length > 0) {
        // Xây dựng map district_name -> district_id
        const districtMapping = {};
        const wardMapping = {};

        provinceData.forEach((province) => {
          if (province.data2 && Array.isArray(province.data2)) {
            province.data2.forEach((district) => {
              districtMapping[district.name] = district.id;

              // Xây dựng map ward_name -> ward_code
              if (district.data3 && Array.isArray(district.data3)) {
                district.data3.forEach((ward) => {
                  wardMapping[ward.name] = ward.id;
                });
              }
            });
          }
        });

        setDistrictMap(districtMapping);
        setWardMap(wardMapping);
      }
    }, [provinceData]);

    const calculateShippingFee = async (
      addressOrDistrictId,
      wardCodeOrNull = null
    ) => {
      if (!hoaDonId) {
        console.error("Thiếu hoaDonId để tính phí vận chuyển");
        return 0;
      }

      setCalculatingFee(true);
      try {
        // Thông tin cửa hàng lấy được từ log của server
        const shopInfo = {
          district_id: 1482,
        ward_code: "11006",
        };

        let payload;

        // Kiểm tra nếu tham số đầu tiên là đối tượng địa chỉ
        if (typeof addressOrDistrictId === "object") {
          console.log(
            "Đang tính phí vận chuyển cho địa chỉ:",
            addressOrDistrictId
          );

          // Chuyển đổi địa chỉ sang định dạng GHN
          const ghnAddress = await mapAddressToGHNFormat(addressOrDistrictId);

          if (!ghnAddress) {
            console.warn(
              "Không thể chuyển đổi địa chỉ, sử dụng giá trị mặc định"
            );

            // Sử dụng thông tin cửa hàng đã xác minh
            payload = {
              to_district_id: shopInfo.district_id,
              to_ward_code: shopInfo.ward_code,
              service_type_id: 2,
            };
          } else {
            payload = {
              to_district_id: ghnAddress.to_district_id,
              to_ward_code: ghnAddress.to_ward_code,
              service_type_id: 2,
            };
          }
        } else {
          // Kiểm tra tham số trước khi gửi
          let districtId = addressOrDistrictId;
          let wardCode = wardCodeOrNull;

          if (!districtId || districtId === "undefined") {
            console.warn("district_id không hợp lệ, sử dụng giá trị mặc định");
            districtId = shopInfo.district_id;
          }

          if (!wardCode || wardCode === "undefined") {
            console.warn("ward_code không hợp lệ, sử dụng giá trị mặc định");
            wardCode = shopInfo.ward_code;
          }

          payload = {
            to_district_id: districtId,
            to_ward_code: wardCode,
            service_type_id: 2,
            hoaDonId: hoaDonId,
          };
        }

        console.log("Gửi request tính phí vận chuyển:", payload);

        // Gọi API tính phí
        const response = await axios.post(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/phi-van-chuyen`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Phí vận chuyển từ API:", response.data);

        // Đảm bảo phí vận chuyển là một số
        let fee = typeof response.data === "number" ? response.data : 0;

        // Nếu phí vận chuyển không hợp lệ, sử dụng giá trị mặc định
        if (fee <= 0) {
          fee = 30000; // Mặc định 30,000 VND
          console.log("Sử dụng phí vận chuyển mặc định:", fee);
        }

        // Cập nhật phí vận chuyển vào hóa đơn và lưu vào state
        const success = await updateShippingFeeToInvoice(fee);

        return fee;
      } catch (error) {
        console.error("Lỗi khi tính phí vận chuyển:", error);

        // Sử dụng phí vận chuyển mặc định khi có lỗi
        const defaultFee = 30000;
        await updateShippingFeeToInvoice(defaultFee);

        return defaultFee;
      } finally {
        setCalculatingFee(false);
      }
    };

    // Hàm cập nhật phí vận chuyển vào hóa đơn
    const updateShippingFeeToInvoice = async (fee) => {
      if (!hoaDonId) {
        console.error("Không có hoaDonId để cập nhật phí vận chuyển");
        return false;
      }

      try {
        console.log(`Cập nhật phí vận chuyển ${fee} cho hóa đơn ${hoaDonId}`);

        // Gọi API cập nhật phí vận chuyển
        const response = await axios.post(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
          { fee: fee },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Kết quả cập nhật phí vận chuyển:", response.data);

        // Cập nhật state local để hiển thị
        setShippingFee(fee);

        // Cập nhật state của component cha nếu có callback
        if (typeof onShippingFeeUpdate === "function") {
          onShippingFeeUpdate(fee);
        }

        return true;
      } catch (error) {
        console.error("Lỗi khi cập nhật phí vận chuyển vào hóa đơn:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          message.error(
            `Lỗi cập nhật phí vận chuyển: ${
              error.response.data.message || "Lỗi không xác định"
            }`
          );
        } else {
          message.error(
            "Không thể kết nối đến server để cập nhật phí vận chuyển"
          );
        }

        return false;
      }
    };
    // Cập nhật useEffect cho selectedAddress để tương thích với cách xử lý trong DetailForm.js
    useEffect(() => {
      // Chỉ thực hiện khi có selectedAddress, có dữ liệu tỉnh,
      // chưa tải dữ liệu địa chỉ, và KHÔNG phải đang ở chế độ nhập mới
      if (
        selectedAddress &&
        provinceData.length > 0 &&
        !addressDataLoaded &&
        !isManuallyEditing &&
        !isNewAddressMode
      ) {
        // Thêm điều kiện này

        console.log("Đang tải thông tin địa chỉ đã chọn...");

        setAddressDataLoaded(true);
        setManualAddress(selectedAddress.diaChiCuThe || "");

        const matchingProvince = findClosestMatch(
          selectedAddress.tinh,
          provinceData
        );

        if (matchingProvince) {
          setProvince(matchingProvince.name);
          handleProvinceChange(matchingProvince.name);
        }
      }
    }, [
      selectedAddress,
      provinceData,
      addressDataLoaded,
      isManuallyEditing,
      isNewAddressMode,
    ]);

    useEffect(() => {
      if (customerId && addresses.length === 1) {
        const singleAddress = addresses[0];
        setSelectedAddress(singleAddress);

        // Gửi địa chỉ lên BanHang.js
        onAddressSelect({
          id: singleAddress.id,
          diaChiCuThe: singleAddress.diaChiCuThe,
          xa: singleAddress.xa,
          huyen: singleAddress.huyen,
          tinh: singleAddress.tinh,
          fullAddress: `${
            singleAddress.diaChiCuThe ? singleAddress.diaChiCuThe + ", " : ""
          }${singleAddress.xa}, ${singleAddress.huyen}, ${singleAddress.tinh}`,
        });
      }
    }, [customerId, addresses]);

    useEffect(() => {
      if (selectedAddress) {
        console.log("===== DEBUG =====");
        console.log("Địa chỉ đã chọn:", selectedAddress);
        console.log("Data tỉnh có sẵn:", provinceData.length > 0);

        if (provinceData.length > 0) {
          // Tìm tỉnh trong data
          const foundProvince = provinceData.find(
            (p) => p.name === selectedAddress.tinh
          );
          console.log(
            `Tỉnh [${selectedAddress.tinh}] tìm thấy:`,
            foundProvince ? "Có" : "Không"
          );

          if (foundProvince && foundProvince.data2) {
            // Log danh sách quận/huyện
            console.log(
              "Danh sách quận/huyện:",
              foundProvince.data2.map((d) => d.name).join(", ")
            );

            // Tìm huyện trong data
            const foundDistrict = foundProvince.data2.find(
              (d) => d.name === selectedAddress.huyen
            );
            console.log(
              `Huyện [${selectedAddress.huyen}] tìm thấy:`,
              foundDistrict ? "Có" : "Không"
            );
          }
        }
      }
    }, [selectedAddress, provinceData]);
    useEffect(() => {
      if (!selectedAddress || provinceData.length === 0 || addressDataLoaded)
        return;
      setAddressDataLoaded(true);
      setManualAddress(selectedAddress.diaChiCuThe || "");

      // load provinces → districtData
      const prov = provinceData.find((p) => p.name === selectedAddress.tinh);
      if (!prov) return;
      setProvince(prov.id);
      setDistrictData(prov.data2 || []);

      // load district → wardData
      const dist = prov.data2?.find((d) => d.name === selectedAddress.huyen);
      if (dist) {
        setDistrict(dist.id);
        setWardData(dist.data3 || []);
      }

      // set ward
      const w = dist?.data3?.find((w) => w.name === selectedAddress.xa);
      if (w) setWard(w.id);
    }, [selectedAddress, provinceData]);

    // Hàm chuẩn hóa chuỗi (loại bỏ dấu và khoảng trắng thừa)
    const normalizeString = (str) => {
      if (!str) return "";

      // Chuẩn hóa chuỗi cơ bản
      let normalized = str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .trim()
        .replace(/\s+/g, " "); // Loại bỏ khoảng trắng thừa

      // Bỏ các tiền tố không cần thiết: "Tỉnh", "Thành phố", "Quận", "Huyện", "Xã", "Phường", "Thị xã"
      normalized = normalized
        .replace(/^tinh\s+/, "")
        .replace(/^thanh pho\s+/, "")
        .replace(/^quan\s+/, "")
        .replace(/^huyen\s+/, "")
        .replace(/^xa\s+/, "")
        .replace(/^phuong\s+/, "")
        .replace(/^thi xa\s+/, "");

      return normalized;
    };

    // Hàm tìm kiếm gần đúng cải tiến
    const findClosestMatch = (name, list) => {
      if (!name || !list || !list.length) return null;

      // Kiểm tra và chuyển đổi name thành chuỗi nếu không phải chuỗi
      let nameStr;
      if (typeof name === "string") {
        nameStr = name;
      } else if (name !== null && name !== undefined) {
        // Chuyển đổi sang chuỗi nếu là số hoặc loại khác
        nameStr = String(name);
      } else {
        console.error("Giá trị name không hợp lệ:", name);
        return null;
      }

      // Đảm bảo nameStr là chuỗi rồi mới trim
      nameStr = nameStr.trim();

      // Chuẩn hóa tên để so sánh
      const normalizedName = normalizeString(nameStr);

      // 1. Tìm kiếm chính xác sau khi đã chuẩn hóa
      const exactMatch = list.find(
        (item) => normalizeString(item.name) === normalizedName
      );
      if (exactMatch) {
        console.log(
          `Tìm thấy kết quả khớp chính xác: "${exactMatch.name}" cho "${name}"`
        );
        return exactMatch;
      }

      // 2. Nếu name là số, tìm trực tiếp theo ID
      if (typeof name === "number" || !isNaN(parseInt(nameStr, 10))) {
        const idVal = typeof name === "number" ? name : parseInt(nameStr, 10);
        const idMatch = list.find((item) => parseInt(item.id, 10) === idVal);
        if (idMatch) {
          console.log(
            `Tìm thấy kết quả khớp theo ID: "${idMatch.name}" cho ID "${name}"`
          );
          return idMatch;
        }
      }

      // 3. Tìm kiếm chứa từ khóa
      const containsMatch = list.find(
        (item) =>
          normalizeString(item.name).includes(normalizedName) ||
          normalizedName.includes(normalizeString(item.name))
      );
      if (containsMatch) {
        console.log(
          `Tìm thấy kết quả chứa từ khóa: "${containsMatch.name}" cho "${name}"`
        );
        return containsMatch;
      }

      // 4. Tìm kiếm với độ tương đồng cao nhất
      let bestMatch = null;
      let bestScore = 0;

      for (const item of list) {
        const itemNormalized = normalizeString(item.name);

        // Tính điểm dựa trên số ký tự trùng nhau liên tiếp từ đầu
        let score = 0;
        const minLength = Math.min(
          normalizedName.length,
          itemNormalized.length
        );

        let i = 0;
        while (i < minLength && normalizedName[i] === itemNormalized[i]) {
          score++;
          i++;
        }

        // Tính tỷ lệ giữa điểm và độ dài để đảm bảo công bằng cho các tên ngắn
        const scoreRatio = score / minLength;

        if (scoreRatio > bestScore) {
          bestScore = scoreRatio;
          bestMatch = item;
        }
      }

      // Chỉ trả về kết quả nếu có độ tương đồng đủ lớn (> 60%)
      if (bestScore > 0.6) {
        console.log(
          `Tìm thấy kết quả gần đúng nhất: "${bestMatch.name}" (${Math.round(
            bestScore * 100
          )}%) cho "${name}"`
        );
        return bestMatch;
      }

      console.log(`Không tìm thấy kết quả gần đúng nào cho "${name}"`);
      return null;
    };
    // Cập nhật hàm fetchAnonymousInvoiceAddress để xử lý địa chỉ ID và chuyển thành tên
    const fetchAnonymousInvoiceAddress = async () => {
      if (!hoaDonId) return;

      setLoading(true);
      try {
        const isNewOrder =
          sessionStorage.getItem(`new_order_${hoaDonId}`) === "true";

        if (isNewOrder) {
          console.log("Đơn hàng mới cho khách lẻ, mở form nhập địa chỉ mới");
          setSelectedAddress(null);
          setIsNewAddressMode(true);
          setLoading(false);
          return;
        }

        // Lấy thông tin địa chỉ từ API
        const addressDetailsResponse = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const addressDetails = addressDetailsResponse.data;
        console.log("Thông tin địa chỉ từ hóa đơn (khách lẻ):", addressDetails);
        // Nếu không có địa chỉ hoặc địa chỉ không đầy đủ, mở form nhập mới
        if (
          !addressDetails ||
          !addressDetails.tinh ||
          !addressDetails.huyen ||
          !addressDetails.xa
        ) {
          console.log(
            "Không có địa chỉ hoặc địa chỉ không đầy đủ, mở form nhập mới"
          );
          setSelectedAddress(null);
          setIsNewAddressMode(true);
          return;
        }
        // Nếu có thông tin địa chỉ đầy đủ
        if (
          addressDetails &&
          Object.keys(addressDetails).length > 0 &&
          addressDetails.tinh &&
          addressDetails.huyen &&
          addressDetails.xa
        ) {
          // Đợi provinceData được tải xong
          if (provinceData.length === 0) {
            // Nếu chưa có dữ liệu tỉnh, tải dữ liệu tỉnh trước
            const provincesResponse = await axios.get(
              "https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/tinh",
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            // Format và lưu dữ liệu tỉnh
            const formattedProvinces = provincesResponse.data.map(
              (province) => {
                addressHelpers.cacheAddressInfo(
                  "provinces",
                  province.id,
                  province.name
                );
                return {
                  id: province.id,
                  name: province.name,
                  code: province.id,
                  data2: [],
                };
              }
            );

            setProvinceData(formattedProvinces);
          }

          // Tạo đối tượng địa chỉ tạm thời, lưu cả ID và chuẩn bị lưu tên
          const tempAddress = {
            id: `temp_${Math.random().toString(36).substr(2, 9)}`,
            diaChiCuThe: addressDetails.diaChiCuThe || "", // Lưu địa chỉ chi tiết nguyên bản
            xa: addressDetails.xa,
            huyen: addressDetails.huyen,
            tinh: addressDetails.tinh,
          };

          // Tìm và lấy tên địa chỉ, ưu tiên từ cache hoặc từ dữ liệu đã tải
          // 1. Lấy tên tỉnh
          let tinhName;
          if (
            typeof tempAddress.tinh === "number" ||
            !isNaN(parseInt(tempAddress.tinh))
          ) {
            const tinhId = parseInt(tempAddress.tinh, 10);
            // Kiểm tra cache trước
            tinhName = addressHelpers.getNameById("provinces", tinhId);

            // Nếu cache không có tên (trả về ID), tìm trong provinceData
            if (tinhName === String(tinhId)) {
              const matchingProvince = provinceData.find(
                (p) => p.id === tinhId
              );
              if (matchingProvince) {
                tinhName = matchingProvince.name;
                addressHelpers.cacheAddressInfo("provinces", tinhId, tinhName);
              } else {
                tinhName = `Tỉnh/TP: ${tinhId}`;
              }
            }
          } else {
            tinhName = tempAddress.tinh;
          }

          // 2. Tải danh sách quận/huyện nếu cần
          let districtDataTemp = districtData;
          if (districtData.length === 0) {
            try {
              const districtsResponse = await axios.get(
                `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/huyen?provinceId=${tempAddress.tinh}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              districtDataTemp = districtsResponse.data.map((district) => {
                const districtId = parseInt(district.id, 10);
                addressHelpers.cacheAddressInfo(
                  "districts",
                  districtId,
                  district.name
                );
                return {
                  id: districtId,
                  name: district.name,
                  code: districtId,
                };
              });

              setDistrictData(districtDataTemp);
            } catch (error) {
              console.error("Không thể tải danh sách quận/huyện:", error);
            }
          }

          // 3. Lấy tên huyện
          let huyenName;
          if (
            typeof tempAddress.huyen === "number" ||
            !isNaN(parseInt(tempAddress.huyen))
          ) {
            const huyenId = parseInt(tempAddress.huyen, 10);
            // Kiểm tra cache trước
            huyenName = addressHelpers.getNameById("districts", huyenId);

            // Nếu cache không có tên (trả về ID), tìm trong districtData
            if (huyenName === String(huyenId)) {
              const matchingDistrict = districtDataTemp.find(
                (d) => d.id === huyenId
              );
              if (matchingDistrict) {
                huyenName = matchingDistrict.name;
                addressHelpers.cacheAddressInfo(
                  "districts",
                  huyenId,
                  huyenName
                );
              } else {
                huyenName = `Quận/Huyện: ${huyenId}`;
              }
            }
          } else {
            huyenName = tempAddress.huyen;
          }

          // 4. Tải danh sách xã/phường nếu cần
          let wardDataTemp = wardData;
          if (wardData.length === 0) {
            try {
              const wardsResponse = await axios.get(
                `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/xa?districtId=${tempAddress.huyen}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              wardDataTemp = wardsResponse.data.map((ward) => {
                const wardId = parseInt(ward.id, 10);
                addressHelpers.cacheAddressInfo("wards", wardId, ward.name);
                return {
                  id: wardId,
                  name: ward.name,
                  code: wardId,
                };
              });

              setWardData(wardDataTemp);
            } catch (error) {
              console.error("Không thể tải danh sách xã/phường:", error);
            }
          }

          // 5. Lấy tên xã
          let xaName;
          if (
            typeof tempAddress.xa === "number" ||
            !isNaN(parseInt(tempAddress.xa))
          ) {
            const xaId = parseInt(tempAddress.xa, 10);
            // Kiểm tra cache trước
            xaName = addressHelpers.getNameById("wards", xaId);

            // Nếu cache không có tên (trả về ID), tìm trong wardData
            if (xaName === String(xaId)) {
              const matchingWard = wardDataTemp.find((w) => w.id === xaId);
              if (matchingWard) {
                xaName = matchingWard.name;
                addressHelpers.cacheAddressInfo("wards", xaId, xaName);
              } else {
                xaName = `Xã/Phường: ${xaId}`;
              }
            }
          } else {
            xaName = tempAddress.xa;
          }

          // 6. Tạo địa chỉ đầy đủ đảm bảo giữ nguyên địa chỉ chi tiết
          const fullAddress = `${
            tempAddress.diaChiCuThe ? tempAddress.diaChiCuThe + ", " : ""
          }${xaName}, ${huyenName}, ${tinhName}`;

          // 7. Cập nhật đối tượng địa chỉ với cả ID và tên
          const enrichedAddress = {
            ...tempAddress,
            tinhName: tinhName,
            huyenName: huyenName,
            xaName: xaName,
            fullAddress: fullAddress,
          };

          console.log("Địa chỉ đã được làm giàu:", enrichedAddress);

          // 8. Lưu địa chỉ và cập nhật UI
          setSelectedAddress(enrichedAddress);
          onAddressSelect(enrichedAddress);

          // Cập nhật các trường form với ID để giữ nhất quán
          setManualAddress(tempAddress.diaChiCuThe);
          setProvince(parseInt(tempAddress.tinh, 10));
          setDistrict(parseInt(tempAddress.huyen, 10));
          setWard(parseInt(tempAddress.xa, 10));

          // Đóng form nhập địa chỉ mới
          setIsNewAddressMode(false);
        } else {
          // Không có địa chỉ, mở form nhập địa chỉ mới
          setSelectedAddress(null);
          setIsNewAddressMode(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ từ hóa đơn cho khách lẻ:", error);
        // Mở form nhập địa chỉ mới nếu có lỗi
        setSelectedAddress(null);
        setIsNewAddressMode(true);
      } finally {
        setLoading(false);
      }
    };

    const clearNewOrderFlag = () => {
      if (hoaDonId) {
        sessionStorage.removeItem(`new_order_${hoaDonId}`);
      }
    };
    // Update the useEffect that handles address selection and form population
    useEffect(() => {
      if (selectedAddress && provinceData.length > 0) {
        // CRITICAL: Skip address field population when in new address mode
        if (isNewAddressMode === true) {
          console.log(
            "Đang ở chế độ nhập địa chỉ mới - bỏ qua cập nhật trường form"
          );
          return;
        }

        // Log for debugging
        console.log("Populating form with selected address:", selectedAddress);

        // Set basic values
        setManualAddress(selectedAddress.diaChiCuThe || "");

        // Find the matching province
        const matchingProvince = findClosestMatch(
          selectedAddress.tinh,
          provinceData
        );

        if (matchingProvince) {
          setProvince(matchingProvince.name);
          setDistrictData(matchingProvince.data2);

          // Find the matching district
          const matchingDistrict = findClosestMatch(
            selectedAddress.huyen,
            matchingProvince.data2
          );

          if (matchingDistrict) {
            setDistrict(matchingDistrict.name);
            setWardData(matchingDistrict.data3);

            // Find the matching ward
            const matchingWard = findClosestMatch(
              selectedAddress.xa,
              matchingDistrict.data3
            );

            if (matchingWard) {
              setWard(matchingWard.name);
            }
          }
        }
      }
    }, [selectedAddress, provinceData, isNewAddressMode]); // isNewAddressMode is a critical dependency // Add isNewAddressMode to dependencies
    // Tách hàm lấy địa chỉ để có thể gọi lại khi cần
    const fetchCustomerAddresses = async (id) => {
      if (!id) return;

      setLoading(true);
      try {
        // Get the customer's address list
        const response = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/khach_hang/diaChi/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("API trả về danh sách địa chỉ:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Normalize address data
          const normalizedAddresses = response.data.map((addr) => ({
            ...addr,
            tinh: addr.tinh?.trim(),
            huyen: addr.huyen?.trim(),
            xa: addr.xa?.trim(),
            diaChiCuThe: addr.diaChiCuThe?.trim(),
          }));

          setAddresses(normalizedAddresses);

          // Check if the invoice already has a stored address
          if (hoaDonId) {
            try {
              // Use the invoice-specific API to get address details
              const addressDetailsResponse = await axios.get(
                `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              const addressDetails = addressDetailsResponse.data;
              console.log("Thông tin địa chỉ từ hóa đơn:", addressDetails);

              // If the address is stored in the invoice, try to find a matching one
              if (
                addressDetails &&
                addressDetails.tinh &&
                addressDetails.huyen &&
                addressDetails.xa
              ) {
                const matchedAddress = findMatchingAddress(
                  normalizedAddresses,
                  addressDetails
                );

                if (matchedAddress) {
                  console.log("Đã tìm thấy địa chỉ khớp:", matchedAddress);
                  setSelectedAddress(matchedAddress);
                  setIsNewAddressMode(false);

                  // Send the address up to BanHang.js for display
                  const addressToDisplay = {
                    id: matchedAddress.id,
                    diaChiCuThe: matchedAddress.diaChiCuThe,
                    xa: matchedAddress.xa,
                    huyen: matchedAddress.huyen,
                    tinh: matchedAddress.tinh,
                    fullAddress: `${
                      matchedAddress.diaChiCuThe
                        ? matchedAddress.diaChiCuThe + ", "
                        : ""
                    }${matchedAddress.xa}, ${matchedAddress.huyen}, ${
                      matchedAddress.tinh
                    }`,
                  };

                  onAddressSelect(addressToDisplay);
                  return;
                }
              }
            } catch (error) {
              console.error("Lỗi khi kiểm tra địa chỉ trong hóa đơn:", error);
            }
          }

          // If we reach here, either there's no address in the invoice or we couldn't find a match
          // Just select the first address
          selectFirstAddress();
        } else {
          // No addresses, switch to new address entry mode
          setIsNewAddressMode(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ khách hàng:", error);
        message.error("Lỗi khi lấy địa chỉ khách hàng.");
        setIsNewAddressMode(true);
      } finally {
        setLoading(false);
      }
    };

    // Hàm tìm địa chỉ khớp với thông tin từ hóa đơn
    const findMatchingAddress = (addresses, addressDetails) => {
      if (!addresses || !addressDetails) return null;

      // Tìm địa chỉ có thông tin khớp nhất
      return addresses.find(
        (address) =>
          address.tinh === addressDetails.tinh &&
          address.huyen === addressDetails.huyen &&
          address.xa === addressDetails.xa &&
          (addressDetails.diaChiCuThe
            ? address.diaChiCuThe === addressDetails.diaChiCuThe
            : true)
      );
    };
    // Cập nhật hàm selectFirstAddress
    const selectFirstAddress = async () => {
      if (addresses.length === 0) {
        console.log("Không có địa chỉ nào để chọn");
        return;
      }

      // Kiểm tra xem hóa đơn đã có địa chỉ lưu trữ chưa
      if (hoaDonId) {
        try {
          // Dùng API dia-chi-chi-tiet để lấy thông tin địa chỉ đã lưu
          const addressDetailsResponse = await axios.get(
            `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const addressDetails = addressDetailsResponse.data;
          console.log("Thông tin địa chỉ từ hóa đơn:", addressDetails);

          // Nếu có thông tin địa chỉ
          if (
            addressDetails &&
            Object.keys(addressDetails).length > 0 &&
            addressDetails.tinh &&
            addressDetails.huyen &&
            addressDetails.xa
          ) {
            // Tìm địa chỉ tương ứng trong danh sách
            const matchedAddress = findMatchingAddress(
              addresses,
              addressDetails
            );

            if (matchedAddress) {
              console.log("Đã tìm thấy địa chỉ khớp:", matchedAddress);
              // Đặt địa chỉ đã lưu làm địa chỉ được chọn
              setSelectedAddress(matchedAddress);

              // Tạo đối tượng địa chỉ đầy đủ
              const addressToDisplay = {
                id: matchedAddress.id,
                diaChiCuThe: matchedAddress.diaChiCuThe,
                xa: matchedAddress.xa,
                huyen: matchedAddress.huyen,
                tinh: matchedAddress.tinh,
                fullAddress: `${
                  matchedAddress.diaChiCuThe
                    ? matchedAddress.diaChiCuThe + ", "
                    : ""
                }${matchedAddress.xa}, ${matchedAddress.huyen}, ${
                  matchedAddress.tinh
                }`,
              };

              // Gửi địa chỉ lên BanHang.js để hiển thị
              onAddressSelect(addressToDisplay);
              console.log(
                "Đã chọn địa chỉ đã lưu trong hóa đơn:",
                addressToDisplay
              );
              return;
            }
          }

          // Nếu không tìm thấy địa chỉ khớp hoặc không có thông tin địa chỉ, chọn địa chỉ đầu tiên
          const firstAddress = addresses[0];
          setSelectedAddress(firstAddress);

          // Tạo đối tượng địa chỉ đầy đủ
          const addressToDisplay = {
            id: firstAddress.id,
            diaChiCuThe: firstAddress.diaChiCuThe,
            xa: firstAddress.xa,
            huyen: firstAddress.huyen,
            tinh: firstAddress.tinh,
            fullAddress: `${
              firstAddress.diaChiCuThe ? firstAddress.diaChiCuThe + ", " : ""
            }${firstAddress.xa}, ${firstAddress.huyen}, ${firstAddress.tinh}`,
          };

          // Gửi địa chỉ lên BanHang.js để hiển thị
          onAddressSelect(addressToDisplay);

          // Cập nhật địa chỉ vào hóa đơn
          await submitAddressToInvoice(addressToDisplay);

          console.log("Đã tự động chọn địa chỉ đầu tiên:", addressToDisplay);
        } catch (error) {
          console.error("Lỗi khi kiểm tra thông tin hóa đơn:", error);

          // Trong trường hợp lỗi, vẫn cố gắng chọn địa chỉ đầu tiên
          selectFirstAddressDirectly();
        }
      } else {
        // Nếu không có hoaDonId, chỉ cần chọn địa chỉ đầu tiên để hiển thị
        selectFirstAddressDirectly();
      }
    };

    // Hàm hỗ trợ chọn địa chỉ đầu tiên
    const selectFirstAddressDirectly = async () => {
      if (addresses.length === 0) return;

      const firstAddress = addresses[0];
      setSelectedAddress(firstAddress);

      // Tạo đối tượng địa chỉ đầy đủ
      const addressToDisplay = {
        id: firstAddress.id,
        diaChiCuThe: firstAddress.diaChiCuThe,
        xa: firstAddress.xa,
        huyen: firstAddress.huyen,
        tinh: firstAddress.tinh,
        fullAddress: `${
          firstAddress.diaChiCuThe ? firstAddress.diaChiCuThe + ", " : ""
        }${firstAddress.xa}, ${firstAddress.huyen}, ${firstAddress.tinh}`,
      };

      // Gửi địa chỉ lên BanHang.js để hiển thị
      onAddressSelect(addressToDisplay);

      // Cập nhật địa chỉ vào hóa đơn
      if (hoaDonId) {
        try {
          await submitAddressToInvoice(addressToDisplay);
        } catch (error) {
          console.error("Lỗi khi cập nhật địa chỉ vào hóa đơn:", error);
        }
      }

      console.log("Đã chọn địa chỉ đầu tiên trực tiếp:", addressToDisplay);
    };
    // Thêm hàm applyAddressToInvoice (đã được tham chiếu trong useImperativeHandle)
    const applyAddressToInvoice = async () => {
      // Nếu không có địa chỉ được chọn hoặc không có hoaDonId, không thể áp dụng
      if (!selectedAddress || !hoaDonId) {
        console.log("Không thể áp dụng: Thiếu địa chỉ hoặc hoaDonId");
        return;
      }

      try {
        // Tạo đối tượng địa chỉ
        const addressData = {
          id: selectedAddress.id,
          diaChiCuThe: selectedAddress.diaChiCuThe,
          xa: selectedAddress.xa,
          huyen: selectedAddress.huyen,
          tinh: selectedAddress.tinh,
        };

        // Gửi địa chỉ lên API để cập nhật hóa đơn
        const result = await submitAddressToInvoice(addressData);

        console.log("Đã áp dụng địa chỉ vào hóa đơn:", result);
        return result;
      } catch (error) {
        console.error("Lỗi khi áp dụng địa chỉ vào hóa đơn:", error);
        throw error;
      }
    };
    // Thêm hàm submitAddressToInvoice ngay sau các hàm xử lý địa chỉ
const submitAddressToInvoice = async (addressData) => {
      if (!hoaDonId) {
        console.log("Không có hoaDonId để cập nhật địa chỉ");
        return;
      }
      if (!addressData.tinh || !addressData.huyen || !addressData.xa || !addressData.diaChiCuThe) {
        message.error("Thông tin địa chỉ không đầy đủ, vui lòng nhập lại");
        return null;
      }
      
      // Với khách hàng lẻ, kiểm tra thông tin người nhận
      if (!customerId) {
        if (!recipientInfo.tenNguoiNhan || !recipientInfo.soDienThoai) {
          setRecipientFormSubmitted(true);
          message.error("Vui lòng nhập đầy đủ thông tin người nhận");
          return null;
        }
      }
    
      try {
        console.log(
          `Đang cập nhật địa chỉ cho hóa đơn ${hoaDonId}:`,
          addressData
        );

        // Tạo payload với thêm thông tin người nhận nếu là khách lẻ
        const payload = {
          diaChiId: addressData.id,
          diaChiCuThe: addressData.diaChiCuThe,
          xa: addressData.xa,
          huyen: addressData.huyen,
          tinh: addressData.tinh,
          // Thêm thông tin người nhận nếu là khách lẻ
          ...((!customerId) && {
            tenNguoiNhan: recipientInfo.tenNguoiNhan,
            soDienThoai: recipientInfo.soDienThoai
          })
        };

        console.log("Gửi request cập nhật địa chỉ:", payload);

        const response = await axios.put(
          `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/update-address`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Phản hồi từ server:", response.data);
        message.success("Cập nhật địa chỉ giao hàng thành công.");
        
        // Reset trạng thái kiểm tra form
        setRecipientFormSubmitted(false);
        
        return response.data;
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ giao hàng:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
        } else {
          // message.error("Không thể kết nối đến server.");
        }
        return null;
      }
    };

    // Lấy dữ liệu tỉnh/thành phố từ API
    useEffect(() => {
      const fetchProvinces = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            "https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/tinh",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Lưu vào cache và format dữ liệu
          const formattedProvinces = response.data.map((province) => {
            addressHelpers.cacheAddressInfo(
              "provinces",
              province.id,
              province.name
            );
            return {
              id: province.id,
              name: province.name,
              code: province.id,
              data2: [],
            };
          });

          setProvinceData(formattedProvinces);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố:", error);
          message.error("Không thể tải danh sách tỉnh/thành phố");
        } finally {
          setLoading(false);
        }
      };

      fetchProvinces();
    }, []);

    const handleProvinceChange = async (value) => {
      setIsManuallyEditing(true);

      // value là tên tỉnh, cần lấy ID của tỉnh đó
      const provinceObj = provinceData.find((p) => p.name === value);
      if (!provinceObj) {
        console.error("Không tìm thấy tỉnh/thành phố:", value);
        return;
      }

      // Lấy ID tỉnh dưới dạng số nguyên
      const provinceId = parseInt(provinceObj.id, 10);

      // Lưu ID của tỉnh vào state, KHÔNG phải tên
      setProvince(provinceId);

      // Lưu vào cache để sử dụng sau này
      addressHelpers.cacheAddressInfo("provinces", provinceId, value);

      // Reset district và ward khi thay đổi province
      setDistrict(null);
      setWard(null);
      setWardData([]);

      try {
        setLoading(true);

        console.log(
          `Đang tải quận/huyện cho tỉnh ID: ${provinceId} (${value})`
        );

        const response = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formattedDistricts = response.data.map((district) => {
          // Đảm bảo lưu vào cache với ID là số nguyên
          const districtId = parseInt(district.id, 10);
          addressHelpers.cacheAddressInfo(
            "districts",
            districtId,
            district.name
          );
          return {
            id: districtId,
            name: district.name,
            code: districtId,
            data3: [],
          };
        });

        setDistrictData(formattedDistricts);
        console.log("Đã chọn tỉnh:", value, "- ID:", provinceId);
      } catch (error) {
        console.error(`Lỗi khi lấy quận/huyện:`, error);
        message.error(`Không thể tải danh sách quận/huyện`);
      } finally {
        setLoading(false);
      }
    };

    // Cập nhật hàm xử lý khi chọn quận/huyện để không bị reset
    const handleDistrictChange = async (value) => {
      // Đánh dấu đang ở chế độ nhập thủ công
      setIsManuallyEditing(true);

      // Tìm district đã chọn - value là tên quận/huyện
      const selectedDistrict = districtData.find((d) => d.name === value);
      if (!selectedDistrict) {
        console.error("Không tìm thấy quận/huyện:", value);
        return;
      }

      // Lưu ID của quận/huyện, KHÔNG phải tên
      const districtId = parseInt(selectedDistrict.id, 10);
      setDistrict(districtId);

      // Lưu vào cache để sử dụng sau này
      addressHelpers.cacheAddressInfo("districts", districtId, value);

      // Reset xã/phường khi thay đổi quận/huyện
      setWard(null);

      try {
        setLoading(true); // Hiển thị trạng thái loading

        console.log(
          `Đang tải xã/phường cho huyện ID: ${districtId} (${value})`
        );

        // Gọi API để lấy danh sách xã/phường theo ID quận/huyện
        const wardsResponse = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("API ward response:", wardsResponse.data);

        // Chuyển đổi dữ liệu từ API sang định dạng phù hợp
        const formattedWards = wardsResponse.data.map((ward) => {
          // Đảm bảo ID là số nguyên
          const wardId = parseInt(ward.id, 10);

          // Cache thông tin xã/phường để dùng sau
          addressHelpers.cacheAddressInfo("wards", wardId, ward.name);

          return {
            id: wardId,
            name: ward.name,
            code: wardId,
          };
        });

        // Debug xem danh sách xã/phường có đúng định dạng không
        console.log("Formatted wards:", formattedWards);

        // Cập nhật dữ liệu xã/phường
        setWardData(formattedWards);

        console.log(
          `Đã tải ${formattedWards.length} xã/phường cho quận/huyện: ${value} (ID: ${districtId})`
        );
      } catch (error) {
        console.error(`Lỗi khi lấy xã/phường cho quận/huyện ${value}:`, error);
        message.error(`Không thể tải danh sách xã/phường cho ${value}`);
      } finally {
        setLoading(false); // Tắt trạng thái loading
      }
    };

    // Xử lý chọn xã/phường
    const handleWardChange = (value) => {
      setIsManuallyEditing(true); // Đánh dấu đang ở chế độ nhập thủ công

      // Tìm ward đã chọn - value là tên xã/phường
      const selectedWard = wardData.find((w) => w.name === value);
      if (selectedWard) {
        // Lưu ID của xã/phường, KHÔNG phải tên
        const wardId = parseInt(selectedWard.id, 10);
        setWard(wardId);

        // Lưu vào cache để sử dụng sau này
        addressHelpers.cacheAddressInfo("wards", wardId, value);

        console.log("Đã chọn xã/phường:", value, "- ID:", wardId);
      } else {
        console.error("Không tìm thấy xã/phường với tên:", value);
      }
    };
    // Thêm hàm để hiển thị địa chỉ đầy đủ với tên thay vì ID
    const displayFullAddress = (address) => {
      if (!address) return "";
      // Nếu đã có fullAddress, ưu tiên sử dụng
      if (address.fullAddress) return address.fullAddress;
      try {
        let wardName = "";
        if (address.xa) {
          // Tìm trong wardData
          const matchingWard = wardData.find(
            (w) => w.id && w.id.toString() === address.xa.toString()
          );
          if (matchingWard) {
            wardName = matchingWard.name;
          } else if (addressCache.wards.get(address.xa.toString())) {
            // Tìm trong cache
            wardName = addressCache.wards.get(address.xa.toString());
          } else {
            // Thông báo và tải thông tin nhưng đừng đợi
            console.log(
              `Không tìm thấy tên xã/phường cho ID: ${address.xa}, sẽ tải thông tin`
            );
            wardName = `${address.xa}`;
            // Gọi hàm fetch không đồng bộ
            fetchWardInfo(address.huyen, address.xa).then((name) => {
              if (name) {
                // Cập nhật cache nếu fetch thành công
                addressCache.wards.set(address.xa.toString(), name);
              }
            });
          }
        }

        // Lấy tên quận/huyện từ ID
        let districtName = "";
        if (address.huyen) {
          // Tìm trong districtData
          const matchingDistrict = districtData.find(
            (d) => d.id && d.id.toString() === address.huyen.toString()
          );
          if (matchingDistrict) {
            districtName = matchingDistrict.name;
          } else if (addressCache.districts.get(address.huyen.toString())) {
            // Tìm trong cache
            districtName = addressCache.districts.get(address.huyen.toString());
          } else {
            // Thông báo và tải thông tin nhưng đừng đợi
            console.log(
              `Không tìm thấy tên quận/huyện cho ID: ${address.huyen}, sẽ tải thông tin`
            );
            districtName = `${address.huyen}`;
            // Gọi hàm fetch không đồng bộ
            fetchDistrictInfo(address.tinh, address.huyen).then((name) => {
              if (name) {
                // Cập nhật cache nếu fetch thành công
                addressCache.districts.set(address.huyen.toString(), name);
              }
            });
          }
        }

        // Lấy tên tỉnh/thành phố từ ID
        let provinceName = "";
        if (address.tinh) {
          // Tìm trong provinceData
          const matchingProvince = provinceData.find(
            (p) => p.id && p.id.toString() === address.tinh.toString()
          );
          if (matchingProvince) {
            provinceName = matchingProvince.name;
          } else if (addressCache.provinces.get(address.tinh.toString())) {
            // Tìm trong cache
            provinceName = addressCache.provinces.get(address.tinh.toString());
          } else {
            // Không cần gọi API vì provinceData nên đã có sẵn
            console.log(
              `Không tìm thấy tên tỉnh/thành phố cho ID: ${address.tinh}`
            );
            provinceName = `${address.tinh}`;
          }
        }

        // Ghép thành địa chỉ đầy đủ
        const addressParts = [];

        if (address.diaChiCuThe && address.diaChiCuThe.trim() !== "") {
          addressParts.push(address.diaChiCuThe.trim());
        }

        if (wardName) {
          addressParts.push(wardName);
        }

        if (districtName) {
          addressParts.push(districtName);
        }

        if (provinceName) {
          addressParts.push(provinceName);
        }

        return addressParts.join(", ");
      } catch (error) {
        console.error("Lỗi khi hiển thị địa chỉ:", error);
        // Hiển thị thông tin địa chỉ cơ bản trong trường hợp lỗi
        return `${address.diaChiCuThe || ""}, ${address.xa || ""}, ${
          address.huyen || ""
        }, ${address.tinh || ""}`;
      }
    };
    // Hàm lấy thông tin quận/huyện từ API
    const fetchDistrictInfo = async (provinceId, districtId) => {
      if (!provinceId || !districtId) return null;

      try {
        // Đảm bảo provinceId là số nguyên
        let provinceIdNumber;
        if (typeof provinceId === "number") {
          provinceIdNumber = provinceId;
        } else if (!isNaN(parseInt(provinceId, 10))) {
          provinceIdNumber = parseInt(provinceId, 10);
        } else {
          // Nếu provinceId là tên, thử lấy ID từ cache
          const idFromCache = addressHelpers.getIdByName(
            "provinces",
            provinceId
          );
          if (idFromCache) {
            provinceIdNumber = idFromCache;
          } else {
            console.error(
              "Không thể chuyển đổi provinceId thành số:",
              provinceId
            );
            return null;
          }
        }

        console.log(`Gọi API lấy huyện với provinceId=${provinceIdNumber}`);

        // Gọi API để lấy danh sách huyện với provinceId là số
        const response = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceIdNumber}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          // Tìm huyện trong dữ liệu mới
          let district;

          // Đảm bảo districtId là số hoặc chuỗi số
          if (
            typeof districtId === "number" ||
            !isNaN(parseInt(districtId, 10))
          ) {
            const districtIdNumber = parseInt(districtId, 10);
            district = response.data.find(
              (d) => parseInt(d.id, 10) === districtIdNumber
            );
          } else {
            // Nếu districtId là tên, tìm trong dữ liệu API theo tên
            district = response.data.find((d) => d.name === districtId);
          }

          if (district) {
            const districtIdNumber = parseInt(district.id, 10);

            // Lưu vào cache
            addressHelpers.cacheAddressInfo(
              "districts",
              districtIdNumber,
              district.name
            );

            // Cập nhật danh sách huyện
            setDistrictData(
              response.data.map((d) => ({
                id: parseInt(d.id, 10),
                name: d.name,
                code: parseInt(d.id, 10),
                data3: [],
              }))
            );

            return district.name;
          }
        }
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin quận/huyện:`, error);
      }
      return null;
    };

    // Hàm lấy thông tin xã/phường từ API
    const fetchWardInfo = async (districtId, wardId) => {
      if (!districtId || !wardId) return null;

      try {
        // Đảm bảo districtId là số nguyên
        let districtIdNumber;
        if (typeof districtId === "number") {
          districtIdNumber = districtId;
        } else if (!isNaN(parseInt(districtId, 10))) {
          districtIdNumber = parseInt(districtId, 10);
        } else {
          // Nếu districtId là tên, thử lấy ID từ cache
          const idFromCache = addressHelpers.getIdByName(
            "districts",
            districtId
          );
          if (idFromCache) {
            districtIdNumber = idFromCache;
          } else {
            console.error(
              "Không thể chuyển đổi districtId thành số:",
              districtId
            );
            return null;
          }
        }

        console.log(`Gọi API lấy xã với districtId=${districtIdNumber}`);

        // Gọi API để lấy danh sách xã với districtId là số
        const response = await axios.get(
          `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/xa?districtId=${districtIdNumber}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          // Tìm xã trong dữ liệu mới
          let ward;

          // Đảm bảo wardId là số hoặc chuỗi số
          if (typeof wardId === "number" || !isNaN(parseInt(wardId, 10))) {
            const wardIdNumber = parseInt(wardId, 10);
            ward = response.data.find(
              (w) => parseInt(w.id, 10) === wardIdNumber
            );
          } else {
            // Nếu wardId là tên, tìm trong dữ liệu API theo tên
            ward = response.data.find((w) => w.name === wardId);
          }

          if (ward) {
            const wardIdNumber = parseInt(ward.id, 10);

            // Lưu vào cache
            addressHelpers.cacheAddressInfo("wards", wardIdNumber, ward.name);

            // Cập nhật danh sách xã nếu đúng huyện hiện tại
            const currentDistrict = district;
            if (
              currentDistrict &&
              parseInt(currentDistrict, 10) === districtIdNumber
            ) {
              setWardData(
                response.data.map((w) => ({
                  id: parseInt(w.id, 10),
                  name: w.name,
                  code: parseInt(w.id, 10),
                }))
              );
            }

            return ward.name;
          }
        }
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin xã/phường:`, error);
      }
      return null;
    };
    // Xử lý chọn địa chỉ từ danh sách có sẵn
    const handleAddressSelect = async () => {
      if (!selectedAddress || !selectedAddress.id) {
        message.error("Vui lòng chọn một địa chỉ hợp lệ.");
        return;
      }

      if (!hoaDonId) {
        message.warning("Không tìm thấy hóa đơn để cập nhật địa chỉ.");
        return;
      }

      // Tạo payload với cấu trúc đúng
      const payload = {
        diaChiId: selectedAddress.id,
        diaChiCuThe: selectedAddress.diaChiCuThe || "",
        xa: selectedAddress.xa,
        huyen: selectedAddress.huyen,
        tinh: selectedAddress.tinh,
      };

      console.log("Gửi request cập nhật địa chỉ:", payload);

      try {
        const response = await axios.put(
          `https://datn-sp25-4bee.onrender.com/api/admin/ban-hang/${hoaDonId}/update-address`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Phản hồi từ server:", response.data);
        message.success("Cập nhật địa chỉ giao hàng thành công.");

        // Cập nhật UI với địa chỉ đầy đủ đã được hiển thị
        const fullAddress = displayFullAddress(selectedAddress);
        onAddressSelect({
          ...selectedAddress,
          fullAddress: fullAddress,
        });

        // Đảm bảo có địa chỉ cụ thể và tính phí vận chuyển
        if (
          selectedAddress &&
          selectedAddress.tinh &&
          selectedAddress.huyen &&
          selectedAddress.xa
        ) {
          console.log("Tính phí vận chuyển cho địa chỉ đã chọn");
          await calculateShippingFee(selectedAddress);
        } else {
          console.warn(
            "Địa chỉ thiếu thông tin để tính phí vận chuyển",
            selectedAddress
          );
          message.warning(
            "Không thể tính phí vận chuyển do thiếu thông tin địa chỉ"
          );
        }

        // Đóng modal
        setIsModalVisible(false);
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ vào hóa đơn:", error);
        if (error.response) {
          message.error(
            `Lỗi: ${
              error.response.data.message || "Không thể cập nhật địa chỉ"
            }`
          );
        } else {
          message.error("Không thể kết nối đến server để cập nhật địa chỉ");
        }
      }
    };
    // Xác nhận địa chỉ nhập thủ công
    const handleAddressSubmit = async () => {
      // Validate input
      setAddressSubmitAttempted(true);
      
      // Với khách hàng lẻ, kiểm tra thông tin người nhận
      if (!customerId) {
        setRecipientFormSubmitted(true);
        if (!recipientInfo.tenNguoiNhan) {
          message.error("Vui lòng nhập tên người nhận");
          return;
        }
        if (!recipientInfo.soDienThoai) {
          message.error("Vui lòng nhập số điện thoại");
          return;
        }
      }
      
      if (!province || !district || !ward) {
        message.error("Vui lòng chọn đầy đủ thông tin địa chỉ");
        return;
      }
    
      const normalizedManualAddress = manualAddress ? manualAddress.trim() : "";
      if (!normalizedManualAddress) {
        message.error("Vui lòng nhập địa chỉ cụ thể");
        return;
      }
      
      setLoading(true);
    
      try {
        // Get province/district/ward names from cache or current state
        const tinhName = addressHelpers.getNameById("provinces", province);
        const huyenName = addressHelpers.getNameById("districts", district);
        const xaName = addressHelpers.getNameById("wards", ward);
        
        // Create new address object with both IDs and names
        const newAddress = {
          diaChiCuThe: normalizedManualAddress,
          tinh: province,
          huyen: district,
          xa: ward,
        };
    
        console.log("Đang lưu địa chỉ mới:", newAddress);
        
        // Prepare full address for display
        const fullAddress = `${normalizedManualAddress}, ${xaName}, ${huyenName}, ${tinhName}`;
        
        const addressWithFullDetails = {
          ...newAddress,
          id: `temp_${Math.random().toString(36).substring(2, 9)}`,
          tinhName: tinhName,
          huyenName: huyenName,
          xaName: xaName,
          fullAddress: fullAddress
        };
    
        // Update UI and call callbacks
        setSelectedAddress(addressWithFullDetails);
        
        // Truyền thông tin người nhận nếu là khách lẻ
        if (!customerId) {
          addressWithFullDetails.tenNguoiNhan = recipientInfo.tenNguoiNhan;
          addressWithFullDetails.soDienThoai = recipientInfo.soDienThoai;
        }
        
        onAddressSelect(addressWithFullDetails);
    
        if (hoaDonId) {
          await submitAddressToInvoice(addressWithFullDetails);
        }
    
        setIsNewAddressMode(false);
        setRecipientFormSubmitted(false);
        message.success("Đã lưu địa chỉ thành công");
      } catch (error) {
        console.error("Lỗi khi lưu địa chỉ:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        
        message.error(
          "Không thể lưu địa chỉ mới: " + 
          (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
        setAddressSubmitAttempted(false);
      }
    };

    const switchToNewAddressMode = () => {
      setIsNewAddressMode(true);
      setSelectedAddress(null);
      setManualAddress("");
      setProvince(null);
      setDistrict(null);
      setWard(null);
      setDistrictData([]);
      setWardData([]);
      setAddressDataLoaded(false);
      setIsManuallyEditing(false);
    };

    const mapAddressToGHNFormat = async (address) => {
      if (!address) {
        console.error("Không có địa chỉ để chuyển đổi");
        return null;
      }

      console.log("Đang chuyển đổi địa chỉ sang định dạng GHN:", address);

      // Kiểm tra các trường thông tin địa chỉ bắt buộc
      if (
        !address.huyen ||
        !address.xa ||
        !address.tinh ||
        !address.diaChiCuThe
      ) {
        console.error("Địa chỉ thiếu thông tin cần thiết:", {
          huyen: address.huyen,
          xa: address.xa,
          tinh: address.tinh,
          diaChiCuThe: address.diaChiCuThe,
        });
        message.error(
          "Địa chỉ thiếu thông tin quận/huyện, xã/phường hoặc tỉnh/thành phố"
        );
        return null;
      }

      try {
        // Bước 1: Lấy danh sách tỉnh/thành phố từ API - không cần gọi API nếu đã có provinceData
        let provinces;

        if (provinceData && provinceData.length > 0) {
          // Sử dụng dữ liệu tỉnh đã có sẵn
          provinces = provinceData;
          console.log("Sử dụng dữ liệu tỉnh có sẵn:", provinces.length);
        } else {
          // Gọi API chỉ khi cần thiết
          const provincesResponse = await axios.get(
            "https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/tinh",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          provinces = provincesResponse.data;
        }

        // Tìm tỉnh/thành phố phù hợp bằng ID nếu tỉnh là một số
        let matchingProvince;
        if (
          typeof address.tinh === "number" ||
          !isNaN(parseInt(address.tinh, 10))
        ) {
          // Nếu address.tinh là ID (số), tìm theo ID
          const provinceId = parseInt(address.tinh, 10);
          matchingProvince = provinces.find((p) => p.id === provinceId);
          console.log(
            `Tìm tỉnh theo ID ${provinceId}:`,
            matchingProvince ? "Đã tìm thấy" : "Không tìm thấy"
          );
        } else {
          // Nếu là tên, tìm theo tên
          matchingProvince = provinces.find(
            (p) =>
              normalizeString(p.name) === normalizeString(address.tinh) ||
              normalizeString(p.name).includes(normalizeString(address.tinh)) ||
              normalizeString(address.tinh).includes(normalizeString(p.name))
          );
        }

        if (!matchingProvince) {
          console.error("Không tìm thấy tỉnh/thành phố phù hợp:", address.tinh);
          return null;
        }

        console.log("Đã tìm thấy tỉnh/thành phố:", matchingProvince.name);

        // Bước 2: Lấy danh sách quận/huyện theo ID tỉnh đã tìm thấy
        if (!matchingProvince.id) {
          return null;
        }

        let districts;
        // Kiểm tra xem đã có sẵn danh sách huyện cho tỉnh này chưa
        if (
          districtData &&
          districtData.length > 0 &&
          province === matchingProvince.id
        ) {
          // Sử dụng dữ liệu quận/huyện đã có sẵn
          districts = districtData;
        } else {
          // Gọi API để lấy danh sách quận/huyện
          const districtsResponse = await axios.get(
            `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/huyen?provinceId=${matchingProvince.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          districts = districtsResponse.data;
        }

        // Tìm quận/huyện phù hợp bằng ID nếu huyện là một số
        let matchingDistrict;
        if (
          typeof address.huyen === "number" ||
          !isNaN(parseInt(address.huyen, 10))
        ) {
          // Nếu address.huyen là ID (số), tìm theo ID
          const districtId = parseInt(address.huyen, 10);
          matchingDistrict = districts.find((d) => d.id === districtId);
        } else {
          // Nếu là tên, tìm theo tên
          matchingDistrict = districts.find(
            (d) =>
              normalizeString(d.name) === normalizeString(address.huyen) ||
              normalizeString(d.name).includes(
                normalizeString(address.huyen)
              ) ||
              normalizeString(address.huyen).includes(normalizeString(d.name))
          );
        }

        if (!matchingDistrict) {
          return null;
        }

        // Bước 3: Lấy danh sách xã/phường theo ID quận/huyện đã tìm thấy
        if (!matchingDistrict.id) {
          console.error(
            "Quận/huyện tìm thấy không có ID hợp lệ:",
            matchingDistrict
          );
          return null;
        }

        let wards;
        // Kiểm tra xem đã có sẵn danh sách xã/phường cho huyện này chưa
        if (
          wardData &&
          wardData.length > 0 &&
          district === matchingDistrict.id
        ) {
          // Sử dụng dữ liệu xã/phường đã có sẵn
          wards = wardData;
        } else {
          // Gọi API để lấy danh sách xã/phường
          const wardsResponse = await axios.get(
            `https://datn-sp25-4bee.onrender.com/api/admin/hoa-don/dia-chi/xa?districtId=${matchingDistrict.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          wards = wardsResponse.data;
        }

        // Tìm xã/phường phù hợp bằng ID nếu xã là một số
        let matchingWard;
        if (
          typeof address.xa === "number" ||
          !isNaN(parseInt(address.xa, 10))
        ) {
          // Nếu address.xa là ID (số), tìm theo ID
          const wardId = parseInt(address.xa, 10);
          matchingWard = wards.find(
            (w) => w.id === wardId || w.id.toString() === address.xa.toString()
          );
        } else {
          // Nếu là tên, tìm theo tên
          matchingWard = wards.find(
            (w) =>
              normalizeString(w.name) === normalizeString(address.xa) ||
              normalizeString(w.name).includes(normalizeString(address.xa)) ||
              normalizeString(address.xa).includes(normalizeString(w.name))
          );
        }

        if (!matchingWard) {
          return null;
        }

        // Lưu vào cache để sử dụng sau này
        addressHelpers.cacheAddressInfo(
          "provinces",
          matchingProvince.id,
          matchingProvince.name
        );
        addressHelpers.cacheAddressInfo(
          "districts",
          matchingDistrict.id,
          matchingDistrict.name
        );
        addressHelpers.cacheAddressInfo(
          "wards",
          matchingWard.id,
          matchingWard.name
        );

        return {
          to_district_id: parseInt(matchingDistrict.id, 10),
          to_ward_code: matchingWard.id.toString(),
          district_name: matchingDistrict.name,
          ward_name: matchingWard.name,
          isApproximate: false,
        };
      } catch (error) {
        console.error("Lỗi khi chuyển đổi địa chỉ sang định dạng GHN:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
        }

        return null;
      }
    };

    // Xuất các hàm ra ngoài để component cha có thể gọi
    React.useImperativeHandle(ref, () => ({
      selectFirstAddress,
      applyAddressToInvoice,
      calculatingFee, // Trạng thái loading
      shippingFee, // Phí vận chuyển hiện tại
      calculateShippingFee: async () => {
        if (selectedAddress) {
          const fee = await calculateShippingFee(selectedAddress);
          // Cập nhật giá trị để component cha có thể đọc
          return fee;
        }
        return 0;
      },
      // Thêm phương thức mới để lấy phí vận chuyển hiện tại
      getShippingFee: () => shippingFee,
    }));

    useEffect(() => {
      // Cleanup function
      return () => {
        setIsManuallyEditing(false);
        setAddressDataLoaded(false);
      };
    }, []);

    return (
      <div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="default" />
            <div style={{ marginTop: 10 }}>Đang tải dữ liệu địa chỉ...</div>
          </div>
        ) : (
          <>
            {/* Hiển thị thông báo cho khách hàng lẻ */}
            {!customerId && !isNewAddressMode && !selectedAddress && (
              <Alert
                message="Chú ý"
                description="Đây là khách hàng lẻ. Vui lòng nhập địa chỉ giao hàng."
                type="info"
                showIcon
                action={
                  <Button
                    type="primary"
                    size="small"
                    onClick={switchToNewAddressMode}
                  >
                    Nhập địa chỉ
                  </Button>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Hiển thị địa chỉ đã chọn (nếu có) */}
            {selectedAddress && !isNewAddressMode && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  background: "#f9f9f9",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    <HomeOutlined style={{ marginRight: 6 }} /> Địa chỉ giao
                    hàng:
                  </div>
                  {calculatingFee && (
                    <Tag color="processing" icon={<SyncOutlined spin />}>
                      Đang tính phí...
                    </Tag>
                  )}
                </div>

                {/* Thêm phần hiển thị thông tin người nhận nếu là khách hàng lẻ */}
                {!customerId && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: "13px", marginBottom: 5 }}>
                      <UserOutlined style={{ marginRight: 5 }} />
                      <strong>Người nhận:</strong> {recipientInfo.tenNguoiNhan || "Chưa có thông tin"}
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      <PhoneOutlined style={{ marginRight: 5 }} />
                      <strong>Số điện thoại:</strong> {recipientInfo.soDienThoai || "Chưa có thông tin"}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "8px 10px",
                    background: "#fff",
                    border: "1px solid #f0f0f0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedAddress.fullAddress ||
                    displayFullAddress(selectedAddress)}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 10,
                    gap: 8,
                  }}
                >
                  {addresses.length > 1 && (
                    <Button
                      size="small"
                      onClick={() => setIsModalVisible(true)}
                      icon={<EnvironmentOutlined />}
                    >
                      Chọn địa chỉ khác
                    </Button>
                  )}
                  <Button
                    type="primary"
                    size="small"
                    onClick={switchToNewAddressMode}
                    icon={<EditOutlined />}
                  >
                    {customerId ? "Thêm địa chỉ mới" : "Thay đổi địa chỉ"}
                  </Button>
                </div>
              </div>
            )}

            {/* Nếu khách hàng có nhiều địa chỉ, hiển thị nút chọn địa chỉ */}
            {customerId &&
              addresses.length > 0 &&
              !selectedAddress &&
              !isNewAddressMode && (
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                  <EnvironmentOutlined /> Chọn địa chỉ giao hàng
                </Button>
              )}

            {/* Modal chọn địa chỉ */}
            <Modal
              title={
                <>
                  <EnvironmentOutlined /> Chọn địa chỉ giao hàng
                </>
              }
              open={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={[
                <Button
                  key="new"
                  onClick={switchToNewAddressMode}
                  icon={<PlusOutlined />}
                >
                  Thêm địa chỉ mới
                </Button>,
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Hủy
                </Button>,
                <Button
                  key="confirm"
                  type="primary"
                  onClick={handleAddressSelect}
                >
                  Xác nhận
                </Button>,
              ]}
            >
              <Select
                style={{ width: "100%" }}
                value={selectedAddress ? selectedAddress.id : undefined}
                onChange={(value) =>
                  setSelectedAddress(
                    addresses.find((addr) => addr.id === value)
                  )
                }
                placeholder="Chọn một địa chỉ"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {addresses.map((address) => {
                  const displayAddress =
                    address.fullAddress || displayFullAddress(address);
                  return (
                    <Select.Option key={address.id} value={address.id}>
                      {displayAddress}
                    </Select.Option>
                  );
                })}
              </Select>
            </Modal>

            {/* Form nhập địa chỉ mới */}
            {isNewAddressMode && (
              <div
                style={{
                  marginTop: 10,
                  padding: 16,
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <EditOutlined style={{ marginRight: 8 }} />
                  {customerId ? "Nhập địa chỉ mới:" : "Nhập địa chỉ giao hàng:"}
                  {!customerId && (
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      Khách lẻ
                    </Tag>
                  )}
                </div>

                {isNewAddressMode && !customerId && (
                  <Alert
                    message="Địa chỉ giao hàng cho khách lẻ"
                    description="Vui lòng nhập đầy đủ thông tin địa chỉ để tiếp tục thanh toán"
                    type="info"
                    showIcon
                    style={{ marginBottom: 10 }}
                  />
                )}

                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  {/* Thêm form nhập thông tin người nhận nếu là khách lẻ */}
                  {!customerId && (
                    <>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                          Người nhận <span style={{ color: "red" }}>*</span>
                        </label>
                        <Input
                          placeholder="Nhập tên người nhận"
                          name="tenNguoiNhan"
                          value={recipientInfo.tenNguoiNhan}
                          onChange={handleRecipientChange}
                          status={!recipientInfo.tenNguoiNhan && recipientFormSubmitted ? "error" : ""}
                          prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                          Số điện thoại <span style={{ color: "red" }}>*</span>
                        </label>
                        <Input
                          placeholder="Nhập số điện thoại người nhận"
                          name="soDienThoai"
                          value={recipientInfo.soDienThoai}
                          onChange={handleRecipientChange}
                          status={!recipientInfo.soDienThoai && recipientFormSubmitted ? "error" : ""}
                          prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Tỉnh/Thành phố <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      placeholder="Chọn tỉnh/thành phố"
                      onChange={handleProvinceChange}
                      value={
                        province
                          ? addressHelpers.getNameById("provinces", province)
                          : undefined
                      }
                      style={{ width: "100%" }}
                      status={!province && addressSubmitAttempted ? "error" : ""}
                    >
                      {provinceData.map((p) => (
                        <Select.Option key={p.id} value={p.name}>
                          {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Quận/Huyện <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      placeholder="Chọn quận/huyện"
                      onChange={handleDistrictChange}
                      value={
                        district
                          ? addressHelpers.getNameById("districts", district)
                          : undefined
                      }
                      style={{ width: "100%" }}
                      disabled={!province}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      loading={loading}
                      status={!district && addressSubmitAttempted ? "error" : ""}
                    >
                      {districtData.map((d) => (
                        <Select.Option key={d.id} value={d.name}>
                          {d.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Xã/Phường <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      placeholder="Chọn xã/phường"
                      onChange={handleWardChange}
                      value={
                        ward
                          ? addressHelpers.getNameById("wards", ward)
                          : undefined
                      }
                      style={{ width: "100%" }}
                      disabled={!district}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      loading={loading}
                      notFoundContent={
                        loading ? (
                          <Spin size="small" />
                        ) : (
                          "Không tìm thấy xã/phường"
                        )
                      }
                      status={!ward && addressSubmitAttempted ? "error" : ""}
                    >
                      {wardData && wardData.length > 0 ? (
                        wardData.map((w) => (
                          <Select.Option key={w.id} value={w.name}>
                            {w.name}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option disabled>Không có xã/phường</Select.Option>
                      )}
                    </Select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Số nhà, tên đường <span style={{ color: "red" }}>*</span>
                    </label>
                    <Input
                      placeholder="Nhập số nhà, tên đường cụ thể"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      status={!manualAddress && addressSubmitAttempted ? "error" : ""}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <Button onClick={() => {
                      setIsNewAddressMode(false);
                    }}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleAddressSubmit}
                      loading={loading}
                    >
                      Xác nhận địa chỉ
                    </Button>
                  </div>
                </Space>
              </div>
            )}
          </>
        )}
      </div>
    );

  }
);

export default GiaoHang;
