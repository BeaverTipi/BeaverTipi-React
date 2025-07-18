import { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // ✅ 추가
import ListingInfoSection from "../components/myOfficeListing/newList/ListingInfoSection";
import ListingTradeSection from "../components/myOfficeListing/newList/ListingTradeSection";
import ListingExtraInfoSection from "../components/myOfficeListing/newList/ListingExtraInfoSection";
import ListingFacilitySection from "../components/myOfficeListing/newList/ListingFacilitySection";
import ListingDescriptionSection from "../components/myOfficeListing/newList/ListingDescriptionSection";
import SubmitSection from "../components/myOfficeListing/newList/SubmitSection";
import ListingPhotoUploadSection from "../components/myOfficeListing/newList/ListingPhotoUploadSection";

import { useSecureAxios } from "../hooks/useSecureAxios";
import ComponentCard from "../components/common/ComponentCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

const ListingNew = () => {
  const navigate = useNavigate(); // ✅ 여기!
  const axios = useSecureAxios();
  const [commonCodes, setCommonCodes] = useState({
    typeSale: [],
    heating: [],
    cooling: [],
    roomType: [],
    roomFeature: []
  });
  const [formData, setFormData] = useState({
    lstgNm: "", // 매물명
    lstgTypeCode1: "", // 매물 유형
    lstgTypeSale: "", // 거래 유형
    lstgPrice: "",
    lstgAreaSupply: "",
    lstgRoomCnt: 0,
    lstgBathCnt: 0,
    lstgFloor: 0,
    parkingYn: false,
    roomType: "", // 오픈형/분리형
    roomFeature: [], // checkbox
    heating: "",
    cooling: [], // checkbox
    lstgDesc: "",
    imageUpload: []
  });

  useEffect(() => {
    axios.post("/form", {
      codeGroup: {
        typeSale: "TRDST",
        heating: "HEAT",
        cooling: "COOL",
        roomType: "ROOMT",
        roomFeature: "FEATURE"
      }
    })
      .then((res) => {
        setCommonCodes({
          typeSale: res.typeSale || [],
          heating: res.heating || [],
          cooling: res.cooling || [],
          roomType: res.roomType || [],
          roomFeature: res.roomFeature || []
        });
      })
      .catch((err) => {
        console.error("공통코드 불러오기 실패", err);
      });
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "roomFeature" || name === "cooling") {
        setFormData((prev) => {
          const current = new Set(prev[name]);
          if (checked) current.add(value);
          else current.delete(value);
          return { ...prev, [name]: [...current] };
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(key, v));
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.post("/building/product/add", data);
      alert("등록 성공");
    } catch (error) {
      console.error(error);
      alert("등록 실패");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="매물 등록" />
      <div className="container mx-auto p-6">
        <ComponentCard
          title={
            <button
              className="text-[#BC6B2C] hover:text-[#A25720] font-semibold"
              onClick={() => navigate("/broker/myoffice/lstg/mng")}
            >
              ← 뒤로가기
            </button>
          }
        >
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-8"
          >
            <ListingInfoSection formData={formData} onChange={handleChange} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ListingTradeSection formData={formData} onChange={handleChange} />
              <ListingFacilitySection formData={formData} onChange={handleChange} />
            </div>

            <ListingExtraInfoSection formData={formData} onChange={handleChange} />
            <ListingDescriptionSection formData={formData} onChange={handleChange} />
            <ListingPhotoUploadSection
              onChange={(files) =>
                setFormData((prev) => ({ ...prev, imageUpload: files }))
              }
            />
            <SubmitSection />
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default ListingNew;
