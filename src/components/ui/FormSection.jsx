// عنوان القسم بأي فورم — بنفس أسلوب ERPNext (Section Break): تسمية رمادية صغيرة بالأعلى
export function SectionLabel({ children }) {
  return (
    <span className="text-[11px] font-bold tracking-wide text-slate-400 dark:text-slate-500">{children}</span>
  )
}

// قسم كامل بفورم: عنوان + محتوى، تُستخدم بكل الفورمات عشان تبقى كلها بنفس البنية
export function FormSection({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

// خط فاصل بين أقسام الفورم
export function FormDivider() {
  return <div className="border-t border-slate-100 dark:border-slate-800" />
}

// صف أزرار الحفظ/الإلغاء أسفل كل فورم — نفس الشكل بكل مكان بالنظام
export function ModalFooter({ children }) {
  return (
    <div className="mt-1 flex items-center justify-start gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      {children}
    </div>
  )
}
