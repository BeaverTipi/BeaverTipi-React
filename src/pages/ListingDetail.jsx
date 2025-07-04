import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useAxios } from "../hooks/useAxios";

export default function ListingDetail() {
  const [searchParams] = useSearchParams();
  const axios = useAxios();
  const [lstgDetail, setLstgDetail] = useState(null);
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      axios.get(`/lstg/${id}`)
        .then(resp => {
          const lstg = resp.data;
        });
    }
  }, [id]);

  if (!lstgDetail) return <div>로딩 중...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{lstgDetail.lstgNm}</h2>
      <p>유형: {lstgDetail.lstgTypeCode}</p>
      <p>상태: {lstgDetail.lstgStatCode}</p>
      <p>임대인: {lstgDetail.tenancyInfo?.mbrNm}</p>
      {/* 기타 매물 정보 */}
    </div>
  );
}