import React, { useEffect, useState, useRef } from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../../form/input/InputField";
import PhoneInput from "../../form/group-input/PhoneInput";
import SelectControlled from "../../form/SelectControlled";
import Button from "../../ui/button/Button";
import { useSecureAxios } from "../../../hooks/useSecureAxios";
import Label from "../../form/Label";
import { useContractInfo } from "../../../context/ContractInfoContext";

function AddTenancy({
  lessor,
  onSave,
  onBack,
  tenancyNo,
  setTenancyNo
}) {
  const axios = useSecureAxios();
  const { contractInfo, _setContractInfo } = useContractInfo();
  const [lesserTypeList, setLesserTypeList] = useState();
  const [bankList, setBankList] = useState();
  const [tenancyList, setTenancyList] = useState({ "0": {} });
  useEffect(() => {
    if (lessor && Object.keys(lessor).length > 0 && Object.keys(lessor).length > 0) {
      setTenancyList(lessor);
    }
  }, [lessor]);
  const addButtonRef = useRef(null);
  const [rentalPtyIdInput, setRentalPtyIdInput] = useState(
    tenancyList["0"]?.rentalPtyId || null
  );
  const [lsrYnTypeCdInput, setLsrYnTypeCdInput] = useState(
    tenancyList["0"]?.lsrYnTypeCd || null
  );
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
        console.log("✅", data);
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

    axios.post("/cont/new/lessor", {
      rentalPtyId: contractInfo?.listingInfo.rentalPtyId
    }).then(data => {

      setTenancyList(prev => ({
        ...prev,
        ["0"]: {
          ...prev["0"],
          rentalPtyId: contractInfo?.listingInfo.rentalPtyId,
          lsrYnTypeCd: data[0]?.lsrYnTypeCd,
        }
      }));
      console.log("방금 추가한 임대인 리스트 -------_> ", tenancyList);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

  });

  const handleAddTenancy = () => {
    setTenancyList((prev) => ({
      ...prev,
      [tenancyNo.toString()]: {
        mbrCd: "",
        mbrId: "",
        mbrNm: "",
        mbrTelno: "",
        mbrEmlAddr: "",
        mbrBasicAddr: "",
        mbrDetailAddr: "",
        mbrRegNo1: "",
        mbrRegNo2: "",
        rentalPtyId: tenancyList["0"]?.rentalPtyId || "",
        lsrYnTypeCd: "",
        lessorBankNm: "",
        lessorBankAcc: "",
      }
    }));

    setTenancyNo(tenancyNo + 1);
    console.log(`%c[AddTenancy]`, "color:yellow; font-weight:bold;", tenancyList);

  };

  const updateLessor = (key, updatedFields) => {
    console.log("updateLessor", key, updatedFields);
    setTenancyList((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updatedFields,
        rentalPtyId: rentalPtyIdInput,
        lsrYnTypeCd: lsrYnTypeCdInput,
      },
    }));
  };

  const handleSubmit = () => {
    console.log("tenancyList", tenancyList);
    console.log("[onSave] 데이터 추가 확인-->", contractInfo);
    console.log("[onSave] tenancyList", tenancyList); // AddTenancy에서 찍기

    onSave(tenancyList);
    console.log(contractInfo); // 다음 페이지 또는 onSave 이후 바로

  };

  const testDummyData = () => {
    setTenancyList({
      "0": {
        rentalPtyId: "123-45-67890",
        lsrYnTypeCd: "002", // 예: 개인사업자
        mbrNm: "홍길동",
        lessorBankNm: "004", // 예: 국민은행 (실제 codeValue에 맞게 입력)
        lessorBankAcc: "110-1234-5678",
        mbrTelNo: "+821012345678",
        mbrBasicAddr: "서울특별시 강남구 테헤란로",
        mbrDetailAddr: "101동 202호",
        mbrEmlAddr: "gildong@example.com",
      },
      "1": {
        rentalPtyId: "987-65-43210",
        lsrYnTypeCd: "002", // 예: 공동사업자
        mbrNm: "김철수",
        lessorBankNm: "088", // 예: 신한은행
        lessorBankAcc: "140-9876-5432",
        mbrTelNo: "+821055566677",
        mbrBasicAddr: "부산광역시 해운대구 해운대로",
        mbrDetailAddr: "301동 404호",
        mbrEmlAddr: "chulsoo@example.com",
      },
    });

    // 선택 항목도 맞게 설정
    setRentalPtyIdInput("123-45-67890");
    setLsrYnTypeCdInput("001");
  };

  return (
    <>
      <ComponentCard
        title="📝 임대인 정보 입력"
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
              value={tenancyList["0"]?.rentalPtyId || ""}
              onChange={(e) => {
                // setRentalPtyIdInput(e.target.value);
                updateLessor("0", { rentalPtyId: e.target.value })
              }}
            />
            <button
              className="w-[100px] text-sm text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
            >검증</button>
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
              name={"lsrYnTypeCd"}
              options={lesserTypeList}
              placeholder={"--임대유형 선택--"}
              value={tenancyList["0"]?.lsrYnTypeCd || ""}
              onChange={(value) => {
                // setLsrYnTypeCdInput(value);
                updateLessor("0", { lsrYnTypeCd: value })
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
            <button
              className="text-sm text-amber-800 border border-amber-800 rounded px-3 py-1 hover:text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-800"
              ref={addButtonRef}
              onClick={(e) => handleAddTenancy(e)}
              disabled={
                !["002", "003"].includes(tenancyList["0"]?.lsrYnTypeCd)
              }
            >
              +
            </button>

          </div>
          <div></div>
          <div className="col-span-4">
            <hr />
          </div>
        </div>
        {Object.entries(tenancyList).map(([idx, oneTenancy]) => (
          <React.Fragment key={idx}>
            < div
              oneTenancy
              key={parseInt(idx) + 1}
              className="grid grid-cols-4 gap-4"
            >
              {idx === "0" ? (
                <h2 className="col-span-4">임대사업자 대표</h2>
              ) : (<>
                <h2 className="col-span-4">공동사업자 {idx}</h2>
              </>)}
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
                    updateLessor(idx, updated);
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

                    updateLessor(idx, updated);
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
                    updateLessor(idx, updated);
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
                    updateLessor(idx, updated);
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
                    updateLessor(idx, updated);
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
                    updateLessor(idx, updated);
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
                    updateLessor(idx, updated);
                  }}
                />
              </div>
            </div>
            <div className="col-span-4">
              <hr />
            </div>
          </React.Fragment>
        ))
        }

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-6">
          <span onClick={testDummyData} className="text-gray-300">테스트^0^</span>
          <Button
            onClick={handleSubmit}
          >
            다음 →
          </Button>
        </div>
      </ComponentCard >
    </>
  );
}

export default AddTenancy;
