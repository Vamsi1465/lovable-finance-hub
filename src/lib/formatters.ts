// Format currency in Indian Rupee format
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Format date to readable string
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Format time for last updated
export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
};

// Parse date from various formats
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try ISO format first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  
  // Try DD/MM/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try DD-MM-YYYY format
  const dashParts = dateString.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    date = new Date(parseInt(dashParts[2]), parseInt(dashParts[1]) - 1, parseInt(dashParts[0]));
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
};

// Parse amount string to number
export const parseAmount = (amountString: string): number => {
  if (typeof amountString === 'number') return amountString;
  if (!amountString) return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = amountString.toString().replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Get relative time string
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(dateString);
};
