// import { Chip } from '@mui/material';

// const getStatusColor = (status) => {
//   switch (status) {
//     case 1: return '#ff9800';
//     case 2: return '#2196f3';
//     case 3: return '#673ab7';
//     case 4: return '#4caf50';
//     case 5: return '#f44336';
//     default: return '#9e9e9e';
//   }
// };

// const getStatusText = (status) => {
//   switch (status) {
//     case 1: return 'Chờ xác nhận';
//     case 2: return 'Đã xác nhận';
//     case 3: return 'Đang giao';
//     case 4: return 'Đã giao';
//     case 5: return 'Đã hủy';
//     default: return 'Không xác định';
//   }
// };

// function StatusChip({ status, type }) {
//   return (
//     <Chip
//       label={getStatusText(status)}
//       sx={{
//         backgroundColor: 'white',
//         color: getStatusColor(status),
//         border: `1px solid ${getStatusColor(status)}`
//       }}
//     />
//   );
// }

// const getTypeColor = (type) => {
//   switch (type) {
//     case 1: return '#4caf50'; // Online
//     case 2: return '#2196f3'; // Tại quầy
//     default: return '#9e9e9e';
//   }
// };

// const getTypeText = (type) => {
//   switch (type) {
//     case 1: return 'Online';
//     case 2: return 'Tại quầy';
//     default: return 'Không xác định';
//   }
// };

// function TypeChip({ type }) {
//   return (
//     <Chip
//       label={getTypeText(type)}
//       sx={{
//         backgroundColor: 'white',
//         color: getTypeColor(type),
//         border: `1px solid ${getTypeColor(type)}`
//       }}
//     />
//   );
// }

// export { StatusChip, TypeChip };
import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

const getStatusColor = (status) => {
  switch (status) {
    case 1: return '#ff9800';
    case 2: return '#2196f3';
    case 3: return '#008B8B';
    case 4: return '#673ab7';
    case 5: return '#4caf50';
    case 6: return '#f44336';
    default: return '#9e9e9e';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 1: return '#4caf50'; // Online
    case 2: return '#2196f3'; // Tại quầy
    case 3: return '#673ab7'; // Giao hàng
    default: return '#9e9e9e';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 1: return 'Chờ xác nhận';
    case 2: return 'Đã xác nhận';
    case 3: return 'Chuẩn bị giao hàng';
    case 4: return 'Đang giao';
    case 5: return 'Hoàn thành';
    case 6: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getTypeText = (type) => {
  switch (type) {
    case 1: return 'Online';
    case 2: return 'Tại quầy';
    case 3: return 'Giao hàng';
    default: return 'Không xác định';
  }
};

const lightenColor = (color, alphaValue) => {
  return alpha(color, alphaValue);
};

function StatusChip({ status, type }) {
  return (
    <Chip
      label={getStatusText(status)}
      sx={{
        backgroundColor: lightenColor(getStatusColor(status), 0.1),
        color: getStatusColor(status),
        border: `1px solid ${getStatusColor(status)}`
      }}
    />
  );
}

function TypeChip({ type }) {
  return (
    <Chip
      label={getTypeText(type)}
      sx={{
        backgroundColor: lightenColor(getTypeColor(type), 0.1),
        color: getTypeColor(type),
        border: `1px solid ${getTypeColor(type)}`
      }}
    />
  );
}

export { StatusChip, TypeChip };

