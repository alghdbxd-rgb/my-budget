export function validateStep1(a = {}) {
  const errors = {}
  if (!a.age) errors.age = 'الرجاء إدخال العمر'
  if (!a.gender) errors.gender = 'الرجاء اختيار الجنس'
  if (!a.region) errors.region = 'الرجاء اختيار المحافظة'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateStep2(a = {}) {
  const errors = {}
  if (!a.complaintId) errors.complaintId = 'الرجاء اختيار الشكوى الرئيسية'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateStep3(a = {}) {
  const errors = {}
  if (a.painLevel === undefined || a.painLevel === null) errors.painLevel = 'الرجاء تحديد شدة الألم'
  if (!a.duration) errors.duration = 'الرجاء اختيار مدة الأعراض'
  if (a.swelling === undefined) errors.swelling = 'الرجاء تحديد وجود تورّم من عدمه'
  if (a.fever === undefined) errors.fever = 'الرجاء تحديد وجود حرارة من عدمه'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateStep4() {
  // الصور اختيارية حسب المواصفات (حتى 3 صور)، لا يوجد حد أدنى إلزامي
  return { valid: true, errors: {} }
}
