export async function deleteTempSignedPdf(contId, role) {
  try {
    const response = await fetch(`/rest/file/delete/temp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        contId,
        role,
        sourceRef: "CONTRACT_TEMP",
        filePattern: `contract-${contId}-${role}.pdf`
      })
    });

    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error("❌ 임시 PDF 삭제 실패:", err);
    return false;
  }
}
