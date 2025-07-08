import { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";

export default function ListingDetails({ lstgId }) {
  const axios = useAxios();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (lstgId) {
      axios.post("/lstg/listing-details", { lstgId })
        .then(data => {
          setDetail(data);
          console.log(lstgId)
        })
        .catch((err) => {
          console.error("❌ 상세 조회 실패:", err);
        });
    }
  }, [lstgId]);

  if (!detail) return <div className="p-4">🔄 불러오는 중...</div>;

  return (
    <div className="p-4 space-y-2 text-sm">
      <h2 className="text-lg font-bold">{detail.lstgNm}</h2>
      <p><strong>주소:</strong> {detail.address}</p>
      <p><strong>면적:</strong> {detail.area}㎡</p>
      <p><strong>상세 설명:</strong> {detail.lstgDtlDesc}</p>
      {/* ...필요한 항목들 추가 */}
    </div>
  );
}
