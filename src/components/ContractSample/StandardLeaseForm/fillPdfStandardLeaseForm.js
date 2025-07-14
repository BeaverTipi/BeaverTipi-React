// src/components/ContractSample/StandardLeaseForm/FillPdfStandardLeaseForm.js

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function fillPdfStandardLeaseFormWithFormData(formData, pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch('/assets/fonts/NanumGothic.ttf').then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.getPages()[0];

  const draw = (label, value, x, y) => {
    if (value) {
      page.drawText(String(value), {
        x,
        y,
        size: 11,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    }
  };
  draw("임대인 이름", formData.lessorName, 100, 700);
  draw("임대인 전화", formData.lessorPhone, 100, 680);
  draw("임차인 이름", formData.lesseeName, 100, 660);
  draw("임차인 전화", formData.lesseePhone, 100, 640);
  draw("보증금", formData.contractDeposit, 100, 620);
  draw("월세", formData.monthlyRent, 100, 600);
  draw("계약 시작일", formData.startDate, 100, 580);
  draw("계약 종료일", formData.endDate, 100, 560);

  return await pdfDoc.save();
}
