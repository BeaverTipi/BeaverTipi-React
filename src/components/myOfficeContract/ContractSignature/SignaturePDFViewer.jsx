import React, { useEffect, useState } from "react";
import ContractPDFRenderer from "../../ContractPDFRenderer";
import { useSecureAxiosFactory } from "../../../hooks/useSecureAxiosFactory";
import Swal from "sweetalert2";
import { useWaitForStateChange } from "../../../hooks/useWaitForStateChange";
import { showLoadingSwal } from "../../../js/dumpSwal";
/**
 * 계약 PDF를 보여주는 컴포넌트
 * @param {Object} props
 * @param {string} props.contId - 계약 ID (서명용 PDF 조회용)
 * @param {number} [props.refreshKey] - PDF 갱신용 키 (서명 직후 강제 리렌더링 용도)
 */
export default function SignaturePDFViewer({
  myRole,
  contId,
  refreshKey,
  overrideUrl,
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nothing1, setNothing1] = useState(false);
  const [nothing2, setNothing2] = useState(false);
  const [nothing3, setNothing3] = useState(false);
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");
  const { chain } = useWaitForStateChange(() => true, true, 1000);
  const handlePdfLoading = async () => {
    await chain(
      [() => true, 2000, "[1/3] 회원의 접근 유효성을 검증합니다..."],
      [
        (nothing1) => true,
        2000,
        "[2/3] 계약 서류의 이전 서명 기록을 확인합니다...",
      ],
      [
        (nothing2) => true,
        5000,
        "[3/3] 유효한 접근입니다. 잠시만 기다려주세요...",
      ]
    );
    console.log("모든 로딩 단계 완료");
  };

  useEffect(() => {
    setNothing1(false);
    setNothing2(false);
    setNothing3(false);
    let currentUrl = null;
    handlePdfLoading();
    const loadSignedPdf = async () => {
      if (!contId || !authAxios) return;
      setLoading(true);
      setNothing1(true);

      // // ✅ 로딩창 표시
      // Swal.fire({
      //   title: "PDF 불러오는 중...",
      //   text: "잠시만 기다려주세요",
      //   allowOutsideClick: false,
      //   didOpen: () => {
      //     Swal.showLoading();
      //   },
      // });

      try {
        // ✅ overrideUrl이 존재하면, 그걸 바로 보여줌
        if (overrideUrl) {
          currentUrl = overrideUrl;
          setPdfUrl(currentUrl);
          return;
        }
        const response = await authAxios.post("pdf/download", {
          contId,
          role: myRole,
          _method: "GET",
        });

        const base64String = response?.base64;
        console.warn(
          "===<><><PDF 로드 중...>\n",
          "contId: ",
          contId,
          "\nbase64: ",
          base64String?.slice(0, 100) + "..."
        );
        if (!base64String) throw new Error("PDF base64 응답 없음");
        setNothing2(true);

        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        currentUrl = URL.createObjectURL(blob);
        setPdfUrl(currentUrl);
      } catch (err) {
        console.error("❌ PDF 파일 불러오기 실패:", err);
      } finally {
        setLoading(false);
        setNothing3(true);
      }
    };

    loadSignedPdf();
    // Swal.fire("씨발!", "서명 성공!", "info");

    return () => {
      if (currentUrl && !overrideUrl) URL.revokeObjectURL(currentUrl); // 메모리 누수 방지
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId, refreshKey, overrideUrl]);

  return (
    <div>
      {loading || !pdfUrl ? (
        <p className="text-gray-400 text-center text-sm">
          PDF를 불러오는 중입니다...
        </p>
      ) : (
        <ContractPDFRenderer file={pdfUrl} />
      )}
    </div>
  );
}
