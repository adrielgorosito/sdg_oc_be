export const generarCodigoProv = () => {
  return 'PRO-' + Math.random().toString(36).substring(2, 15);
};
