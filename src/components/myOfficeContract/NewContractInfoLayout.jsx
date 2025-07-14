import React, { useEffect, useState } from "react";
import ContractPartyLoader from "./ContractPartyLoader";
import ContractFileUpLoader from "./ContractFileUpLoader";
import ContractPDFLoader from "./ContractPDFLoader";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";

function NewContractInfoLayout({ contractInfo, onBack, onFilesUploaded }) {
  const [uploadedFiles, setUploadedFiles] = useState(contractInfo.files || []);
  const { listing, tenancy, lessee, broker, files } = contractInfo;

  // 파일 변경 시 부모에게도 알려줌
  useEffect(() => {
    onFilesUploaded(uploadedFiles);
  }, [uploadedFiles]);

  return (
    <>
      <ComponentCard
        title="📄 새 계약 정보 등록"
        desc="임대인, 계약서, 첨부파일을 마지막으로 확인해주세요."
        className="min-h-screen"
        onBack={onBack}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 계약자 정보 및 파일 업로더 */}
          <div className="col-span-1 flex flex-col gap-6 h-[700px]">
            <ContractPartyLoader
              listing={listing}
              tenancy={tenancy}
              lessee={lessee}
              broker={broker}
            />

            <ContractFileUpLoader
              listing={contractInfo.listing}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
          </div>

          {/* 우측: PDF 미리보기 */}
          <ContractPDFLoader
            listing={listing}
            uploadedFiles={uploadedFiles}
            onCrtExtracted={crtfNo => console.log("자격증번호 추출:", crtfNo)}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button>새 계약 등록</Button>

        </div>
      </ComponentCard>
    </>
  );
}

export default NewContractInfoLayout;
