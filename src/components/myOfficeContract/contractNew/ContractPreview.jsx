import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import ContractPDFRenderer from "../../ContractPDFRenderer";
import Button from "../../ui/button/Button";
import pdfTemplate from "../../ContractSample/표준임대차계약서.pdf";
import { fillPdfStandardLeaseFormWithFormData } from "../../ContractSample/StandardLeaseForm/fillPdfStandardLeaseForm";
import { useContractInfo } from "../../../context/ContractInfoContext";


export default function ContractPreview({ onConfirm, onBack, onExtract }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const { contractInfo } = useContractInfo();
  useEffect(() => {
    const generatePdf = async () => {
      try {
        const response = await fetch(pdfTemplate);
        const templateBytes = await response.arrayBuffer();
        const pdfBytes = await fillPdfStandardLeaseFormWithFormData(contractInfo, templateBytes);

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const file = new File([blob], "표준임대차계약서.pdf", { type: "application/pdf" });
        const url = URL.createObjectURL(file);
        setPdfFile(file);
        setPdfUrl(url);
      } catch (err) {
        console.error("PDF 생성 ㅅ ㅣㄹ패!!!!", err);
      }
    }
    if (contractInfo) generatePdf();
  }, [contractInfo]);


  if (!contractInfo || !pdfUrl) {
    return (
      <>
        <ComponentCard
          title="📄 계약서류 프리뷰"
          onBack={onBack}>
          <div className="text-center text-gray-500 p-6">
            PDF를 생성 중입니다...
          </div>
          <div className="flex justify-end gap-3 mt-4">
          </div>
        </ComponentCard >
      </>
    );
  }

  return (
    <ComponentCard
      onBack={onBack}>
      <div className="space-y-6 p-6">
        <h2 className="text-lg font-bold">📄 계약서 미리보기</h2>
        <div>
          <ContractPDFRenderer file={pdfUrl} />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            onClick={() => onConfirm(pdfFile)}>
            다음 →
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}
