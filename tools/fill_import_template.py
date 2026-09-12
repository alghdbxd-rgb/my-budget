#!/usr/bin/env python3
"""تعبئة قالب Data Import المنزَّل من ERPNext ببيانات جاهزة.

الاستخدام:
    python3 tools/fill_import_template.py <القالب.xlsx> <القيم.csv> <الناتج.xlsx>

تسميات أعمدة القوالب تختلف بين النسخ وبين المواقع المعرّبة، فالقالب المنزَّل من
الموقع نفسه هو المرجع دائماً. تطابق الأداة أعمدة ملف القيم مع رؤوس القالب
بالاسم، وتكتب الناتج بترتيب أعمدة القالب حرفياً — الأعمدة غير المذكورة في ملف
القيم تبقى فارغة، وأي عمود في القيم لا يقابله رأس في القالب يوقف التنفيذ بدل
أن يضيع صامتاً.
"""

import csv
import sys
import unicodedata

import openpyxl


def key(label):
    """توحيد الرأس للمطابقة: تشكيل، مسافات، حالة الأحرف."""
    text = unicodedata.normalize("NFKC", str(label or "")).strip().casefold()
    return " ".join(text.split())


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        return 1
    template_path, values_path, out_path = sys.argv[1:4]

    wb = openpyxl.load_workbook(template_path)
    ws = wb.worksheets[0]
    headers = [c.value for c in ws[1]]
    index = {key(h): i for i, h in enumerate(headers) if h is not None}

    with open(values_path, encoding="utf-8-sig", newline="") as fh:
        records = list(csv.DictReader(fh))
    if not records:
        print("ملف القيم فارغ")
        return 1

    unknown = [c for c in records[0] if key(c) not in index]
    if unknown:
        print("أعمدة غير موجودة في القالب:", ", ".join(unknown))
        print("رؤوس القالب:", ", ".join(str(h) for h in headers if h))
        return 1

    for row_no, record in enumerate(records, start=2):
        for column, value in record.items():
            if value != "":
                ws.cell(row=row_no, column=index[key(column)] + 1, value=value)

    wb.save(out_path)
    print(f"{len(records)} صف -> {out_path}")
    print("الأعمدة:", ", ".join(str(h) for h in headers if h))
    return 0


if __name__ == "__main__":
    sys.exit(main())
