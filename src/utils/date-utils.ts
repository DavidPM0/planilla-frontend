// Utilidad para formatear fechas UTC para display en zona horaria de Perú
export const formatFechaUTC = (fechaISO: string): string => {
  if (!fechaISO) return "N/A";

  const fecha = new Date(fechaISO);

  // Usar UTC methods para evitar problemas de zona horaria
  const day = fecha.getUTCDate().toString().padStart(2, "0");
  const month = (fecha.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = fecha.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

export const formatFechaConHora = (fechaISO: string): string => {
  if (!fechaISO) return "N/A";

  const fecha = new Date(fechaISO);

  // Usar UTC methods para evitar problemas de zona horaria
  const day = fecha.getUTCDate().toString().padStart(2, "0");
  const month = (fecha.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = fecha.getUTCFullYear();
  const hour = fecha.getUTCHours().toString().padStart(2, "0");
  const minute = fecha.getUTCMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
};
