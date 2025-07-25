import { useSecureAxiosFactory } from "../hooks/useSecureAxiosFactory";

/**
 * PDF Blob을 base64 문자열로 변환
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1]; // data:application/pdf;base64,... 제거
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function uploadSignedPDFTemporarily(contId, role, blob) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");

  try {
    const base64 = await blobToBase64(blob);

    // SignVO 구조에 맞게 구성
    const payload = {
      _method: "POST",
      contractDigitalSign: {
        contId,
        contDtSignId: null,
        contDtSignType: role, // 예: AGENT, LESSOR, LESSEE
        contDtBaseData: `data:application/pdf;base64,${base64}`,
        contDtSignDtm: new Date().toISOString(), // 서명 시간
        contDtSignHashVal: "", // 서버에서 생성할 수도 있고, 클라이언트에서 미리 만들어도 됨
        mbrCd: localStorage.getItem("mbrCd") || "TEMP", // 필요 시 실제 값 사용
        contDtSignStat: "N", // 기본값
      },
    };

    const response = await authAxios.post("/signature/upload", payload);

    if (!response?.success || !response?.fileUrl) {
      throw new Error("서버 응답에 fileUrl이 없습니다.");
    }

    return response.fileUrl;
  } catch (err) {
    console.error("❌ 임시 PDF 업로드 실패", err);
    throw new Error("임시 서명 PDF 업로드 실패");
  }
}
