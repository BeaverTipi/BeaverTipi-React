export async function uploadSignedPDFTemporarily(contId, role, blob) {
  const fileName = `temp/contract-${contId}-${role}.pdf`;
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("dir", "signed/temp");
  formData.append("sourceRef", "CONTRACT_TEMP");
  formData.append("sourceId", contId);
  formData.append("docTypeCd", "TEMP_SIGNED_PDF");

  try {
    const res = await fetch("/rest/file/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const result = await res.json();
    return result.fileUrl || null;
  } catch (e) {
    console.error("❌ 임시 PDF 업로드 실패", e);
    return null;
  }
}
