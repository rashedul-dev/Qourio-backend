
export const generateTrackingId = (): string => {
  const date = new Date();

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TRK-${year}${month}${day}-${randomPart}`;
};
