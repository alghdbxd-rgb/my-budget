// تخمين التصنيف المناسب اعتماداً على كلمات مفتاحية بالملاحظة.
// كل عنصر: كلمات تلمّح لاسم التصنيف (nameHints) + كلمات تظهر بالملاحظة (noteKeywords)
const CONCEPTS = {
  expense: [
    {
      nameHints: ["مواصلات", "نقل", "وقود", "محروقات", "سياره", "سيارة"],
      noteKeywords: [
        "تكسي", "تكس", "باص", "وقود", "بنزين", "كاز", "موصلات", "نقل",
        "اجره", "اجرة", "سياره", "سيارة", "دراجه", "دراجة",
      ],
    },
    {
      nameHints: ["طعام", "اكل", "أكل", "مطعم", "مطاعم"],
      noteKeywords: [
        "مطعم", "مطاعم", "اكل", "أكل", "غداء", "غدا", "عشاء", "عشا",
        "فطور", "فطار", "كافيه", "قهوه", "قهوة", "وجبة", "وجبه",
        "شاورما", "برجر", "بيتزا",
      ],
    },
    {
      nameHints: ["فواتير", "خدمات"],
      noteKeywords: ["فاتوره", "فاتورة", "كهرباء", "مويه", "مياه", "ماي", "اشتراك", "غاز"],
    },
    {
      nameHints: ["صحة", "علاج"],
      noteKeywords: ["دكتور", "طبيب", "دواء", "صيدليه", "صيدلية", "مستشفى", "علاج", "فحص", "اسنان"],
    },
    {
      nameHints: ["تعليم"],
      noteKeywords: ["مدرسة", "مدرسه", "جامعة", "جامعه", "قسط دراسي", "كتب", "كورس", "دوره", "دورة"],
    },
    {
      nameHints: ["تسوق", "ملابس"],
      noteKeywords: ["ملابس", "تسوق", "حذاء", "قميص"],
    },
    {
      nameHints: ["ترفيه"],
      noteKeywords: ["سينما", "رحلة", "رحله", "لعبة", "لعبه", "ملاهي", "خروجه", "خروجات"],
    },
    {
      nameHints: ["اتصالات", "انترنت"],
      noteKeywords: ["رصيد", "موبايل", "سم كارد", "اشتراك نت", "زين", "اسياسيل", "كورك", "انترنت", "نت"],
    },
    {
      nameHints: ["سكن", "ايجار"],
      noteKeywords: ["ايجار", "إيجار", "بيت", "سكن", "دار"],
    },
    {
      nameHints: ["عائلة", "عائله"],
      noteKeywords: ["اهل", "ابويه", "ابوي", "امي", "اخوي", "اختي", "عيلتي", "عائله", "عائلة"],
    },
  ],
  income: [
    {
      nameHints: ["راتب"],
      noteKeywords: ["راتب", "معاش"],
    },
    {
      nameHints: ["عمل حر", "دخل إضافي", "دخل اضافي"],
      noteKeywords: ["فريلانس", "عمل حر", "سلفه", "سلفة", "اضافي", "إضافي", "مشروع"],
    },
    {
      nameHints: ["هدايا", "مساعدات"],
      noteKeywords: ["هدية", "هديه", "مساعدة", "مساعده", "عيدية", "عيديه"],
    },
  ],
}

function normalize(text) {
  return (text || "").trim().toLowerCase()
}

export function guessCategoryId(note, type, categories) {
  const text = normalize(note)
  if (!text) return null

  const concepts = CONCEPTS[type] ?? []
  const candidates = categories.filter((c) => c.type === type)

  for (const concept of concepts) {
    const hasKeyword = concept.noteKeywords.some((kw) => text.includes(kw))
    if (!hasKeyword) continue

    const match = candidates.find((cat) =>
      concept.nameHints.some((hint) => cat.name.includes(hint)),
    )
    if (match) return match.id
  }

  return null
}
