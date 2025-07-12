import { useContext, useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import PhoneInput from "../form/group-input/PhoneInput";
import Radio from "../form/input/Radio";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import Label from "../form/Label";

function AddNonUserTenancy({ tenancy, onSave, onBack, contractInfo }) {
  console.log("데이터 추가 확인-->", contractInfo);
  const [lesserTypeList, setLesserTypeList] = useState();
  const [nonUserTenancy, setNonUserTenancy] = useState(tenancy);

  const axios = useSecureAxios();
  useEffect(() => {
    axios
      .post("form", {
        codeGroup: {
          // bankList: "BANK",
          lesserTypeList: "LSR",
        },
      })
      .then(data => {
        console.log("복호화된 공통코드 응답 ✅", data);

        const lsrOpt = data.lesserTypeList.map(lsr => ({
          ...lsr,
          value: lsr.codeValue,
          label: lsr.codeName,
        }));

        setLesserTypeList(lsrOpt);
      })
      .catch((err) => {
        console.error("공통코드 오류남(AddNonUserTenancy)", err);
      });
  }, []);


  const countries = [
    { code: "KR", label: "+82" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];


  const handleSubmit = () => {
    console.log("nonUserTenancy", nonUserTenancy);
    onSave(nonUserTenancy);
  };

  return (
    <ComponentCard
      title="📝 임대인 정보 입력"
      desc="비회원 임대인의 정보를 정확하게 입력해주세요."
      onBack={onBack}
    >
      {/* 임대사업자등록번호 + 검증 */}
      <div className="flex gap-2">
        <Label htmlFor={"rentalPtyId"}>임대사업자등록번호</Label>
        <Input
          id="rentalPtyId"
          name="rentalPtyId"
          placeholder="임대사업자등록번호"
          value={nonUserTenancy?.rentalPtyId}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, rentalPtyId: e.target.value })
          }
        />
        <Button className="bg-amber-600 text-white hover:bg-amber-800 whitespace-nowrap">
          검증
        </Button>
      </div>
      {/* 사업자 형태 */}
      <div className="flex gap-6 pt-4">
        <Label>임대 유형</Label>
        <Radio
          id="lsrYnTypeCd001"
          label="1인 임대"
          name="lsrYnTypeCd"
          value="001"
          checked={nonUserTenancy?.lsrYnTypeCd === "001"}
          onChange={() =>
            setNonUserTenancy({ ...nonUserTenancy, lsrYnTypeCd: "001" })
          }
        />
        <Radio
          id="lsrYnTypeCd002"
          label="공동 임대"
          name="lsrYnTypeCd"
          value="002"
          checked={nonUserTenancy?.lsrYnTypeCd !== "001"}
          onChange={() =>
            setNonUserTenancy({ ...nonUserTenancy, lsrYnTypeCd: "002" })
          }
        />
        <div className="flex gap-6 pt-4">
          <Select
            id={"lsrTypeCd"}
            name={"lsrTypeCd"}
            options={lesserTypeList}
            placeholder={"상세"}
            defaultValue={"002"}
          />
        </div>
      </div>

      {/* 사업자 기본 정보 */}
      <div className="flex gap-6 pt-4">
        <Label>임대인 이름</Label>
        <Input
          id="mbrNm"
          name="mbrNm"
          placeholder="임대인 이름"
          value={nonUserTenancy?.mbrNm}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrNm: e.target.value })
          }
        />
      </div>
      {/* <div className="flex flex-row gap-6 pt-4">
        <Label className={"w-17"}>은행 계좌</Label>
        <Select
          id=""
          options={bankList}
          placeholder={"은행명"}
          defaultValue=""
        />
        <Input
          name="rentalPtyAcctNo"
          placeholder="계좌번호"
          value={nonUserTenancy?.rentalPtyAcctNo}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, rentalPtyAcctNo: e.target.value })
          }
        />
      </div> */}
      {/* 휴대폰 번호 */}
      <div className="pt-6">
        <PhoneInput
          id="mbrTelno"
          name="mbrTelno"
          countries={countries}
          value={nonUserTenancy?.mbrTelNo}
          onChange={(val) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrTelNo: val })
          }
        />
      </div>

      {/* 주소 */}
      <div className="pt-6 space-y-3">
        <Input
          id="mbrBasicAddr"
          name="mbrBasicAddr"
          placeholder="기본주소"
          value={nonUserTenancy?.mbrBasicAddr}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrBasicAddr: e.target.value })
          }
        />
        <Input
          id="mbrDetailAddr"
          name="mbrDetailAddr"
          placeholder="상세주소 (주소 API 연동)"
          value={nonUserTenancy?.mbrDetailAddr}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrDetailAddr: e.target.value })
          }
        />
      </div>

      {/* 이메일 주소 */}
      <div className="pt-6">
        <Input
          id="mbrEmlAddr"
          name="mbrEmlAddr"
          placeholder="이메일 주소"
          value={nonUserTenancy?.mbrEmlAddr}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrEmlAddr: e.target.value })
          }
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSubmit}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          저장
        </Button>
      </div>
    </ComponentCard>
  );
}

export default AddNonUserTenancy;
