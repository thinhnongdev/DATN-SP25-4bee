import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';

let qrScanErrorCount = 0;
let lastErrorMessage = "";

const QrScanner = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      // Nếu modal đóng, dừng scanner
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      return;
    }

    // Nếu scanner chưa khởi tạo, tạo mới
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scannerRef.current.render(
        (decodedText) => {
          scannerRef.current.clear();
          scannerRef.current = null;
          qrScanErrorCount = 0;
          console.log('✅ QR Code detected:', decodedText);
          toast.success('🎉 Quét mã QR thành công!', { autoClose: 2000 });
          onScanSuccess(decodedText);
        },
        (error) => {
          qrScanErrorCount++;
          if (error.message !== lastErrorMessage || qrScanErrorCount % 50 === 0) {
            console.warn(`⚠️ QR Scan Error (${qrScanErrorCount}):`, error.message);
            lastErrorMessage = error.message;
          }
          if (qrScanErrorCount % 100 === 0) {
            toast.warn('Không tìm thấy mã QR, vui lòng thử lại.');
          }
          onScanError(error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError, isActive]);

  return <div id="reader"></div>;
};

export default QrScanner;
