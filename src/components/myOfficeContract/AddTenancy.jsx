import { useEffect, useState, useRef } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import PhoneInput from "../form/group-input/PhoneInput";
import SelectControlled from "../form/SelectControlled";
import Button from "../ui/button/Button";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import Label from "../form/Label";

function AddNonUserTenancy({
  tenancy,
  onSave,
  onBack,
  contractInfo,
  tenancyNo,
  setTenancyNo,
}) {
  console.log("데이터 추가 확인-->", contractInfo);
  const [lesserTypeList, setLesserTypeList] = useState();
  const [bankList, setBankList] = useState();
  const [tenancyList, setTenancyList] = useState(tenancy);
  const addButtonRef = useRef(null);
  const [rentalPtyIdInput, setRentalPtyIdInput] = useState(
    tenancyList["0"]?.rentalPtyId
  );
  const [lsrYnTypeCdInput, setLsrYnTypeCdInput] = useState(
    tenancyList["0"]?.lsrYnTypeCd
  );
  const axios = useSecureAxios();
  const countries = [
    { code: "KR", label: "+82" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  useEffect(() => {
    axios
      .post("form", {
        codeGroup: {
          bankList: "BANK",
          lesserTypeList: "LSR",
        },
      })
      .then((data) => {
        console.log("복호화된 공통코드 응답 ✅", data);
        const bankOpt = data.bankList.map((bank) => ({
          ...bank,
          value: bank.codeValue,
          label: bank.codeName,
        }));
        const lsrOpt = data.lesserTypeList.map((lsr) => ({
          ...lsr,
          value: lsr.codeValue,
          label: lsr.codeName,
        }));
        setBankList(bankOpt);
        setLesserTypeList(lsrOpt);
      })
      .catch((err) => {
        console.error("공통코드 오류남(AddNonUserTenancy)", err);
      });
  }, []);

  const handleAddTenancy = () => {
    const newEntry = {
      rentalPtyId: "",
      lsrYnTypeCd: "",
      mbrNm: "",
      lessorBankNm: "",
      lessorBankAcc: "",
      mbrTelNo: "",
      mbrBasicAddr: "",
      mbrDetailAddr: "",
      mbrEmlAddr: "",
    };

    setTenancyList((prev) => ({
      ...prev,
      [tenancyNo.toString()]: newEntry,
    }));

    setTenancyNo(tenancyNo + 1);
  };
  const updateTenancy = (key, updatedData) => {
    setTenancyList((prev) => ({
      ...prev,
      [key]: {
        ...updatedData,
        rentalPtyId: rentalPtyIdInput,
        lsrYnTypeCd: lsrYnTypeCdInput,
      },
    }));
  };

  const handleSubmit = () => {
    console.log("tenancyList", tenancyList);
    console.log("[onSave] 데이터 추가 확인-->", contractInfo);
    onSave(tenancyList);
  };

  return (
    <>
      <ComponentCard
        title="📝 임대인 정보 입력"
        desc={
          <>
            <span className="text-gray-400">{"매물선택>"}</span>{" "}
            <span className="text-gray-600">{"임대인선택>"}</span>
          </>
        }
        onBack={onBack}
      >
        {/* 임대사업자등록번호 + 검증 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Label
              htmlFor={"rentalPtyId"}
              className="w-[120px] whitespace-nowrap text-sm font-bold justify-end-safe"
            >
              임대사업자
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;등록번호
            </Label>
            <Input
              className="w-[200px]"
              id="rentalPtyId"
              name="rentalPtyId"
              placeholder="임대사업자등록번호"
              value={tenancyList["0"]?.rentalPtyId}
              onChange={(e) => {
                setRentalPtyIdInput(e.target.value);
              }}
            />
            <Button className="bg-amber-600 text-white hover:bg-amber-800 whitespace-nowrap">
              검증
            </Button>
          </div>
          <div className="flex flex-row items-center gap-3 w-full">
            <Label
              htmlFor={"lsrYnTypeCd001"}
              className="w-[120px] whitespace-nowrap text-sm font-bold justify-end-safe"
            >
              임대 유형{" "}
            </Label>
            <SelectControlled
              id={"lsrYnTypeCd"}
              name={"lsrTypeCd"}
              options={lesserTypeList}
              placeholder={"--임대유형 선택--"}
              value={lsrYnTypeCdInput}
              onChange={(value) => {
                console.log("임대유형 코드 변경: ", value);
                setLsrYnTypeCdInput(value);
              }}
            />
          </div>
          <div className="flex flex-row items-center gap-3 w-full">
            <Label
              htmlFor={"lsrYnTypeCd001"}
              className="w-[100px] whitespace-nowrap text-sm font-bold justify-end-safe"
            >
              공동사업자 추가
            </Label>
            <Button
              ref={addButtonRef}
              onClick={(e) => handleAddTenancy()}
              disabled={
                !(lsrYnTypeCdInput === "002" || lsrYnTypeCdInput === "003")
              }
            >
              +
            </Button>
          </div>
          <div></div>
          <div className="col-span-4">
            <hr />
          </div>
        </div>
        {Object.entries(tenancyList).map(([idx, oneTenancy]) => (
          <>
            <div
              class="oneTenancy"
              key={parseInt(idx) + 1}
              className="grid grid-cols-4 gap-4"
            >
              {idx === "0" ? (
                <h2 className="col-span-4">임대사업자 대표</h2>
              ) : (
                <h2 className="col-span-4">공동사업자 {idx}</h2>
              )}
              <div className="flex items-center gap-3">
                <Label
                  htmlFor={"lsrYnTypeCd001"}
                  className="w-[100px] whitespace-nowrap text-sm font-bold justify-end-safe"
                >
                  임대인 실명
                </Label>
                <Input
                  className="flex-1"
                  id="mbrNm"
                  name="mbrNm"
                  placeholder="임대인 이름"
                  value={tenancyList[idx]?.mbrNm}
                  onChange={(e) => {
                    const updated = {
                      ...oneTenancy,
                      mbrNm: e.target.value,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
              </div>
              <div className="flex flex-row gap-6 pt-4 col-span-4">
                <Label className={"w-17"}>은행 계좌</Label>
                <SelectControlled
                  id="lessorBankNm"
                  options={bankList}
                  placeholder={"--은행사 선택--"}
                  value={tenancyList[idx]?.lessorBankNm}
                  onChange={(value) => {
                    const updated = {
                      ...oneTenancy,
                      lessorBankNm: value,
                    };

                    updateTenancy(idx, updated);
                  }}
                />
                <Input
                  name="lessorBankAcc"
                  placeholder="계좌번호"
                  value={tenancyList[idx]?.lessorBankAcc}
                  onChange={(e) => {
                    const updated = {
                      ...oneTenancy,
                      lessorBankAcc: e.target.value,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
              </div>
              {/* 휴대폰 번호 */}
              <div className="pt-6">
                <PhoneInput
                  id="mbrTelno"
                  name="mbrTelno"
                  countries={countries}
                  value={tenancyList[idx]?.mbrTelNo}
                  onChange={(val) => {
                    const updated = {
                      ...oneTenancy,
                      mbrTelNo: val,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
              </div>

              {/* 주소 */}
              <div className="pt-6 space-y-3">
                <Input
                  id="mbrBasicAddr"
                  name="mbrBasicAddr"
                  placeholder="기본주소"
                  value={tenancyList[idx]?.mbrBasicAddr}
                  onChange={(e) => {
                    const updated = {
                      ...oneTenancy,
                      mbrBasicAddr: e.target.value,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
                <Input
                  id="mbrDetailAddr"
                  name="mbrDetailAddr"
                  placeholder="상세주소 (주소 API 연동)"
                  value={tenancyList[idx]?.mbrDetailAddr}
                  onChange={(e) => {
                    const updated = {
                      ...oneTenancy,
                      mbrDetailAddr: e.target.value,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
              </div>

              {/* 이메일 주소 */}
              <div className="pt-6">
                <Input
                  id="mbrEmlAddr"
                  name="mbrEmlAddr"
                  placeholder="이메일 주소"
                  value={tenancyList[idx]?.mbrEmlAddr}
                  onChange={(e) => {
                    const updated = {
                      ...oneTenancy,
                      mbrEmlAddr: e.target.value,
                    };
                    // setTenancyList((prev) => ({ ...prev, idx: updated }));
                    updateTenancy(idx, updated);
                  }}
                />
              </div>
            </div>
            <div className="col-span-4">
              <hr />
            </div>
          </>
        ))}

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
    </>
  );
}

export default AddNonUserTenancy;
