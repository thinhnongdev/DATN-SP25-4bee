import React, { useState } from "react";
import QrReader from "react-qr-scanner";
import { toast } from "react-toastify";

const QrScanner = ({ onScanSuccess, onScanError, isActive }) => {
  const [delay] = useState(300);

  const handleScan = (data) => {
    if (data) {
      console.log("QR Code detected:", data.text);
      toast.success("🎉 Quét mã QR thành công!", { autoClose: 2000 });
      onScanSuccess(data.text);
    }
  };

  const handleError = (error) => {
    console.warn("QR Scan Error:", error);
    if (onScanError) {
      onScanError(error);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
      <QrReader
        delay={delay}
        style={{ width: "100%" }}
        onError={handleError}
        onScan={handleScan}
        constraints={{
          video: { facingMode: "environment" },
        }}
      />
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Đặt mã QR vào vùng quét
      </p>
    </div>
  );
};

export default QrScanner;
