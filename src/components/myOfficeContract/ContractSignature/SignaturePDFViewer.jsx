import React, { useEffect, useState } from "react";
import ContractPDFRenderer from "../../ContractPDFRenderer";
import { useSecureAxiosFactory } from "../../../hooks/useSecureAxiosFactory";

/**
 * 계약 PDF를 보여주는 컴포넌트
 * @param {Object} props
 * @param {string} props.contId - 계약 ID (서명용 PDF 조회용)
 * @param {number} [props.refreshKey] - PDF 갱신용 키 (서명 직후 강제 리렌더링 용도)
 */
export default function SignaturePDFViewer({ myRole, contId, refreshKey, overrideUrl }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");


  useEffect(() => {
    let currentUrl = null;

    const loadSignedPdf = async () => {
      if (!contId || !authAxios) return;
      setLoading(true);

      try {
        // ✅ overrideUrl이 존재하면, 그걸 바로 보여줌
        if (overrideUrl) {
          currentUrl = overrideUrl;
          setPdfUrl(currentUrl);
          return;
        }
        const response = await authAxios.post("pdf/download", {
          contId
          , role: myRole
          , _method: "GET"
        });

        const base64String = response?.base64;
        if (!base64String) throw new Error("PDF base64 응답 없음");

        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        currentUrl = URL.createObjectURL(blob);
        setPdfUrl(currentUrl);
      } catch (err) {
        console.error("❌ PDF 파일 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSignedPdf();

    return () => {
      if (currentUrl && !overrideUrl) URL.revokeObjectURL(currentUrl); // 메모리 누수 방지
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId, refreshKey, overrideUrl]);

  return (
    <div>
      {loading || !pdfUrl ? (
        <p className="text-gray-400 text-center text-sm">PDF를 불러오는 중입니다...</p>
      ) : (
        <ContractPDFRenderer file={pdfUrl} />
      )}
    </div>
  );
}
