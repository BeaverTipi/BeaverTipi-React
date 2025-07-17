// context/ContractInfoContext.jsx
import { createContext, useContext, useState } from "react";

const ContractInfoContext = createContext();

export const useContractInfo = () => useContext(ContractInfoContext);

export const ContractInfoProvider = ({ children }) => {
  const [contractInfo, setContractInfo] = useState({ tenancy: { "0": {} } });

  const updateListingInfo = listing => {
    setContractInfo(prev => ({
      ...prev
      , lessorInfo: { "0": { ...listing.tenancyInfo } }
      , listingInfo: listing
      , listingId: listing.lstgId || ""
      , listingTypeSale: listing.lstgTypeSale || ""          //계약유형
      , listingTypeSaleKorean: ""
      , listingLocation: listing.lstgAdd
      , listingAdd: listing.lstgAdd || ""                    //임차주택 주소
      , listingLand: "주거"                                  //지목
      , listingLandArea: 8600                                //지목 면적
      , listingTypeCode1: listing.lstgTypeCode1 || ""        //구조/용도
      , listingExArea: listing.lstgExArea || ""              //구조/용도 면적
      , listingAdd2: listing.lstgAdd2 || ""                  //임차할 부분
      , listingGrArea: listing.lstgGrArea || ""              //임차할 부분 면적
      , listingNewOrAgain: "NEW"                             //계약 신규/갱신
      , listingLeaseAmt: listing.lstgLeaseAmt || ""          //보증금
      , listingLeaseAmtKorean: ""
      , listingLease: listing.lstgLease || ""                //전세금
      , listingLeaseKorean: ""
      , listingLeaseM: listing.lstgLeaseM || ""              //월세(차임)
      , listingLeaseMKorean: ""
      , agentMbrCd: listing.brokerInfo?.mbrCd || ""
      , agentMbrId: listing.brokerInfo?.mbrId || ""
      , agentName: listing.brokerInfo?.mbrNm || ""
      , agentTelno: listing.brokerInfo?.mbrTelno || ""
      , agentEmlAddr: listing.brokerInfo?.mbrEmlAddr || ""
      , agentOfficeName: listing.brokerInfo?.brokNm || ""
      , agentOfficeAddr:
        listing.brokerInfo?.brokAddr1 + ""
        + listing.broker?.brokAddr2 || ""
      , agentRegNo: listing.brokerInfo?.borkRegNo || ""
      , agentRep: ""
      , agentCrtfNo: listing.brokerInfo?.borkCrtfNo || ""
      , agentTelNo: listing.brokerInfo?.mbrTelno || ""
    }));
  }

  const updateLessorInfo = lessorGroup => {
    const { "0": lessor = {}, ...coLessor } = lessorGroup;
    setContractInfo(prev => ({
      ...prev
      , lessorInfo: lessorGroup
      , coLessor: coLessor
      , lessorMbrCd: lessor.mbrCd || ""
      , lessorMbrId: lessor.mbrId || ""
      , lessorName: lessor.mbrNm || ""
      , lessorTelno: lessor.mbrTelno || ""
      , lessorEmlAddr: lessor.mbrEmlAddr || ""
      , lessorBasicAddr: lessor.mbrBasicAddr || ""
      , lessorDetailAddr: lessor.mbrDetailAddr || ""
      , lessorRegNo1: lessor.mbrRegNo1 || ""
      , lessorRegNo2: lessor.mbrRegNo2 || ""
      , lessorrentalPtyId: lessor.rentalPtyId || ""
      , lessorYnTypeCd: lessor.lsrYnTypeCd || ""
      , lessorBankNm: lessor.lessorBankNm || "" //JOIN
      , lessorBankAcc: lessor.lessorBankAcc || "" //JOIN
    }));
    console.log(`%c[CONTEXT 내부]:`, "color:red; font-weight:bold;", lessorGroup, coLessor, lessor);
  }

  const updateLesseeInfo = lessee => {
    setContractInfo(prev => ({
      ...prev
      , lesseeInfo: lessee
      , lesseeMbrCd: lessee.mbrCd || ""
      , lesseeMbrId: lessee.mbrId || ""
      , lesseeName: lessee.mbrNm || ""
      , lesseeTelno: lessee.mbrTelno || ""
      , lesseeEmlAddr: lessee.mbrEmlAddr || ""
      , lesseeBasicAddr: lessee.mbrBasicAddr || ""
      , lesseeDetailAddr: lessee.mbrDetailAddr || ""
      , lesseeRegNo1: lessee.mbrRegNo1 || ""
      , lesseeRegNo2: lessee.mbrRegNo2 || ""
    }));
  }

  const updateSampleId = sampleId => {
    setContractInfo(prev => ({
      ...prev
      , contractSampleId: sampleId
    }));
  }

  const updateWrittenInfo = contract => {
    setContractInfo(prev => ({
      ...prev
      , startDate: contract.startDate
      , startDateYear: contract.startDateYear
      , startDateMonth: contract.startDateMonth
      , startDateDay: contract.startDateDay
      , endDate: contract.endDate
      , endDateYear: contract.endDateYear
      , endDateMonth: contract.endDateMonth
      , endDateDay: contract.endDateDay
      , lessorTaxYN: contract.lessorTaxYN
      , listingDeposit: contract.listingDeposit //계약금
      , listingDepositDay: contract.listingDepositDay //계약금 지불일
      , middlePayment: contract.middlePayment //중도금
      , balancePayment: contract.balancePayment //잔금
      , managementTotal: contract.managementTotal
      , management1: contract.management1
      , management2: contract.management2
      , management3: contract.management3
      , management4: contract.management4
      , management5: contract.management5
      , management6: contract.management6
      , management7: contract.management7
      , management8: contract.management8
      , managementOther: contract.managementTotal
      , twoWeeksLaterDate: contract.twoWeeksLaterDate
      , twoWeeksLaterDateYear: contract.twoWeekslaterDateYear
      , twoWeeksLaterDateMonth: contract.twoWeekslaterDateMonth
      , twoWeeksLaterDateDay: contract.twoWeekslaterDateDay
      , repairNeed: contract.repairNeed
      , repairNeedYN: contract.repairNeedYN
      , repairDeadlineDate: contract.repairDeadlineDate
      , repairDeadlineDateYear: contract.repairDeadlineDateYear
      , repairDeadlineDateMonth: contract.repairDeadlineDateMonth
      , repairDeadlineDateDay: contract.repairDeadlineDateDay
      , repairCostCoveredBy: contract.repairCostCoveredBy
      , lessorBurden: contract.lessorBurden
      , lesseeBurden: contract.lesseeBurden
      , commissionRate: contract.commissionRate
      , commissionFee: contract.commissionFee //listingLeaseM or listingLease * commissionRate
      , commissionTaxIncludedY: contract.commissionTaxIncludedY
      , commissionTaxIncludedN: contract.commissionTaxIncludedY
      , issueDateYear: contract.issueDateYear
      , issueDateMonth: contract.issueDateMonth
      , issueDateDay: contract.issueDateDay
      , letInDateYear: contract.letInDateYear
      , letInDateMonth: contract.letInDateMonth
      , letInDateDay: contract.letInDateDay
      , contractY: "Y"
      , contractN: "N"
      , specialTerms: contract.specialTerms
      , contractConclusionDate: new Date()
      , contractConclusionDateYear: new Date().getFullYear()
      , contractConclusionDateMonth: new Date().getMonth()
      , contractConclusionDateDay: new Date().getDay()
    }))
  }

  const updateAttachedFiles = files => {
    setContractInfo(prev => ({
      ...prev
      , files: files
    }));
  }

  return (
    <ContractInfoContext.Provider value={{ contractInfo, setContractInfo, updateListingInfo, updateLessorInfo, updateLesseeInfo, updateSampleId, updateWrittenInfo, updateAttachedFiles }}>
      {children}
    </ContractInfoContext.Provider>
  );
};
