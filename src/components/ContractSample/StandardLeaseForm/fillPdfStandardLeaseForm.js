// src/components/ContractSample/StandardLeaseForm/FillPdfStandardLeaseForm.js

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// PDF 필드 매핑 정보 (샘플 ID 고정이라 여기에 직접 넣어도 OK)
const FIELD_MAP = [
  { page: 0, key: "lessorName", x: 102, y: 741 },
  { page: 0, key: "lesseeName", x: 256, y: 739 },
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
  //   if (lstgTypeSale === "001") { }
  // { page: 0, key: "check", x: 465, y: 774 },
  // if (lstgTypeSale === "002") { }
  // { page: 0, key: "check", x: 464, y: 763 },
  // if (lstgTypeSale === "003") { }
  // { page: 0, key: "check", x: 519, y: 763 },
  // 추가 필드 계속 여기에 정의...
];
function getFieldMap(formData) {
  const checkBoxField = (() => {
    switch (formData.listingTypeSale) {
      case "001":
        return { page: 0, key: "check", x: 465, y: 774 }; // 전세
      case "002":
        return { page: 0, key: "check", x: 464, y: 763 }; // 월세
      case "003":
        return { page: 0, key: "check", x: 519, y: 763 }; // 매매
      default:
        return null;
    }
  })();

  return checkBoxField ? [...FIELD_MAP, checkBoxField] : FIELD_MAP;
}



export async function fillPdfStandardLeaseFormWithFormData(formData, pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch("/assets/fonts/NanumGothic.ttf").then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();

  const fieldMap = getFieldMap(formData);
  for (const field of fieldMap) {
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
