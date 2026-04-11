/**
 * Format price as Chilean Pesos (CLP)
 * @param price - Numeric price value
 * @returns Formatted price string (e.g., "$19.990")
 */
export const formatCLP = (price: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Parse CLP formatted price back to number
 * @param formattedPrice - Formatted price string (e.g., "$19.990")
 * @returns Numeric price value
 */
export const parseCLP = (formattedPrice: string): number => {
  // Remove currency symbol and dots, then convert to number
  const cleanPrice = formattedPrice.replace(/[$\s.]/g, '').replace(/,/g, '.');
  return parseFloat(cleanPrice) || 0;
};
