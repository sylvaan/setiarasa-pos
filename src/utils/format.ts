/**
 * Formats a number with a dot as a thousand separator.
 * Example: 1765 -> "1.765"
 * Example: 25000 -> "25.000"
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Formats a currency value with the Rp prefix and thousand separator.
 * Example: 25000 -> "Rp 25.000"
 */
export const formatCurrency = (num: number): string => {
  return `Rp ${formatNumber(num)}`;
};
