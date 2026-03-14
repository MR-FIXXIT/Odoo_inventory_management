// Account endpoints
export const AUTH = {
  LOGIN: '/account/token/',
  REFRESH: '/account/token/refresh/',
  VERIFY: '/account/token/verify/',
  REGISTER: '/account/register/',
  LOAD_USER: '/account/users/',
  LOGOUT: '/account/logout/',
  OTP_REQUEST: '/account/otp-request/',
  PASSWORD_RESET_CONFIRM: '/account/password-reset/confirm/',
};

// Inventory endpoints
export const INVENTORY = {
  PRODUCTS: '/api/inventory/products/',
  PRODUCT_DETAIL: (id) => `/api/inventory/products/${id}/`,
};

// Manufacturing endpoints
export const MANUFACTURING = {
  WORKCENTERS: '/api/manufacturing/workcenters/',
  WORKCENTER_DETAIL: (id) => `/api/manufacturing/workcenters/${id}/`,
  BOMS: '/api/manufacturing/boms/',
  BOM_DETAIL: (id) => `/api/manufacturing/boms/${id}/`,
  BOM_ADD_ITEM: (id) => `/api/manufacturing/boms/${id}/items/`,
  MOS: '/api/manufacturing/manufacturing-orders/',
  MO_DETAIL: (id) => `/api/manufacturing/manufacturing-orders/${id}/`,
  WORK_ORDERS: '/api/manufacturing/work-orders/',
  WORK_ORDER_DETAIL: (id) => `/api/manufacturing/work-orders/${id}/`,
  WORK_ORDER_STATUS: (id) => `/api/manufacturing/work-orders/${id}/status/`,
};

// Analytics endpoints
export const ANALYTICS = {
  OVERVIEW: '/api/analytics/overview/',
};
