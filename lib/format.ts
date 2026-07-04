export function formatBytes(bytes: number | bigint | string): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : Number(bytes)
  if (n === 0) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

export function formatSpeed(bps: number): string {
  if (!bps || bps === 0) return '0 B/s'
  if (bps < 1024) return `${bps.toFixed(0)} B/s`
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / 1024 / 1024).toFixed(1)} MB/s`
}

export function formatDate(d: string | Date | null): string {
  if (!d) return 'ไม่เคย'
  return new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

export function pct(p: number): string {
  return `${(p * 100).toFixed(1)}%`
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING:     'รอ',
  ANALYZING:   'กำลังวิเคราะห์',
  DOWNLOADING: 'กำลังโหลด',
  PAUSED:      'หยุดชั่วคราว',
  COMPLETED:   'เสร็จแล้ว',
  ERROR:       'ผิดพลาด',
  UP_TO_DATE:  'อัพเดทแล้ว',
  ACTIVE:      'ใช้งาน',
  MAINTENANCE: 'บำรุงรักษา',
  DISABLED:    'ปิดใช้งาน',
}
