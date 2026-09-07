export const STATUS_MAP = {
  draft: { label: 'مسودة', tone: 'gray' },
  new: { label: 'مستلمة', tone: 'teal' },
  in_review: { label: 'قيد المراجعة الطبية', tone: 'orange' },
  ready: { label: 'جاهزة', tone: 'green' },
  reassigned: { label: 'أُعيد توجيهها', tone: 'orange' },
  escalated: { label: 'مُصعَّدة', tone: 'red' },
}

export function statusInfo(status) {
  return STATUS_MAP[status] || { label: status, tone: 'gray' }
}

export function timeAgo(ts) {
  if (!ts) return '—'
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'الآن'
  if (min < 60) return `منذ ${min} د`
  const h = Math.floor(min / 60)
  if (h < 24) return `منذ ${h} س`
  const d = Math.floor(h / 24)
  return `منذ ${d} يوم`
}

export function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' })
}
