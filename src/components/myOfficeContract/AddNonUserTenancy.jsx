import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import PhoneInput from "../form/group-input/PhoneInput";
import Radio from "../form/input/Radio";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { useAxios } from "../../hooks/useAxios";


function AddNonUserTenancy({ selectedListing, onSave, onBack }) {
  const axios = useAxios();
  const [bankList, setBankList] = useState();
  const [lesserTypeList, setLesserTypeList] = useState();
  useEffect(() => {
    axios.post("/form", { codeGroup: { bankList: "BANK", lesserTypeList: "LSR" } })
      .then(data => {
        console.log("AddNonUserTenancy공통코드: ", data);
        const bankOpt = data.bankList.map(bank => ({
          ...bank,
          value: bank.codeValue,
          label: bank.codeName,
        }));
        const lsrOpt = data.lesserTypeList.map(lsr => ({
          ...lsr,
          value: lsr.codeValue,
          label: lsr.codeName
        }))
        setBankList(bankOpt);
        setLesserTypeList(lsrOpt);

        console.log("bankList", bankList);
      });
  }, []);

  const countries = [
    { code: "KR", label: "+82" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const [nonUserTenancy, setNonUserTenancy] = useState(selectedListing.tenancyInfo);

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
        <Input
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
        <Radio
          id="solo"
          label="1인 임대"
          name="lsrYnTypeCd"
          value="001"
          checked={nonUserTenancy?.lsrYnTypeCd === "001"}
          onChange={() =>
            setNonUserTenancy({ ...nonUserTenancy, lsrYnTypeCd: "001" })
          }
        />
        <Radio
          id="group"
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
            options={lesserTypeList}
            placeholder={"상세"}
            defaultValue={"002"}
          />

        </div>
      </div>

      {/* 사업자 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          name="mbrNm"
          placeholder="임대인 이름"
          value={nonUserTenancy?.mbrNm}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrNm: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
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
      </div>
      {/* 휴대폰 번호 */}
      <div className="pt-6">
        <PhoneInput
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
          name="mbrBasicAddr"
          placeholder="기본주소"
          value={nonUserTenancy?.mbrBasicAddr}
          onChange={(e) =>
            setNonUserTenancy({ ...nonUserTenancy, mbrBasicAddr: e.target.value })
          }
        />
        <Input
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
