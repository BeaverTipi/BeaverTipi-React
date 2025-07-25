import { PDFDocument } from "pdf-lib";

/**
 * base64 이미지 서명을 지정된 위치에 삽입하여 새로운 PDF Blob 반환
 * @param {string} base64Image - PNG 형식의 서명 이미지 (data URL)
 * @param {Object} signerInfo - 서명자 정보 (mbrId, role 등 포함)
 * @param {Uint8Array} originalPdfBytes - 기존 PDF 파일 (서명 전)
 * @returns {Blob} - 서명된 PDF Blob
 */
export async function insertSignatureToPDF(base64Image, signerInfo, originalPdfBytes) {
  const { role } = signerInfo;

  const coord = {
    LESSEE: { page: 0, x: 100, y: 150 },
    LESSOR: { page: 0, x: 100, y: 100 },
    AGENT: { page: 0, x: 100, y: 50 },
  }[role];

  if (!coord) {
    console.warn("서명 좌표 정보 없음:", role);
    return null;
  }

  try {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const pages = pdfDoc.getPages();
    const page = pages[coord.page];

    // 🖼️ base64Image → PNG 형식 이미지 삽입
    const pngImageBytes = await fetch(base64Image).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const imgDims = pngImage.scale(0.5); // 필요시 사이즈 조절
    page.drawImage(pngImage, {
      x: coord.x,
      y: coord.y,
      width: imgDims.width,
      height: imgDims.height,
    });

    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes], { type: "application/pdf" });

  } catch (err) {
    console.error("❌ PDF 서명 삽입 실패", err);
    return null;
  }
}