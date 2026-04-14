// Güvenli tarih parse edici: "YYYY-MM-DD" formatını timezone kaynaklı
// kaymalar olmadan doğru şekilde Gün.Ay.Yıl formatına çevirir.
const parseLocalDate = (dateString: string): { day: number; month: number; year: number } | null => {
  // ISO tarih: "2026-04-15" veya ISO datetime: "2026-04-15T..."
  const iso = dateString.split('T')[0];
  const parts = iso.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { day, month, year };
    }
  }
  return null;
};

/**
 * Tarih stringini Gün.Ay.Yıl formatına çevirir.
 * Örnek: "2026-04-15" → "15.04.2026"
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const parsed = parseLocalDate(dateString);
  if (parsed) {
    const d = String(parsed.day).padStart(2, '0');
    const m = String(parsed.month).padStart(2, '0');
    return `${d}.${m}.${parsed.year}`;
  }
  return dateString;
};

const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Tarih stringini uzun Türkçe formata çevirir.
 * Örnek: "2026-04-15" → "15 Nisan 2026"
 */
export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const parsed = parseLocalDate(dateString);
  if (parsed) {
    const monthName = TR_MONTHS[parsed.month - 1] || '';
    return `${parsed.day} ${monthName} ${parsed.year}`;
  }
  return dateString;
};

