export const generarCodigoProv = () => {
  const caracteresAleatorios = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
  return 'OC-' + caracteresAleatorios;
};
