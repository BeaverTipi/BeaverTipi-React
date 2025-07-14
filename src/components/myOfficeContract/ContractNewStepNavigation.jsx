import React from 'react'

function ContractNewStepNavigation({ step, STEP }) {
  if (step === STEP.SELECT)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-600 text-sm">{"매물 선택"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.ADD_TENANCY)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-400 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"임대인 선택"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.ADD_LESSEE)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-300 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-400 text-sm">{"임대인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"임차인 선택"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.SAMPLE_SELECT)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-300 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-400 text-sm">{"임대인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-500 text-sm">{"임차인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"계약서 양식 선택"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.SAMPLE_WRITE)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-300 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-400 text-sm">{"임대인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-500 text-sm">{"임차인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"계약서 양식 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-700 text-sm">{"계약서 작성"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.PDF_PREVIEW)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-200 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-300 text-sm">{"임대인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-400 text-sm">{"임차인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-500 text-sm">{"계약서 양식 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"계약서 작성>"}&nbsp;&nbsp;</span>
          <span className="text-gray-700 text-sm">{"계약서 미리보기"}&nbsp;&nbsp;</span>
        </div>
      </>);
  if (step === STEP.CONTRACT)
    return (
      <>
        <div id="stepNavigation" className="mb-2">
          <span className="text-gray-100 text-sm">{"매물 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-200 text-sm">{"임대인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-300 text-sm">{"임차인 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-400 text-sm">{"계약서 양식 선택>"}&nbsp;&nbsp;</span>
          <span className="text-gray-500 text-sm">{"계약서 작성>"}&nbsp;&nbsp;</span>
          <span className="text-gray-600 text-sm">{"계약서 미리보기>"}&nbsp;&nbsp;</span>
          <span className="text-gray-700 text-sm">{"새 계약 등록"}&nbsp;&nbsp;</span>
        </div>
      </>);




}

export default ContractNewStepNavigation