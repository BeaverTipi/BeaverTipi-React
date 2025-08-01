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
  { page: 0, key: "check", x: 110, y: 625 },
  { page: 0, key: "listingLeaseAmt", x: 330, y: 430 },
  { page: 0, key: "listingDeposit", x: 236, y: 411 },
  { page: 0, key: "middlePayment", x: 236, y: 390 },
  { page: 0, key: "balancePayment", x: 240, y: 370 },
  { page: 0, key: "listingLeaseAmtKorean", x: 121, y: 430 },
  { page: 0, key: "listingDepositKorean", x: 122, y: 410 },
  { page: 0, key: "middlePaymentKorean", x: 122, y: 391 },
  { page: 0, key: "balancePaymentKorean", x: 120, y: 372 },
  { page: 0, key: "listingLeaseMKorean", x: 121, y: 353 },
  { page: 0, key: "managementTotal", x: 352, y: 333 },
  { page: 0, key: "managementTotalKorean", x: 222, y: 334 },
  { page: 0, key: "management1", x: 290, y: 296 },
  { page: 0, key: "management2", x: 531, y: 297 },
  { page: 0, key: "management3", x: 291, y: 280 },
  { page: 0, key: "management4", x: 534, y: 279 },
  { page: 0, key: "management5", x: 291, y: 262 },
  { page: 0, key: "management6", x: 533, y: 262 },
  { page: 0, key: "management7", x: 293, y: 247 },
  { page: 0, key: "management8", x: 533, y: 246 },
  { page: 0, key: "management1Korean", x: 201, y: 294 },
  { page: 0, key: "management2Korean", x: 446, y: 293 },
  { page: 0, key: "management3Korean", x: 196, y: 279 },
  { page: 0, key: "management4Korean", x: 444, y: 276 },
  { page: 0, key: "management5Korean", x: 198, y: 262 },
  { page: 0, key: "management6Korean", x: 445, y: 262 },
  { page: 0, key: "management7Korean", x: 198, y: 245 },
  { page: 0, key: "management8Korean", x: 444, y: 246 },
  { page: 0, key: "managementOther", x: 114, y: 209 },


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
