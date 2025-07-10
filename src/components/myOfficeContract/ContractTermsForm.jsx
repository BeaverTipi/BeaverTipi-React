import ContractPartyLoader from "./ContractPartyLoader";
import ContractFileUpLoader from "./ContractFileUpLoader";
import ContractPDFLoader from "./ContractPDFLoader";
import ComponentCard from "../common/ComponentCard";
import { useState } from "react";

function ContractTermsForm({ selectedListing, onBack }) {
    const [uploadedFiles, setUploadedFiles] = useState([]);

  return (
    <ComponentCard
      title="📄 계약 조건 입력"
      desc="임대인, 계약서, 첨부파일을 확인 및 작성해주세요."
      className="min-h-screen"
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 계약자 정보 및 파일 업로더 */}
        <div className="col-span-1 flex flex-col gap-6 h-[700px]">
          <ContractPartyLoader selectedListing={selectedListing} />
          <ContractFileUpLoader 
            selectedListing={selectedListing}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        </div>

        {/* 우측: PDF 미리보기 */}
        <ContractPDFLoader
            selectedListing={selectedListing}
            uploadedFiles={uploadedFiles}
            onCrtExtracted={crtfNo => console.log("자격증번호 추출:", crtfNo)}
          />


      </div>
    </ComponentCard>
  );
}

export default ContractTermsForm;
