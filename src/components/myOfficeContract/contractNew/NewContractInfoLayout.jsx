import React, { useEffect, useState } from "react";
import ContractPartyLoader from "./ContractPartyLoader";
import ContractFileUpLoader from "./ContractFileUpLoader";
import ContractPDFLoader from "./ContractPDFLoader";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
/*
  사용자가 모든 계약데이터를 입력한 뒤, 마지막 확인 및 파일 첨부를 하는 단계
  폼 제출 버튼이 존재하고 contractInfo 상태를 최종적으로 서버에 전송하는 위치
 */
function NewContractInfoLayout({ contractInfo, onBack, onFilesUploaded, attachedFile }) {
  const axios = useSecureAxios();
  const [uploadedFiles, setUploadedFiles] = useState(contractInfo.files || []);
  const { listing, tenancy, lessee, broker, files } = contractInfo;

  const handleSubmitProceedingContract = () => {
    //   const formData = new FormData();

    //   contractInfo.files.forEach((file, i) => {
    //     formData.append(`files[${i}]`, file);
    //   });

    //   // 필요시 계약 정보도 함께 포함
    //   formData.append("contractJson", JSON.stringify(contractInfo));

    //   const response = await fetch("/rest/contract/submit", {
    //     method: "POST",
    //     body: formData,
    //   });

    //   const result = await response.json();
    //   console.log("✅ 제출 완료:", result);
  }

  // 파일 변경 시 부모에게도 알려줌
  useEffect(() => {
    onFilesUploaded(uploadedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Button onClick={handleSubmitProceedingContract}>새 계약 등록</Button>

        </div>
      </ComponentCard>
    </>
  );
}

export default NewContractInfoLayout;
