import ContractPDFViewer from "./components/pdf/ContractPDFViewer";

export default function ContractPreviewPage() {
  const dummyForm = {
    lessorName: "홍길동",
    lessorPhone: "010-1111-2222",
    lesseeName: "김혜지",
    lesseePhone: "010-3333-4444",
    contractType: "전세",
    deposit: "50,000,000",
    monthlyRent: "0",
    startDate: "2025-08-01",
    endDate: "2027-07-31",
    specialTerms: "주차장 무상 제공 / 관리비 별도",
  };

  return <ContractPDFViewer formData={dummyForm} />;
}
