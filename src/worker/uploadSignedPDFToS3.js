/**
 * 서명 완료된 PDF를 S3에 업로드하는 함수
 * @param {string} contId - 계약 ID
 * @param {Blob} signedPdfBlob - 서명된 PDF Blob
 * @returns {Promise<string | null>} - 업로드된 파일 URL 또는 null
 */
export async function uploadSignedPDFToS3(contId, signedPdfBlob) {
  const fileName = `contract-${contId}-signed.pdf`;
  const formData = new FormData();
  formData.append("file", signedPdfBlob, fileName);
  formData.append("dir", "signed");
  formData.append("sourceRef", "CONTRACT");
  formData.append("sourceId", contId);
  formData.append("docTypeCd", "SIGNED_PDF");

  try {
    const response = await fetch("/rest/file/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ S3 업로드 성공:", result.fileUrl);
      return result.fileUrl;
    } else {
      console.warn("⚠️ 업로드 실패:", result.message);
      return null;
    }
  } catch (err) {
    console.error("❌ S3 업로드 오류", err);
    return null;
  }
}
