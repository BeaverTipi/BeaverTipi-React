import React, { useEffect, useState } from "react";
import ContractPartyLoader from "./ContractPartyLoader";
import ContractFileUpLoader from "./ContractFileUpLoader";
import ContractPDFLoader from "./ContractPDFLoader";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { useAxios } from "../../../hooks/useAxios";
import Swal from "sweetalert2";
import { useContractInfo } from "../../../context/ContractInfoContext";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import { useAES256 } from "../../../hooks/useAES256";
import { Navigate, useNavigate } from "react-router";

/*
  사용자가 모든 계약데이터를 입력한 뒤, 마지막 확인 및 파일 첨부를 하는 단계
  폼 제출 버튼이 존재하고 contractInfo 상태를 최종적으로 서버에 전송하는 위치
 */
function NewContractInfoLayout({ onBack, onFilesUploaded, attachedFile }) {
  const axios = useSecureAxios();
  const navigate = useNavigate();
  const { contractInfo } = useContractInfo();
  const { listing, tenancy, lessee, broker, files } = contractInfo;
  const [uploadedFiles, setUploadedFiles] = useState(contractInfo.files || []);
  const { encryptWithRandomIV, encrypt } = useAES256();
  const handleSubmitProceedingContract = async () => {
    const hasStandardPdf = uploadedFiles.some(
      (file) => file.name === "표준임대차계약서.pdf"
    );

    if (!hasStandardPdf) {
      Swal.fire({
        icon: "warning",
        title: "필수 서류 누락",
        text: "'표준임대차계약서.pdf' 파일이 첨부되지 않았습니다.",
        confirmButtonText: "확인",
      });
      return;
    }

    const base64Files =
      await Promise.all(contractInfo.files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          content: base64,
        };
      }));

    const payload = {
      contractInfo: contractInfo,
      files: uploadedFiles.map((file) => ({
        fileId: null,
        fileAttachSeq: null,
        fileSourceRef: null,
        fileSourceId: null,
        fileOriginalname: file.name,
        fileSavedname: null,
        fileMime: file.type,
        fileDir: null,
        fileSize: file.size,
        docTypeCd: null,
        filePathUrl: file.path || null,
        regDtm: null
      })),
      base64Files: base64Files,
    };
    console.log("전송합니다 --->> ", payload);
    await axios.post("cont/new/submit", payload)
      .then(data => {
        const contId = data?.contId;
        console.log("1298u24398q23re98eqr2q99", contId);
        if (contId) {
          const localStorageKey = encrypt("NEXT_PROCEEDING-CONTRACT");
          const localStorageValue = encrypt(contId);
          localStorage.setItem(localStorageKey, localStorageValue);
          Swal.fire({
            icon: "success",
            title: "제출 완료!",
            text: "신규 계약이 성공적으로 등록되었습니다.",
          }).then(() => {
            window.location.href = "/broker/myoffice/cont/proceeding"
          });
        } else {
          throw new Error("계약 ID 누락");
        }
      }).catch(error => {
        console.error("❌ 계약 제출 실패", error);
        Swal.fire({
          icon: "error",
          title: "전송 실패",
          text: error?.response?.data?.message || "서버와 통신하지 못했습니다.",
        });
      })
  }


  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  useEffect(() => {
    onFilesUploaded(uploadedFiles);
    contractInfo.files = uploadedFiles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles]);

  useEffect(() => {
    console.log(attachedFile);
    if (attachedFile) {
      setUploadedFiles((prev) => {
        const alreadyIncluded = prev.find(f =>
          f.name === attachedFile.name &&
          f.size === attachedFile.size &&
          f.name === "표준임대차계약서.pdf");
        return alreadyIncluded ? prev : [attachedFile, ...prev];
      });
    }
  }, [attachedFile]);

  return (
    <>
      <ComponentCard
        title="📄 새 계약 정보 등록"
        desc="임대인, 계약서, 첨부파일을 마지막으로 확인해주세요."
        className=""
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
