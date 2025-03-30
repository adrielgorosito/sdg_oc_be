const AfipUrls = {
  homo: {
    login: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
    service: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  },
  prod: {
    login: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
    service: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
  },
};

export const getLoginURL = () => {
  return process.env.NODE_ENV === 'production'
    ? AfipUrls.prod.login
    : AfipUrls.homo.login;
};

export const getServiceURL = () => {
  return process.env.NODE_ENV === 'production'
    ? AfipUrls.prod.service
    : AfipUrls.homo.service;
};
