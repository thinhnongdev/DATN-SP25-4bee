import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Input,
  Button,
  message,
  Space,
  Divider,
  Tag,
  Spin,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "axios";

// Cập nhật định nghĩa component để sử dụng forwardRef
const GiaoHang = React.forwardRef(
  ({ customerId, hoaDonId, onAddressSelect,onShippingFeeUpdate }, ref) => {
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
    const [isNewAddressMode, setIsNewAddressMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);
    const [calculatingFee, setCalculatingFee] = useState(false);
    const [districtMap, setDistrictMap] = useState({}); // Map tên district -> district_id của GHN
    const [wardMap, setWardMap] = useState({}); // Map tên ward -> ward code của GHN
    // Thêm state mới để lưu trữ danh sách quận/huyện và xã/phường cho địa chỉ đã chọn
    const [addressList, setAddressList] = useState({
      districts: [],
      wards: [],
    });
    // Cập nhật useEffect để phản ứng khi customerId thay đổi
    useEffect(() => {
      if (customerId) {
        // Đặt lại trạng thái khi customerId thay đổi
        setSelectedAddress(null);
        setIsNewAddressMode(false);

        // Tải địa chỉ của khách hàng mới
        fetchCustomerAddresses(customerId);
        console.log("Đang tải địa chỉ cho khách hàng ID:", customerId);
      } else {
        // Reset địa chỉ khi không có khách hàng
        setAddresses([]);
        setSelectedAddress(null);
        setIsNewAddressMode(true);
      }
    }, [customerId]);

    useEffect(() => {
      if (!customerId) {
        setAddresses([]);
        setSelectedAddress(null);
        setIsNewAddressMode(false);
      }
    }, [customerId]);

    // Thêm useEffect để đảm bảo các danh sách quận/huyện và xã/phường được tải đúng khi có selectedAddress
    useEffect(() => {
      const loadAddressData = async () => {
        if (selectedAddress && provinceData.length > 0) {
          console.log("Đang tải dữ liệu địa chỉ chi tiết:", selectedAddress);

          // Set giá trị cơ bản
          setManualAddress(selectedAddress.moTa || "");
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

    const calculateShippingFee = async (addressOrDistrictId, wardCodeOrNull = null) => {
      if (!hoaDonId) {
        console.error("Thiếu hoaDonId để tính phí vận chuyển");
        return 0;
      }
    
      setCalculatingFee(true);
      try {
        // Thông tin cửa hàng lấy được từ log của server
        const shopInfo = {
          district_id: 3440,
          ward_code: "13007"
        };
        
        let payload;
        
        // Kiểm tra nếu tham số đầu tiên là đối tượng địa chỉ
        if (typeof addressOrDistrictId === 'object') {
          console.log("Đang tính phí vận chuyển cho địa chỉ:", addressOrDistrictId);
          
          // Chuyển đổi địa chỉ sang định dạng GHN
          const ghnAddress = await mapAddressToGHNFormat(addressOrDistrictId);
          
          if (!ghnAddress) {
            // Sử dụng thông tin cửa hàng đã xác minh
            payload = {
              to_district_id: shopInfo.district_id,
              to_ward_code: shopInfo.ward_code,
              service_type_id: 2
            };
          } else {
            payload = {
              to_district_id: ghnAddress.to_district_id,
              to_ward_code: ghnAddress.to_ward_code,
              service_type_id: 2
            };
          }
        } else {
          payload = {
            to_district_id: addressOrDistrictId || shopInfo.district_id,
            to_ward_code: wardCodeOrNull || shopInfo.ward_code,
            service_type_id: 2
          };
        }
    
        console.log("Gửi request tính phí vận chuyển:", payload);
    
        // Gọi API tính phí
        const response = await axios.post(
          `http://localhost:8080/api/admin/hoa-don/phi-van-chuyen`,
          payload,
          {headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }}
        );
    
        console.log("Phí vận chuyển từ API:", response.data);
    
        // Đảm bảo phí vận chuyển là một số
        let fee = typeof response.data === 'number' ? response.data : 0;
        
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
          `http://localhost:8080/api/admin/hoa-don/${hoaDonId}/cap-nhat-phi-van-chuyen`,
          { fee: fee },
          {headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }}
        );
    
        console.log("Kết quả cập nhật phí vận chuyển:", response.data);
        
        // Cập nhật state local để hiển thị
        setShippingFee(fee);
        
        // Thông báo thành công
        message.success(
          `Đã cập nhật phí vận chuyển: ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(fee)}`
        );
        
        // Cập nhật state của component cha nếu có callback
        if (typeof onShippingFeeUpdate === 'function') {
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
          message.error("Không thể kết nối đến server để cập nhật phí vận chuyển");
        }
        
        return false;
      }
    };
    // Cập nhật useEffect cho selectedAddress để tương thích với cách xử lý trong DetailForm.js
    useEffect(() => {
      if (selectedAddress && provinceData.length > 0) {
        // Set giá trị cơ bản
        setManualAddress(selectedAddress.moTa || "");
        setProvince(selectedAddress.tinh || null);

        // Tìm tỉnh/thành phố trong danh sách
        const matchingProvince = provinceData.find(
          (p) => p.name === selectedAddress.tinh
        );

        if (matchingProvince) {
          // Cập nhật danh sách quận/huyện
          setDistrictData(matchingProvince.data2 || []);
          setDistrict(selectedAddress.huyen || null);

          // Tìm quận/huyện trong danh sách
          const matchingDistrict = matchingProvince.data2.find(
            (d) => d.name === selectedAddress.huyen
          );

          if (matchingDistrict) {
            // Cập nhật danh sách xã/phường
            setWardData(matchingDistrict.data3 || []);
            setWard(selectedAddress.xa || null);
          }
        }
      }
    }, [selectedAddress, provinceData]);

    useEffect(() => {
      if (customerId && addresses.length === 1) {
        const singleAddress = addresses[0];
        setSelectedAddress(singleAddress);

        // Gửi địa chỉ lên BanHang.js
        onAddressSelect({
          id: singleAddress.id,
          moTa: singleAddress.moTa,
          xa: singleAddress.xa,
          huyen: singleAddress.huyen,
          tinh: singleAddress.tinh,
          fullAddress: `${singleAddress.moTa ? singleAddress.moTa + ", " : ""}${
            singleAddress.xa
          }, ${singleAddress.huyen}, ${singleAddress.tinh}`,
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
    // Hàm chuẩn hóa chuỗi (loại bỏ dấu và khoảng trắng thừa)
    const normalizeString = (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .trim()
        .replace(/\s+/g, " "); // Loại bỏ khoảng trắng thừa
    };

    // Hàm tìm kiếm gần đúng cải tiến
    const findClosestMatch = (name, list) => {
      if (!name || !list || !list.length) return null;

      name = name.trim();

      // Chuẩn hóa tên để so sánh
      const normalizedName = name.toLowerCase();
      const normalizedNoAccent = normalizeString(name);

      // 1. Tìm kiếm chính xác trước
      const exactMatch = list.find(
        (item) => item.name.toLowerCase().trim() === normalizedName
      );
      if (exactMatch) {
        console.log(
          `Tìm thấy kết quả khớp chính xác: "${exactMatch.name}" cho "${name}"`
        );
        return exactMatch;
      }

      // 2. Tìm kiếm không phân biệt dấu
      const noAccentMatch = list.find(
        (item) => normalizeString(item.name) === normalizedNoAccent
      );
      if (noAccentMatch) {
        console.log(
          `Tìm thấy kết quả khớp không dấu: "${noAccentMatch.name}" cho "${name}"`
        );
        return noAccentMatch;
      }

      // 3. Tìm kiếm chứa từ khóa
      const containsMatch = list.find(
        (item) =>
          normalizeString(item.name).includes(normalizedNoAccent) ||
          normalizedNoAccent.includes(normalizeString(item.name))
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
          normalizedNoAccent.length,
          itemNormalized.length
        );

        let i = 0;
        while (i < minLength && normalizedNoAccent[i] === itemNormalized[i]) {
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

    // Sử dụng hàm này trong useEffect cho selectedAddress
    useEffect(() => {
      if (selectedAddress && provinceData.length > 0) {
        // Set giá trị cơ bản
        setManualAddress(selectedAddress.moTa || "");

        // Tìm tỉnh/thành phố gần đúng
        const matchingProvince = findClosestMatch(
          selectedAddress.tinh,
          provinceData
        );

        if (matchingProvince) {
          setProvince(matchingProvince.name);
          setDistrictData(matchingProvince.data2);

          // Tìm quận/huyện gần đúng
          const matchingDistrict = findClosestMatch(
            selectedAddress.huyen,
            matchingProvince.data2
          );

          if (matchingDistrict) {
            setDistrict(matchingDistrict.name);
            setWardData(matchingDistrict.data3);

            // Tìm xã/phường gần đúng
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
    }, [selectedAddress, provinceData]);
    // Tách hàm lấy địa chỉ để có thể gọi lại khi cần
    const fetchCustomerAddresses = async (id) => {
      if (!id) return;

      setLoading(true);
      try {
        // Lấy danh sách địa chỉ của khách hàng
        const response = await axios.get(
          `http://localhost:8080/api/admin/khach_hang/diaChi/${id}`,
          {headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }},
        );
        console.log("API trả về danh sách địa chỉ:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Chuẩn hóa dữ liệu địa chỉ
          const normalizedAddresses = response.data.map((addr) => ({
            ...addr,
            tinh: addr.tinh?.trim(),
            huyen: addr.huyen?.trim(),
            xa: addr.xa?.trim(),
            moTa: addr.moTa?.trim(),
          }));

          setAddresses(normalizedAddresses);

          // Kiểm tra xem hóa đơn đã có địa chỉ lưu trữ chưa
          if (hoaDonId) {
            try {
              // Dùng API dia-chi-chi-tiet để lấy thông tin địa chỉ đã lưu
              const addressDetailsResponse = await axios.get(
                `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/dia-chi-chi-tiet`,
                {headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                }},
              );

              const addressDetails = addressDetailsResponse.data;
              console.log("Thông tin địa chỉ từ hóa đơn:", addressDetails);

              // Nếu có thông tin địa chỉ
              if (addressDetails && Object.keys(addressDetails).length > 0) {
                // Tìm địa chỉ tương ứng trong danh sách
                const matchedAddress = findMatchingAddress(
                  normalizedAddresses,
                  addressDetails
                );

                if (matchedAddress) {
                  console.log("Đã tìm thấy địa chỉ khớp:", matchedAddress);
                  // Đặt địa chỉ đã lưu làm địa chỉ được chọn
                  setSelectedAddress(matchedAddress);

                  // Tạo đối tượng địa chỉ đầy đủ
                  const addressToDisplay = {
                    id: matchedAddress.id,
                    moTa: matchedAddress.moTa,
                    xa: matchedAddress.xa,
                    huyen: matchedAddress.huyen,
                    tinh: matchedAddress.tinh,
                    fullAddress: `${
                      matchedAddress.moTa ? matchedAddress.moTa + ", " : ""
                    }${matchedAddress.xa}, ${matchedAddress.huyen}, ${
                      matchedAddress.tinh
                    }`,
                  };

                  // Gửi địa chỉ lên BanHang.js để hiển thị
                  onAddressSelect(addressToDisplay);
                }
              }
            } catch (error) {
              console.error("Lỗi khi lấy thông tin địa chỉ hóa đơn:", error);
            }
          }
        } else {
          // Không có địa chỉ, chuyển sang chế độ thêm mới
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
          (addressDetails.moTa ? address.moTa === addressDetails.moTa : true)
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
            {headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }},
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
                moTa: matchedAddress.moTa,
                xa: matchedAddress.xa,
                huyen: matchedAddress.huyen,
                tinh: matchedAddress.tinh,
                fullAddress: `${
                  matchedAddress.moTa ? matchedAddress.moTa + ", " : ""
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
            moTa: firstAddress.moTa,
            xa: firstAddress.xa,
            huyen: firstAddress.huyen,
            tinh: firstAddress.tinh,
            fullAddress: `${firstAddress.moTa ? firstAddress.moTa + ", " : ""}${
              firstAddress.xa
            }, ${firstAddress.huyen}, ${firstAddress.tinh}`,
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
        moTa: firstAddress.moTa,
        xa: firstAddress.xa,
        huyen: firstAddress.huyen,
        tinh: firstAddress.tinh,
        fullAddress: `${firstAddress.moTa ? firstAddress.moTa + ", " : ""}${
          firstAddress.xa
        }, ${firstAddress.huyen}, ${firstAddress.tinh}`,
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
          moTa: selectedAddress.moTa,
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

      try {
        console.log(
          `Đang cập nhật địa chỉ cho hóa đơn ${hoaDonId}:`,
          addressData
        );

        const payload = {
          diaChiId: addressData.id,
          moTa: addressData.moTa,
          xa: addressData.xa,
          huyen: addressData.huyen,
          tinh: addressData.tinh,
        };

        console.log("Gửi request cập nhật địa chỉ:", payload);

        const response = await axios.put(
          `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/update-address`,
          payload,
          { headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json" } }
        );

        console.log("Phản hồi từ server:", response.data);
        message.success("Cập nhật địa chỉ giao hàng thành công.");
        return response.data;
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ giao hàng:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          // message.error(`Lỗi cập nhật: ${error.response.data.message || "Lỗi không xác định"}`);
        } else {
          // message.error("Không thể kết nối đến server.");
        }
        return null;
      }
    };

    // Lấy dữ liệu tỉnh/thành phố từ API
    useEffect(() => {
      axios
        .get("http://localhost:5000/data")
        .then((response) => {
          if (Array.isArray(response.data)) {
            setProvinceData(response.data);
          } else {
            console.error(
              "Dữ liệu tỉnh/thành phố không hợp lệ:",
              response.data
            );
            setProvinceData([]);
          }
        })
        .catch(() => {
          console.error("Lỗi khi lấy dữ liệu tỉnh/thành phố");
          setProvinceData([]);
        });
    }, []);

    // Hiển thị địa chỉ đã chọn và nút mở dialog chọn địa chỉ khác
    const renderSelectedAddressInfo = () => {
      if (!selectedAddress) return null;

      // Tạo chuỗi địa chỉ đầy đủ nếu có
      const fullAddressDisplay =
        selectedAddress.fullAddress ||
        `${selectedAddress.moTa ? selectedAddress.moTa + ", " : ""}${
          selectedAddress.xa
        }, ${selectedAddress.huyen}, ${selectedAddress.tinh}`;

      return (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            border: "1px solid #f0f0f0",
            borderRadius: 4,
          }}
        >
          <div style={{ fontWeight: "bold" }}>Địa chỉ giao hàng:</div>
          <div>{fullAddressDisplay}</div>
          {addresses.length > 1 && (
            <Button
              type="link"
              onClick={() => setIsModalVisible(true)}
              style={{ padding: 0 }}
            >
              Đổi địa chỉ khác
            </Button>
          )}
          <Button
            type="link"
            onClick={switchToNewAddressMode}
            style={{ padding: 0, marginLeft: addresses.length > 1 ? 10 : 0 }}
          >
            Thêm địa chỉ mới
          </Button>
        </div>
      );
    };

    // Xử lý chọn tỉnh/thành phố
    const handleProvinceChange = (value) => {
      setProvince(value);

      // Reset các giá trị phụ thuộc
      setDistrict(null);
      setWard(null);

      // Cập nhật danh sách quận/huyện
      const selectedProvince = provinceData.find((p) => p.name === value);
      if (selectedProvince && selectedProvince.data2) {
        console.log(
          `Đã tìm thấy tỉnh/thành phố: ${value} với ${selectedProvince.data2.length} quận/huyện`
        );
        setDistrictData(selectedProvince.data2);
      } else {
        console.log(
          `Không tìm thấy dữ liệu quận/huyện cho tỉnh/thành phố: ${value}`
        );
        setDistrictData([]);
      }
    };

    // Xử lý chọn quận/huyện
    const handleDistrictChange = (value) => {
      setDistrict(value);

      // Reset giá trị phụ thuộc
      setWard(null);

      // Cập nhật danh sách xã/phường
      const selectedDistrict = districtData.find((d) => d.name === value);
      if (selectedDistrict && selectedDistrict.data3) {
        console.log(
          `Đã tìm thấy quận/huyện: ${value} với ${selectedDistrict.data3.length} xã/phường`
        );
        setWardData(selectedDistrict.data3);
      } else {
        console.log(
          `Không tìm thấy dữ liệu xã/phường cho quận/huyện: ${value}`
        );
        setWardData([]);
      }
    };

    // Xử lý chọn xã/phường
    const handleWardChange = (value) => {
      setWard(value);
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

      const payload = {
        diaChiId: selectedAddress.id,
        moTa: selectedAddress.moTa,
        xa: selectedAddress.xa,
        huyen: selectedAddress.huyen,
        tinh: selectedAddress.tinh,
      };

      console.log("Gửi request cập nhật địa chỉ:", payload);

      try {
        const response = await axios.put(
          `http://localhost:8080/api/admin/ban-hang/${hoaDonId}/update-address`,
          
          payload,
          { headers: 
      
            { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json" } }
        );

        console.log("Phản hồi từ server:", response.data);
        message.success("Cập nhật địa chỉ giao hàng thành công.");

        // Cập nhật UI
        onAddressSelect({
          ...selectedAddress,
          fullAddress: `${
            selectedAddress.moTa ? selectedAddress.moTa + ", " : ""
          }${selectedAddress.xa}, ${selectedAddress.huyen}, ${
            selectedAddress.tinh
          }`,
        });

        // Tính phí vận chuyển với địa chỉ đầy đủ
        await calculateShippingFee(selectedAddress);

        // Đóng modal
        setIsModalVisible(false);
      } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ vào hóa đơn:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
          message.error(
            `Lỗi cập nhật: ${
              error.response.data.message || "Lỗi không xác định"
            }`
          );
        } else {
          message.error("Không thể kết nối đến server.");
        }
      }
    };
    // Xác nhận địa chỉ nhập thủ công
    const handleAddressSubmit = async () => {
      if (!manualAddress || !province || !district || !ward) {
        message.error("Vui lòng nhập đầy đủ thông tin địa chỉ.");
        return;
      }

      const newAddress = {
        moTa: manualAddress,
        tinh: province,
        huyen: district,
        xa: ward,
        fullAddress: `${manualAddress}, ${ward}, ${district}, ${province}`,
      };

      // Nếu có customerId, lưu địa chỉ mới vào DB
      if (customerId) {
        setLoading(true);
        try {
          const response = await axios.post(
            `http://localhost:8080/api/admin/khach_hang/diaChi`,
            {
              khachHangId: customerId,
              diaChi: newAddress,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            }
          );

          message.success("Đã thêm địa chỉ mới thành công");
          const savedAddress = response.data;

          // Tạo đối tượng địa chỉ hoàn chỉnh để hiển thị
          const addressToDisplay = {
            id: savedAddress.id,
            moTa: savedAddress.moTa,
            xa: savedAddress.xa,
            huyen: savedAddress.huyen,
            tinh: savedAddress.tinh,
            fullAddress: `${savedAddress.moTa ? savedAddress.moTa + ", " : ""}${
              savedAddress.xa
            }, ${savedAddress.huyen}, ${savedAddress.tinh}`,
          };

          // Cập nhật state và gửi địa chỉ lên component cha
          setAddresses((prevAddresses) => [...prevAddresses, savedAddress]);
          setSelectedAddress(savedAddress);
          onAddressSelect(addressToDisplay);

          // Cập nhật địa chỉ vào hóa đơn nếu có hoaDonId
          if (hoaDonId) {
            await submitAddressToInvoice(addressToDisplay);

            // Tính phí vận chuyển với địa chỉ mới
            await calculateShippingFee(savedAddress);
          }

          setIsNewAddressMode(false);
        } catch (error) {
          console.error("Lỗi khi lưu địa chỉ:", error);
          message.error("Không thể lưu địa chỉ mới");
        } finally {
          setLoading(false);
        }
      } else {
        // Nếu không có customerId, chỉ cập nhật UI và hóa đơn
        const tempAddress = {
          ...newAddress,
          id: Math.random().toString(36).substr(2, 9),
        };

        setSelectedAddress(tempAddress);
        onAddressSelect(tempAddress);
        setIsNewAddressMode(false);

        // Cập nhật địa chỉ vào hóa đơn nếu có hoaDonId
        if (hoaDonId) {
          setLoading(true);
          try {
            await submitAddressToInvoice(tempAddress);
            message.info("Đã thêm địa chỉ tạm thời cho đơn hàng này.");

            // Tính phí vận chuyển với địa chỉ tạm thời
            await calculateShippingFee(tempAddress);
          } catch (error) {
            console.error(
              "Lỗi khi áp dụng địa chỉ tạm thời vào hóa đơn:",
              error
            );
            message.error("Không thể áp dụng địa chỉ cho đơn hàng.");
          } finally {
            setLoading(false);
          }
        } else {
          message.info("Đã thêm địa chỉ tạm thời.");
        }
      }
    };

    // Chuyển sang chế độ thêm địa chỉ mới

    const switchToNewAddressMode = () => {
      // Nếu đã có địa chỉ được chọn, sử dụng giá trị của nó
      if (selectedAddress) {
        setManualAddress(selectedAddress.moTa || "");
        setProvince(selectedAddress.tinh || null);

        // Nếu đã có tỉnh, cần cập nhật danh sách quận/huyện
        if (selectedAddress.tinh && provinceData.length > 0) {
          const matchingProvince = provinceData.find(
            (p) => p.name === selectedAddress.tinh
          );
          if (matchingProvince) {
            setDistrictData(matchingProvince.data2 || []);
            setDistrict(selectedAddress.huyen || null);

            // Nếu đã có huyện, cập nhật danh sách xã/phường
            if (selectedAddress.huyen) {
              const matchingDistrict = matchingProvince.data2.find(
                (d) => d.name === selectedAddress.huyen
              );
              if (matchingDistrict) {
                setWardData(matchingDistrict.data3 || []);
                setWard(selectedAddress.xa || null);
              }
            }
          }
        }
      } else {
        // Reset form fields nếu không có địa chỉ được chọn
        setManualAddress("");
        setProvince(null);
        setDistrict(null);
        setWard(null);
      }

      setIsNewAddressMode(true);
      setIsModalVisible(false);
    };

    const mapAddressToGHNFormat = async (address) => {
      if (!address) {
        console.error("Không có địa chỉ để chuyển đổi");
        return null;
      }

      console.log("Đang chuyển đổi địa chỉ sang định dạng GHN:", address);

      // Kiểm tra các trường thông tin địa chỉ bắt buộc
      if (!address.huyen || !address.xa || !address.tinh) {
        console.error("Địa chỉ thiếu thông tin cần thiết:", {
          huyen: address.huyen,
          xa: address.xa,
          tinh: address.tinh,
        });
        message.error(
          "Địa chỉ thiếu thông tin quận/huyện, xã/phường hoặc tỉnh/thành phố"
        );
        return null;
      }

      try {
        // PHƯƠNG PHÁP 1: Sử dụng API GHN để lấy thông tin chính xác
        console.log("Truy vấn API GHN để lấy thông tin chính xác");

        // Bước 1: Lấy danh sách tỉnh/thành phố từ API
        const provincesResponse = await axios.get(
          "http://localhost:8080/api/admin/hoa-don/dia-chi/tinh",
          {headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }},
        );
        const provinces = provincesResponse.data;

        // Tìm tỉnh/thành phố phù hợp
        let matchingProvince = provinces.find(
          (p) =>
            normalizeString(p.ProvinceName) === normalizeString(address.tinh) ||
            normalizeString(p.ProvinceName).includes(
              normalizeString(address.tinh)
            ) ||
            normalizeString(address.tinh).includes(
              normalizeString(p.ProvinceName)
            )
        );

        if (!matchingProvince) {
          console.error("Không tìm thấy tỉnh/thành phố phù hợp:", address.tinh);
          message.error(
            `Không tìm thấy tỉnh/thành phố "${address.tinh}" trong hệ thống GHN`
          );
          return null;
        }

        console.log(
          "Đã tìm thấy tỉnh/thành phố:",
          matchingProvince.ProvinceName
        );

        // Bước 2: Lấy danh sách quận/huyện từ API
        const districtsResponse = await axios.get(
          `http://localhost:8080/api/admin/hoa-don/dia-chi/huyen?provinceId=${matchingProvince.ProvinceID}`,
          {headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }},
        );
        const districts = districtsResponse.data;

        // Tìm quận/huyện phù hợp
        let matchingDistrict = districts.find(
          (d) =>
            normalizeString(d.DistrictName) ===
              normalizeString(address.huyen) ||
            normalizeString(d.DistrictName).includes(
              normalizeString(address.huyen)
            ) ||
            normalizeString(address.huyen).includes(
              normalizeString(d.DistrictName)
            )
        );

        if (!matchingDistrict) {
          console.error("Không tìm thấy quận/huyện phù hợp:", address.huyen);
          message.error(
            `Không tìm thấy quận/huyện "${address.huyen}" trong hệ thống GHN`
          );
          return null;
        }

        console.log("Đã tìm thấy quận/huyện:", matchingDistrict.DistrictName);

        // Bước 3: Lấy danh sách phường/xã từ API
        const wardsResponse = await axios.get(
          `http://localhost:8080/api/admin/hoa-don/dia-chi/xa?districtId=${matchingDistrict.DistrictID}`
        );
        const wards = wardsResponse.data;

        // Tìm phường/xã phù hợp
        let matchingWard = wards.find(
          (w) =>
            normalizeString(w.WardName) === normalizeString(address.xa) ||
            normalizeString(w.WardName).includes(normalizeString(address.xa)) ||
            normalizeString(address.xa).includes(normalizeString(w.WardName))
        );

        if (!matchingWard) {
          console.error("Không tìm thấy phường/xã phù hợp:", address.xa);
          message.error(
            `Không tìm thấy phường/xã "${address.xa}" trong hệ thống GHN`
          );
          return null;
        }

        console.log("Đã tìm thấy phường/xã:", matchingWard.WardName);

        // Lưu vào cache để sử dụng sau này
        setDistrictMap((prev) => ({
          ...prev,
          [address.huyen]: matchingDistrict.DistrictID,
        }));

        setWardMap((prev) => ({
          ...prev,
          [address.xa]: matchingWard.WardCode,
        }));

        return {
          to_district_id: parseInt(matchingDistrict.DistrictID, 10),
          to_ward_code: matchingWard.WardCode,
          district_name: matchingDistrict.DistrictName,
          ward_name: matchingWard.WardName,
          isApproximate: false,
        };
      } catch (error) {
        console.error("Lỗi khi chuyển đổi địa chỉ sang định dạng GHN:", error);

        if (error.response) {
          console.error("Chi tiết lỗi từ server:", error.response.data);
        }

        message.error("Lỗi khi tìm kiếm địa chỉ GHN tương ứng");
        return null;
      }
    };

    // Thêm hàm phụ trợ để tạo địa chỉ GHN dự phòng
    const createFallbackGHNAddress = (address) => {
      console.log("Sử dụng cơ chế dự phòng để tạo địa chỉ GHN cho:", address);

      // Danh sách các cặp district_id và ward_code đã xác nhận hoạt động với GHN
      const validGHNAddresses = [
        {
          district_id: 1455,
          ward_code: "21012",
          district_name: "Quận Bắc Từ Liêm",
          ward_name: "Phường Xuân Đỉnh",
        },
        {
          district_id: 1454,
          ward_code: "21009",
          district_name: "Quận Hai Bà Trưng",
          ward_name: "Phường Bạch Đằng",
        },
        {
          district_id: 1453,
          ward_code: "21008",
          district_name: "Quận Đống Đa",
          ward_name: "Phường Trung Liệt",
        },
        {
          district_id: 1452,
          ward_code: "21006",
          district_name: "Quận Cầu Giấy",
          ward_name: "Phường Dịch Vọng",
        },
        {
          district_id: 1451,
          ward_code: "21003",
          district_name: "Quận Hoàn Kiếm",
          ward_name: "Phường Hàng Trống",
        },
        {
          district_id: 1442,
          ward_code: "21001",
          district_name: "Quận Ba Đình",
          ward_name: "Phường Phúc Xá",
        },
      ];

      // Địa chỉ mặc định đã xác nhận hoạt động
      const defaultAddress = validGHNAddresses[0];

      try {
        // PHƯƠNG PHÁP 1: Thử tìm địa chỉ dựa vào provinceData
        if (provinceData.length > 0) {
          console.log("Tìm kiếm từ dữ liệu provinceData...");

          // Tìm tỉnh/thành phố gần đúng
          const matchingProvince = findClosestMatch(address.tinh, provinceData);

          if (matchingProvince) {
            console.log(
              `Tìm thấy tỉnh/thành phố tương tự: ${matchingProvince.name}`
            );

            // Tìm quận/huyện gần đúng
            const matchingDistrict = findClosestMatch(
              address.huyen,
              matchingProvince.data2 || []
            );

            if (matchingDistrict) {
              console.log(
                `Tìm thấy quận/huyện tương tự: ${matchingDistrict.name}`
              );

              // Tìm xã/phường gần đúng
              const matchingWard = findClosestMatch(
                address.xa,
                matchingDistrict.data3 || []
              );

              if (matchingWard) {
                console.log(
                  `Tìm thấy phường/xã tương tự: ${matchingWard.name}`
                );

                // Kiểm tra xem district_id và ward_code có phải là số
                const district_id = parseInt(matchingDistrict.id, 10);
                const ward_code = matchingWard.id.toString();

                if (!isNaN(district_id) && ward_code) {
                  // Lưu vào cache
                  setDistrictMap((prev) => ({
                    ...prev,
                    [address.huyen]: district_id,
                  }));

                  setWardMap((prev) => ({
                    ...prev,
                    [address.xa]: ward_code,
                  }));

                  return {
                    to_district_id: district_id,
                    to_ward_code: ward_code,
                    district_name: matchingDistrict.name,
                    ward_name: matchingWard.name,
                    isApproximate: true,
                  };
                }
              }
            }
          }
        }

        // PHƯƠNG PHÁP 2: Sử dụng danh sách đã xác nhận
        // Chọn một địa chỉ ngẫu nhiên từ danh sách đã xác nhận để tránh tập trung vào một địa điểm
        const randomIndex = Math.floor(
          Math.random() * validGHNAddresses.length
        );
        const selectedAddress = validGHNAddresses[randomIndex];

        console.log(
          "Sử dụng địa chỉ đã xác minh hoạt động với GHN:",
          selectedAddress
        );

        // Lưu vào cache để sử dụng lần sau
        setDistrictMap((prev) => ({
          ...prev,
          [address.huyen]: selectedAddress.district_id,
        }));

        setWardMap((prev) => ({
          ...prev,
          [address.xa]: selectedAddress.ward_code,
        }));

        // Hiển thị thông báo phù hợp
        message.warning(
          `Không thể xác định chính xác địa chỉ GHN. Đang sử dụng ${selectedAddress.district_name} để tính phí vận chuyển tạm thời.`,
          5
        );

        return {
          to_district_id: selectedAddress.district_id,
          to_ward_code: selectedAddress.ward_code,
          district_name: selectedAddress.district_name,
          ward_name: selectedAddress.ward_name,
          isApproximate: true,
        };
      } catch (error) {
        console.error("Lỗi khi tạo địa chỉ dự phòng:", error);

        // Trong trường hợp có lỗi, sử dụng địa chỉ mặc định đã được xác minh
        console.log("Sử dụng địa chỉ mặc định do lỗi:", defaultAddress);
        message.warning(
          "Đã xảy ra lỗi khi xác định địa chỉ. Đang sử dụng địa chỉ mặc định để tính phí vận chuyển."
        );

        return {
          to_district_id: defaultAddress.district_id,
          to_ward_code: defaultAddress.ward_code,
          district_name: defaultAddress.district_name,
          ward_name: defaultAddress.ward_name,
          isApproximate: true,
        };
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
      getShippingFee: () => shippingFee
    }));

    return (
      <div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Đang tải dữ liệu địa chỉ...
          </div>
        ) : (
          <>
            {/* Hiển thị địa chỉ đã chọn (nếu có) */}
            {selectedAddress && !isNewAddressMode && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                  background: "#f9f9f9",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Địa chỉ giao hàng:</div>
                <div>
                  {selectedAddress.fullAddress ||
                    `${
                      selectedAddress.moTa ? selectedAddress.moTa + ", " : ""
                    }${selectedAddress.xa}, ${selectedAddress.huyen}, ${
                      selectedAddress.tinh
                    }`}
                </div>
                <Space style={{ marginTop: 5 }}>
                  {addresses.length > 1 && (
                    <Button type="link" onClick={() => setIsModalVisible(true)}>
                      Chọn địa chỉ khác
                    </Button>
                  )}
                  <Button type="link" onClick={switchToNewAddressMode}>
                    Nhập địa chỉ mới
                  </Button>
                </Space>
              </div>
            )}

            {/* Nếu khách hàng có nhiều địa chỉ, hiển thị nút chọn địa chỉ */}
            {customerId &&
              addresses.length > 0 &&
              !selectedAddress &&
              !isNewAddressMode && (
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                  Chọn địa chỉ giao hàng
                </Button>
              )}

            {/* Modal chọn địa chỉ */}
            <Modal
              title="Chọn địa chỉ giao hàng"
              open={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={[
                <Button key="new" onClick={switchToNewAddressMode}>
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
              >
                {addresses.map((address) => {
                  const displayAddress =
                    address.fullAddress ||
                    `${address.moTa ? address.moTa + ", " : ""}${address.xa}, ${
                      address.huyen
                    }, ${address.tinh}`;
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
                  padding: 10,
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                  Nhập địa chỉ mới:
                </div>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    onChange={handleProvinceChange}
                    value={province}
                    style={{ width: "100%" }}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {provinceData.map((p) => (
                      <Select.Option key={p.id} value={p.name}>
                        {p.name}
                      </Select.Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Chọn quận/huyện"
                    onChange={handleDistrictChange}
                    value={district}
                    style={{ width: "100%" }}
                    disabled={!province}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {districtData.map((d) => (
                      <Select.Option key={d.id} value={d.name}>
                        {d.name}
                      </Select.Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Chọn xã/phường"
                    onChange={handleWardChange}
                    value={ward}
                    style={{ width: "100%" }}
                    disabled={!district}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {wardData.map((w) => (
                      <Select.Option key={w.id} value={w.name}>
                        {w.name}
                      </Select.Option>
                    ))}
                  </Select>

                  <Input
                    placeholder="Số nhà, tên đường"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />

                  <Space>
                    <Button onClick={() => setIsNewAddressMode(false)}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleAddressSubmit}
                      loading={loading}
                    >
                      Xác nhận địa chỉ
                    </Button>
                  </Space>
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
