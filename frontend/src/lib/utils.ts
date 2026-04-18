import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A"; 
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return "Invalid Date"; 

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export const formatMonthForAPI = (isoMonth: string) => {
  if (!isoMonth) return undefined;

  try {
    const [year, month] = isoMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    return undefined;
  }
}

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''; 
  
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};  