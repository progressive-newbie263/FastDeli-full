// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Format full date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Validate email format
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

// Validate Vietnamese phone number
export const isValidPhone = (phone) => {
  const regex = /^(0|\+84)(\d{9,10})$/;
  return regex.test(phone);
};

// Format error message from API
export const formatErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors[0][Object.keys(error.response.data.errors[0])[0]];
  }
  
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
};