// src/components/ContractSample/StandardLeaseForm/FillPdfStandardLeaseForm.js

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// PDF 필드 매핑 정보 (샘플 ID 고정이라 여기에 직접 넣어도 OK)
const FIELD_MAP = [
  { page: 0, key: "listingAdd", x: 105, y: 691 },
  { page: 0, key: "listingLand", x: 165, y: 675 },
  { page: 0, key: "listingAdd2", x: 165, y: 658 },
  { page: 0, key: "listingAdd2", x: 105, y: 640 },
  { page: 0, key: "listingLandArea", x: 543, y: 675 },
  { page: 0, key: "listingExArea", x: 550, y: 658 },
  { page: 0, key: "listingGrArea", x: 550, y: 640 },
  { page: 0, key: "startDateYear", x: 160, y: 581 },
  { page: 0, key: "startDateMonth", x: 188, y: 581 },
  { page: 0, key: "startDateDay", x: 208, y: 581 },
  ////////////////////
  // { page: 2, key: "lessorName", x: 120, y: 700 },
  // { page: 2, key: "lessorPhone", x: 100, y: 680 },
  // { page: 2, key: "lesseeName", x: 100, y: 660 },
  // { page: 2, key: "lesseePhone", x: 100, y: 340 },
  // { page: 0, key: "listingDeposit", x: 100, y: 620 },
  // { page: 0, key: "listingLeaseM", x: 100, y: 600 },
  // { page: 0, key: "startDate", x: 100, y: 580 },
  // { page: 0, key: "endDate", x: 100, y: 560 },
  // 페이지 1
  // { page: 1, key: "specialTerms", x: 80, y: 500 },
  // 추가 필드 계속 여기에 정의...
];


export async function fillPdfStandardLeaseFormWithFormData(formData, pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("/assets/fonts/NanumGothic.ttf").then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();

  for (const field of FIELD_MAP) {
    const { page, key, x, y } = field;
    const value = formData[key];

    if (value && pages[page]) {
      pages[page].drawText(String(value), {
        x,
        y,
        size: 11,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}
