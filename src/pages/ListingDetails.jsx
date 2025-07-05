import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";

export default function ListingDetails() {
  const axios = useAxios();
  const [lstgDetail, setLstgDetail] = useState(null);

  useEffect(() => {
    console.log("🧩 useEffect 시작됨");
    window.opener?.postMessage({ type: "ready" }, "http://localhost:81");
    console.log("📢 부모에게 ready 보냄");

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:81") return;

      // 🔐 필터링: type이 'lstgData'일 때만 처리
      if (event.data?.type !== "lstgData") return;

      console.log("📨 자식이 메시지 받음", event.data);

      const { lstgId } = event.data;
      console.log("🔍 받은 lstgId:", lstgId);
      if (lstgId) {
        axios.post(`/lstg/listing-details`, { lstgId: lstgId },).then(resp => {
          setLstgDetail(resp.data);
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);




  if (!lstgDetail) return <div>로딩 중... 쯉 =3=</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{lstgDetail.lstgNm}</h2>
      <p>유형: {lstgDetail.lstgTypeCode}</p>
      <p>상태: {lstgDetail.lstgStatCode}</p>
      <p>임대인: {lstgDetail.tenancyInfo?.mbrNm}</p>
    </div>
  );
}