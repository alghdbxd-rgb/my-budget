import { ChevronDown, ChevronUp } from "lucide-react"
import { EmptyState } from "./EmptyState"

function HeaderCell({ col, sort, onSort }) {
  const isSortable = Boolean(col.sortKey)
  const active = isSortable && sort?.key === col.sortKey
  const align = col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"
  const justify = col.align === "left" ? "justify-start" : col.align === "center" ? "justify-center" : "justify-end"

  return (
    <th
      onClick={isSortable ? () => onSort(col.sortKey) : undefined}
      className={`px-4 py-2.5 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 ${align} ${
        isSortable ? "cursor-pointer select-none" : ""
      } ${col.headerClassName ?? ""}`}
    >
      <span className={`flex items-center gap-1 ${justify}`}>
        {col.label}
        {active ? dir(sort.dir) : null}
      </span>
    </th>
  )
}

function dir(d) {
  return d === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
}

// جدول List View موحّد يُستخدم بكل أقسام النظام — نفس الرأس، نفس التمرير، نفس حالة الفراغ
// columns: [{ key, label, align, sortKey, headerClassName, className, render(row) }]
export function ListView({ columns, rows, rowKey, sort, onSort, emptyIcon, emptyTitle, emptyDescription }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {rows.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                {columns.map((col) => (
                  <HeaderCell key={col.key} col={col} sort={sort} onSort={onSort} />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 ${
                        col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"
                      } ${col.className ?? ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// رأس صفحة قسم: عنوان + وصف + زر إجراء رئيسي — نفس البنية بكل صفحات النظام
export function ListPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1">
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
