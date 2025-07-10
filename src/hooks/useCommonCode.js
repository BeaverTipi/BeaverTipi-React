import { useEffect, useState } from "react";

/**
 * 공통코드 객체({ bankList, lesserTypeList, ... })를 받아
 * 각 리스트의 요소에 value/label 속성을 추가하는 훅
 *
 * @param {Object} codeGroupMap - { bankList: [...], lesserTypeList: [...] }
 * @returns {Object} 변환된 구조
 */
function useCommonCode(codeGroupList = []) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (Array.isArray(codeGroupList)) {
      const mapped = codeGroupList.map(bank => ({
        ...bank,
        value: bank.codeValue,
        label: bank.codeName,
      }));
      setOptions(mapped);
    }
  }, [codeGroupList]);

  return options;
}

export default useCommonCode;
