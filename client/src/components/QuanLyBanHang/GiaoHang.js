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
  MinusCircleOutlined,
  SyncOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import useDebounceFunction from "../../hooks/useDebounceFunction";

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
    const [recipientName, setRecipientName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    useEffect(() => {
      if (isModalVisible && isNewAddressMode) {
        setAddressDataLoaded(false);
        setDistrictData([]);
        setWardData([]);
      }
    }, [isModalVisible, isNewAddressMode]);

    // Sửa useEffect theo dõi thay đổi customerId và hoaDonId
    // Sửa lại trong useEffect
    useEffect(() => {
      // Clear all address data when customer changes
      setSelectedAddress(null);
      setManualAddress("");
      setProvince(null);
      setDistrict(null);
      setWard(null);
      setDistrictData([]);
      setWardData([]);
      setAddressDataLoaded(false);
      setIsManuallyEditing(false);
      setRecipientName("");
      setPhoneNumber("");
    
      if (customerId) {
        // Reset to default view for registered customers
        setIsNewAddressMode(false);
        fetchCustomerAddresses(customerId);
        console.log("Đang tải địa chỉ cho khách hàng ID:", customerId);
      } else {
        // For anonymous customers, always go to new address mode
        setAddresses([]);
        setIsNewAddressMode(true);
        console.log("Khách hàng lẻ: chuyển sang chế độ nhập địa chỉ mới");
      }
    }, [customerId, hoaDonId]);

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
// Kiểm tra loại hóa đơn trước khi tính phí
  try {
    const invoiceResponse = await axios.get(
      `http://localhost:8080/api/admin/hoa-don/${hoaDonId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    
    const invoiceData = invoiceResponse.data;
    
    // Nếu không phải loại giao hàng (loaiHoaDon !== 3), trả về phí 0
    if (invoiceData && invoiceData.loaiHoaDon !== 3) {
      console.log("Không tính phí vận chuyển cho đơn hàng tại quầy");
      return 0;
    }
  } catch (error) {
    console.warn("Không thể kiểm tra loại hóa đơn, vẫn tiếp tục tính phí:", error);
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
          };
        }

        console.log("Gửi request tính phí vận chuyển:", payload);

        // Gọi API tính phí
        const response = await axios.post(
          `http://localhost:8080/api/admin/hoa-don/phi-van-chuyen`,
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
        return 30000; // Giá mặc định
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
          `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
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
    // Improve the resetAddressState method to be more thorough
    const resetAddressState = (forceAnonymous = null, contactInfo = null) => {
      // Use explicit parameter if provided, otherwise use customerId
      const isAnonymous = forceAnonymous !== null ? forceAnonymous : !customerId;
      
      console.log(`[GiaoHang] Resetting address state for ${isAnonymous ? 'anonymous' : 'registered'} customer, invoice ID: ${hoaDonId}`);
      
      // Reset all UI state
      setSelectedAddress(null);
      setManualAddress("");
      setProvince(null);
      setDistrict(null); 
      setWard(null);
      setDistrictData([]);
      setWardData([]);
      setAddressDataLoaded(false);
      setIsManuallyEditing(false);
      
      // Reset recipient information based on provided contact info or clear it
      if (contactInfo && contactInfo.recipientName) {
        setRecipientName(contactInfo.recipientName);
      } else {
        setRecipientName("");
      }
      
      if (contactInfo && contactInfo.phoneNumber) {
        setPhoneNumber(contactInfo.phoneNumber);
      } else {
        setPhoneNumber("");
      }
      
      // Reset validation state
      setAddressSubmitAttempted(false);
      
      // Set address mode based on customer type - ALWAYS open new address form for anonymous customers
      setIsNewAddressMode(isAnonymous);
      setAddresses([]);
      
      // Clear all stored address data for this invoice
      if (hoaDonId) {
        const customerTypeSuffix = isAnonymous ? '_anon' : '_reg';
        const allKeysToRemove = [
          `last_applied_address_${hoaDonId}`,
          `submitted_address_${hoaDonId}${customerTypeSuffix}`,
          `invoice_address_${hoaDonId}${customerTypeSuffix}`,
          `first_address_${hoaDonId}`,
          `selected_address_${hoaDonId}${customerTypeSuffix}`,
          `selected_address_${hoaDonId}`,
          `new_order_${hoaDonId}`
        ];
        
        allKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        });
      }
      
      // Load customer addresses only if non-anonymous and customerId exists
      if (!isAnonymous && customerId) {
        setTimeout(() => {
          fetchCustomerAddresses(customerId);
        }, 200);
      }
    };
    const loadAddressFromInvoice = async (invoiceId, isAnonymous = false, recipientName = "", phoneNumber = "") => {
      if (!invoiceId) return false;
      
      console.log(`[GiaoHang] Loading address for invoice ${invoiceId}, isAnonymous: ${isAnonymous}`);
      
      try {
        setLoading(true);
        
        // Đối với khách lẻ được chuyển sang giao hàng, hiển thị form nhập mới ngay lập tức
        if (isAnonymous) {
          setIsNewAddressMode(true);
          setSelectedAddress(null);
          
          // Pre-populate recipient info if provided
          if (recipientName) setRecipientName(recipientName);
          if (phoneNumber) setPhoneNumber(phoneNumber);
          
          return true;
        }
        
        // Always reset address state first when loading a new address
        setSelectedAddress(null);
        
        // Use customer-specific storage key
        const storageKeySuffix = isAnonymous ? '_anon' : '_reg';
        const cacheKey = `invoice_address_${invoiceId}${storageKeySuffix}`;
        const storedAddressJson = localStorage.getItem(cacheKey);
        
        // If we have cached data and it's valid, use it
        if (storedAddressJson) {
          try {
            const cachedAddress = JSON.parse(storedAddressJson);
            if (cachedAddress && cachedAddress.tinh && cachedAddress.huyen && cachedAddress.xa) {
              console.log("[GiaoHang] Using cached address data", cachedAddress);
              
              // Make sure the formatted address is included
              if (!cachedAddress.fullAddress) {
                cachedAddress.fullAddress = addressHelpers.formatAddress(cachedAddress);
              }
              
              setSelectedAddress(cachedAddress);
              onAddressSelect(cachedAddress);
              return true;
            }
          } catch (e) {
            console.error("[GiaoHang] Error parsing cached address:", e);
          }
        }
        
        // If no valid cached data, fetch from API
        console.log(`[GiaoHang] Fetching address from API for invoice ${invoiceId}`);
        const addressDetailsResponse = await axios.get(
          `http://localhost:8080/api/admin/ban-hang/${invoiceId}/dia-chi-chi-tiet`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
    
        const addressDetails = addressDetailsResponse.data;
        console.log("[GiaoHang] API returned address details:", addressDetails);
        
        // If API returns valid address data
        if (addressDetails && addressDetails.tinh) {
          // Create full address object
          const fullAddress = {
            id: null, // May be null for anonymous customers
            diaChiCuThe: addressDetails.diaChiCuThe || "",
            xa: addressDetails.xa,
            huyen: addressDetails.huyen,
            tinh: addressDetails.tinh,
            tenNguoiNhan: addressDetails.tenNguoiNhan || recipientName || "",
            soDienThoai: addressDetails.soDienThoai || phoneNumber || "",
            fullAddress: `${addressDetails.diaChiCuThe ? addressDetails.diaChiCuThe + ", " : ""}${addressDetails.xa}, ${addressDetails.huyen}, ${addressDetails.tinh}`
          };
          
          console.log("[GiaoHang] Created full address object:", fullAddress);
          
          // Cache this address for future reference
          localStorage.setItem(cacheKey, JSON.stringify(fullAddress));
          
          // Update state and notify parent
          setSelectedAddress(fullAddress);
          setIsNewAddressMode(false);
          onAddressSelect(fullAddress);
          
          return true;
        } else {
          console.log("[GiaoHang] No valid address data found, switching to new address mode");
          setIsNewAddressMode(true);
          
          // Set recipient info if provided
          if (recipientName) setRecipientName(recipientName);
          if (phoneNumber) setPhoneNumber(phoneNumber);
        }
      } catch (error) {
        console.error("[GiaoHang] Error loading invoice address:", error);
        setIsNewAddressMode(isAnonymous);
        return false;
      } finally {
        setLoading(false);
      }
      
      return false;
    };
    
    // Update useImperativeHandle to expose updated methods
        React.useImperativeHandle(ref, () => ({
      selectFirstAddress,
      applyAddressToInvoice,
      calculatingFee,
      shippingFee,
      calculateShippingFee: async (address) => {
        if (address) {
          return await calculateShippingFee(address);
        } else if (selectedAddress) {
          return await calculateShippingFee(selectedAddress);
        }
        return 0;
      },
      getShippingFee: () => shippingFee,
      resetAddressState,
      loadAddressFromInvoice
    }));
    // 1. Trong useEffect theo dõi hoaDonId, thêm code reset form hoàn toàn khi chuyển tab
    useEffect(() => {
      // Reset when hoaDonId changes (i.e., switching to a new order or creating one)
      if (hoaDonId) {
        // Reset form completely when changing tabs
        setSelectedAddress(null);
        setManualAddress("");
        setProvince(null);
        setDistrict(null);
        setWard(null);
        setDistrictData([]);
        setWardData([]);
        setAddressDataLoaded(false);
        setIsManuallyEditing(false);

        const isNewOrder =
          sessionStorage.getItem(`new_order_${hoaDonId}`) === "true";

        // If it's a newly created order or when switching tabs
        if (isNewOrder) {
          resetAddressState();
          setIsNewAddressMode(customerId ? false : true);
        } else {
          // Nếu là đơn hàng đã có, sẽ tải lại địa chỉ trong phương thức khác
          // KHÔNG gọi fetchCustomerAddresses hay fetchAnonymousInvoiceAddress ở đây
          // Sẽ được gọi từ BanHang.js thông qua ref khi cần thiết
        }
        }
      
    }, [hoaDonId]);

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
          `http://localhost:8080/api/admin/khach_hang/diaChi/${id}`,
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
                `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
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
            `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
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
    // Update the applyAddressToInvoice function to be more selective
    const applyAddressToInvoice = async () => {
      // Nếu không có địa chỉ được chọn hoặc không có hoaDonId, không thể áp dụng
      if (!selectedAddress || !hoaDonId) {
        console.log("Không thể áp dụng: Thiếu địa chỉ hoặc hoaDonId");
        return;
      }
    
      // Add a check to prevent redundant updates
      // Keep track of the last successfully applied address for this invoice
      const lastAppliedAddressKey = `last_applied_address_${hoaDonId}`;
      const lastAppliedAddressData = sessionStorage.getItem(lastAppliedAddressKey);
      
      const currentAddressData = JSON.stringify({
        id: selectedAddress.id,
        diaChiCuThe: selectedAddress.diaChiCuThe,
        xa: selectedAddress.xa,
        huyen: selectedAddress.huyen,
        tinh: selectedAddress.tinh,
        tenNguoiNhan: selectedAddress.tenNguoiNhan,
        soDienThoai: selectedAddress.soDienThoai
      });
      
      // If the address is the same as the last one applied, don't update
      if (lastAppliedAddressData === currentAddressData) {
        console.log("Địa chỉ không thay đổi, bỏ qua cập nhật");
        return null;
      }
    
      try {
        // Tạo đối tượng địa chỉ
        const addressData = {
          id: selectedAddress.id,
          diaChiCuThe: selectedAddress.diaChiCuThe,
          xa: selectedAddress.xa,
          huyen: selectedAddress.huyen,
          tinh: selectedAddress.tinh,
          tenNguoiNhan: selectedAddress.tenNguoiNhan || "",
          soDienThoai: selectedAddress.soDienThoai || "",
        };
    
        // Gửi địa chỉ lên API để cập nhật hóa đơn
        const result = await submitAddressToInvoice(addressData);
    
        if (result) {
          // Store the successfully applied address in session storage
          sessionStorage.setItem(lastAppliedAddressKey, currentAddressData);
          console.log("Đã áp dụng địa chỉ vào hóa đơn:", result);
        }
        
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
        return null;
      }
      
      // Validate complete address data
      if (!addressData.tinh || !addressData.huyen || !addressData.xa || !addressData.diaChiCuThe) {
        message.error("Thông tin địa chỉ không đầy đủ, vui lòng nhập lại");
        return null;
      }
    
      // For anonymous customers, validate contact information
      if (!customerId && (!addressData.tenNguoiNhan || !addressData.soDienThoai)) {
        message.error("Vui lòng nhập tên người nhận và số điện thoại");
        return null;
      }
    
      // Use a more stringent key that includes customer type
      const storageKeySuffix = customerId ? '_reg' : '_anon';
      const addressKey = `submitted_address_${hoaDonId}${storageKeySuffix}`;
      const previousSubmission = localStorage.getItem(addressKey);
      
      // Create a normalized representation for comparison
      const currentSubmission = JSON.stringify({
        id: addressData.id || null,
        diaChiCuThe: addressData.diaChiCuThe,
        xa: addressData.xa,
        huyen: addressData.huyen,
        tinh: addressData.tinh,
        tenNguoiNhan: addressData.tenNguoiNhan || "",
        soDienThoai: addressData.soDienThoai || "",
        customerId: customerId || "anonymous" // Include customer info for better tracking
      });
      
      if (previousSubmission === currentSubmission) {
        console.log("Bỏ qua cập nhật địa chỉ trùng lặp");
        return null; // Skip duplicate submission
      }
    
      try {
        console.log(`Đang cập nhật địa chỉ cho hóa đơn ${hoaDonId}:`, addressData);
    
        // Create payload with properly typed values
        const payload = {
          diaChiId: addressData.id || null,
          diaChiCuThe: addressData.diaChiCuThe,
          xa: addressData.xa,
          huyen: addressData.huyen,
          tinh: addressData.tinh,
          tenNguoiNhan: addressData.tenNguoiNhan || "",
          soDienThoai: addressData.soDienThoai || "",
          customerId: customerId || null // Add customerId to payload to help server distinguish
        };
    
        const response = await axios.put(
          `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/update-address`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        // Kiểm tra phản hồi từ server xem địa chỉ có thực sự được cập nhật hay không
        const wasUpdated = response.data && response.data.updated === true;
        
        // Store successful submission to prevent duplicates regardless of server update
        localStorage.setItem(addressKey, currentSubmission);
        
        console.log("Phản hồi từ server:", response.data);
        
        // QUAN TRỌNG: BỎ message.success ở đây để tránh thông báo trùng lặp
        // Chỉ log ra console để debug
        if (wasUpdated) {
          console.log("Cập nhật thông tin giao hàng thành công.");
        } else {
          console.log("Không có sự thay đổi địa chỉ trên server.");
        }
        
        return response.data;
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ giao hàng:", error);
    
        if (error.response) {
          message.error("Lỗi từ server: " + (error.response.data?.message || "Không thể cập nhật địa chỉ"));
        } else {
          message.error("Không thể kết nối đến server");
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
            "http://localhost:8080/api/admin/hoa-don/dia-chi/tinh",
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
          `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceId}`,
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
          `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${districtId}`,
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
        // Get ward name
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
        
        // Build the full address
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
        
        // If we couldn't build a proper address, return a warning message
        if (addressParts.length < 2) {
          console.warn("[GiaoHang] Could not build a complete address:", address);
          return "Địa chỉ không đầy đủ hoặc không hợp lệ";
        }
        
        return addressParts.join(", ");
      } catch (error) {
        console.error("[GiaoHang] Error displaying address:", error);
        return "Lỗi hiển thị địa chỉ";
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
          `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${provinceIdNumber}`,
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
          `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${districtIdNumber}`,
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
        // Add this function to preload all address data at component mount
    const preloadAddressData = useCallback(async () => {
      try {
        console.log("[GiaoHang] Preloading all address data for cache...");
        
        // Load provinces if not already loaded
        if (provinceData.length === 0) {
          const provincesResponse = await axios.get(
            "http://localhost:8080/api/admin/hoa-don/dia-chi/tinh",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          // Cache all province data
          provincesResponse.data.forEach(province => {
            addressHelpers.cacheAddressInfo("provinces", province.id, province.name);
          });
          
          // For each province, preload districts
          for (const province of provincesResponse.data.slice(0, 10)) { // Limit to first 10 to avoid too many requests
            try {
              const districtsResponse = await axios.get(
                `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${province.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              
              // Cache district data
              districtsResponse.data.forEach(district => {
                addressHelpers.cacheAddressInfo("districts", district.id, district.name);
              });
              
              // For the first few districts, preload wards
              for (const district of districtsResponse.data.slice(0, 3)) {
                try {
                  const wardsResponse = await axios.get(
                    `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${district.id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    }
                  );
                  
                  // Cache ward data
                  wardsResponse.data.forEach(ward => {
                    addressHelpers.cacheAddressInfo("wards", ward.id, ward.name);
                  });
                } catch (error) {
                  console.error(`[GiaoHang] Error preloading wards for district ${district.id}:`, error);
                }
              }
            } catch (error) {
              console.error(`[GiaoHang] Error preloading districts for province ${province.id}:`, error);
            }
          }
        }
        
        console.log("[GiaoHang] Address cache preloading completed");
      } catch (error) {
        console.error("[GiaoHang] Error during address preloading:", error);
      }
    }, [provinceData.length]);
    
    // Call this function once when component mounts
    useEffect(() => {
      preloadAddressData();
    }, []); // Empty dependencies means this runs once on mount
    // Xử lý chọn địa chỉ từ danh sách có sẵn        
    // Xác nhận địa chỉ nhập thủ công
    const handleAddressSubmit = async () => {
      // Validate input
      setAddressSubmitAttempted(true);
      if (!province || !district || !ward) {
        message.error("Vui lòng chọn đầy đủ thông tin địa chỉ");
        return;
      }
    
      const normalizedManualAddress = manualAddress ? manualAddress.trim() : "";
      if (!normalizedManualAddress) {
        message.error("Vui lòng nhập địa chỉ cụ thể");
        return;
      }
    
      // For anonymous customers, validate contact information
      if (!customerId) {
        if (!recipientName.trim()) {
          message.error("Vui lòng nhập tên người nhận");
          return;
        }
    
        if (!phoneNumber.trim()) {
          message.error("Vui lòng nhập số điện thoại");
          return;
        }
    
        // Simple phone number validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber.trim())) {
          message.error("Số điện thoại không hợp lệ (cần 10 số)");
          return;
        }
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
          // Luôn thêm thông tin người nhận và SĐT, bất kể là khách hàng lẻ hay có tài khoản
          tenNguoiNhan: recipientName ? recipientName.trim() : "",
          soDienThoai: phoneNumber ? phoneNumber.trim() : ""
        };

        // Add contact information for anonymous customers
        if (!customerId) {
          newAddress.tenNguoiNhan = recipientName.trim();
          newAddress.soDienThoai = phoneNumber.trim();
        }

        console.log("Đang lưu địa chỉ mới:", newAddress);

        let savedAddress;
        if (customerId) {
          // For registered customers, save address to database
          const response = await axios.post(
            `http://localhost:8080/api/admin/khach_hang/diaChi`,
            {
              khachHangId: customerId,
              diaChi: {
                diaChiCuThe: normalizedManualAddress,
                tinh: province,
                huyen: district,
                xa: ward,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("Phản hồi từ server sau khi lưu địa chỉ:", response.data);
          savedAddress = response.data;

          // Refresh address list to update UI
          await fetchCustomerAddresses(customerId);
        } else {
          // For guest customers, create temporary address with contact info
          savedAddress = {
            ...newAddress,
            id: `temp-${Math.random().toString(36).substring(2, 11)}`,
          };
        }

        // Prepare full address for display
        const fullAddress = `${normalizedManualAddress}, ${xaName}, ${huyenName}, ${tinhName}`;

        const addressWithFullDetails = {
          ...savedAddress,
          tinhName: tinhName,
          huyenName: huyenName,
          xaName: xaName,
          fullAddress: fullAddress,
          tenNguoiNhan: recipientName ? recipientName.trim() : "", // Thêm thông tin này vào đối tượng
          soDienThoai: phoneNumber ? phoneNumber.trim() : ""      // Thêm thông tin này vào đối tượng
        };

        // Update UI and call callbacks
        setSelectedAddress(addressWithFullDetails);
        onAddressSelect(addressWithFullDetails);

        if (hoaDonId) {
          // Call API to update invoice address
          await submitAddressToInvoice(addressWithFullDetails);
          console.log("Tự động tính phí vận chuyển sau khi cập nhật địa chỉ...");
      try {
        setCalculatingFee(true);
        const fee = await calculateShippingFee(addressWithFullDetails);
        console.log(`Đã tính phí vận chuyển: ${fee.toLocaleString('vi-VN')} VND`);
        
        // Notify parent component of shipping fee update
        if (onShippingFeeUpdate && typeof onShippingFeeUpdate === 'function') {
          onShippingFeeUpdate(fee);
        
        }
      } catch (shippingError) {
        console.error("Lỗi khi tính phí vận chuyển:", shippingError);
      } finally {
        setCalculatingFee(false);
      }
    }
        setIsNewAddressMode(false);
        message.success("Đã lưu thông tin giao hàng thành công");
      } catch (error) {
        console.error("Lỗi khi lưu địa chỉ:", error);
        console.error("Chi tiết lỗi:", error.response?.data);

        message.error(
          "Không thể lưu thông tin giao hàng: " +
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
            "http://localhost:8080/api/admin/hoa-don/dia-chi/tinh",
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
            `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${matchingProvince.id}`,
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
            `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${matchingDistrict.id}`,
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

    // Update the useImperativeHandle to include the enhanced methods
    React.useImperativeHandle(ref, () => ({
      selectFirstAddress,
      applyAddressToInvoice,
      calculatingFee,
      shippingFee,
      calculateShippingFee: async () => {
        if (selectedAddress) {
          return await calculateShippingFee(selectedAddress);
        }
        return 0;
      },
      getShippingFee: () => shippingFee,
      resetAddressState,
      loadAddressFromInvoice // Load address from invoice with customer type awareness
    }));
    useEffect(() => {
      // Cleanup function
      return () => {
        setIsManuallyEditing(false);
        setAddressDataLoaded(false);
      };
    }, []);

    // Wrap the address selection with debounce
    const debouncedAddressSelect = useDebounceFunction((address) => {
      if (onAddressSelect) {
        onAddressSelect(address);
      }
    }, 300);

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
                description="Đây là khách hàng lẻ. Vui lòng nhập thông tin người nhận và địa chỉ giao hàng."
                type="info"
                showIcon
                action={
                  <Button
                    type="primary"
                    size="small"
                    onClick={switchToNewAddressMode}
                  >
                    Nhập thông tin
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
                    <HomeOutlined style={{ marginRight: 6 }} /> Thông tin giao
                    hàng:
                  </div>
                  {calculatingFee && (
                    <Tag color="processing" icon={<SyncOutlined spin />}>
                      Đang tính phí...
                    </Tag>
                  )}
                </div>

                {!customerId && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Người nhận:</strong>{" "}
                    {selectedAddress.tenNguoiNhan || "Chưa có tên"}
                    {selectedAddress.soDienThoai &&
                      ` - SĐT: ${selectedAddress.soDienThoai}`}
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
                    {customerId ? "Thêm địa chỉ mới" : "Thay đổi thông tin"}
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
      onClick={async () => {
        // Call applyAddressToInvoice directly if an address is selected
        if (selectedAddress) {
          try {
            setCalculatingFee(true);
            // Áp dụng địa chỉ vào hóa đơn
            const result = await applyAddressToInvoice(selectedAddress);
            
            // Tự động tính phí vận chuyển sau khi chọn địa chỉ
            if (result && typeof calculateShippingFee === 'function') {
              try {
                const fee = await calculateShippingFee(selectedAddress);
                console.log(`Đã tính phí vận chuyển: ${fee} cho địa chỉ ${selectedAddress.id}`);
                
                // Thông báo đã cập nhật phí vận chuyển
                if (typeof onShippingFeeUpdate === 'function') {
                  onShippingFeeUpdate(fee);
                }
              } catch (feeError) {
                console.error("Lỗi khi tính phí vận chuyển:", feeError);
              }
            }
          } catch (error) {
            console.error("Lỗi khi áp dụng địa chỉ:", error);
            message.error("Không thể áp dụng địa chỉ vào hóa đơn");
          } finally {
            setCalculatingFee(false);
            setIsModalVisible(false);
          }
        } else {
          message.warning("Vui lòng chọn một địa chỉ");
        }
      }}
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
                  {customerId
                    ? "Nhập địa chỉ mới:"
                    : "Nhập thông tin giao hàng:"}
                  {!customerId && (
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      Khách lẻ
                    </Tag>
                  )}
                </div>
                {isNewAddressMode && !customerId && (
                  <Alert
                    message="Thông tin giao hàng cho khách lẻ"
                    description="Vui lòng nhập đầy đủ thông tin người nhận và địa chỉ để tiếp tục thanh toán"
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
                  {/* Show recipient name and phone number fields for anonymous customers */}
                  {!customerId && (
                    <>
                      <div>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Tên người nhận <span style={{ color: "red" }}>*</span>
                        </label>
                        <Input
                          placeholder="Nhập tên người nhận hàng"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          status={
                            !recipientName && addressSubmitAttempted
                              ? "error"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Số điện thoại <span style={{ color: "red" }}>*</span>
                        </label>
                        <Input
                          placeholder="Nhập số điện thoại người nhận"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          status={
                            !phoneNumber && addressSubmitAttempted
                              ? "error"
                              : ""
                          }
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
                      status={
                        !province && addressSubmitAttempted ? "error" : ""
                      }
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
                      status={
                        !district && addressSubmitAttempted ? "error" : ""
                      }
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
                        <Select.Option disabled>
                          Không có xã/phường
                        </Select.Option>
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
                      status={
                        !manualAddress && addressSubmitAttempted ? "error" : ""
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <Button
                      onClick={() => {
                        setIsNewAddressMode(false);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleAddressSubmit}
                      loading={loading}
                    >
                      Xác nhận thông tin
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