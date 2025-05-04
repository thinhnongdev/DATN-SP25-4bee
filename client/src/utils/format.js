import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

export const formatDate = (date) => {
  if (!date) return '';
  return moment(date).format('DD/MM/YYYY HH:mm');
};

export const formatCurrency = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatNumberWithSeparator = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(amount);
};
