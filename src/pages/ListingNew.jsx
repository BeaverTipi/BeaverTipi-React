import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  const navigate = useNavigate();
  const axios = useSecureAxios();
  const { lstgId } = useParams();
  const isEditMode = !!lstgId;

  const [commonCodes, setCommonCodes] = useState({
    typeSale: [],
    lstgType1: [],
    lstgType2: [],
    facType: []
  });

  const [facilityAppliances, setFacilityAppliances] = useState([]);
  const [facilityFurnitures, setFacilityFurnitures] = useState([]);
  const [facilityBuildings, setFacilityBuildings] = useState([]);

  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    lstgNm: "",
    lstgTypeCode1: "",
    lstgTypeSale: "",
    lstgPrice: "",
    lstgAreaSupply: "",
    lstgRoomCnt: 0,
    lstgBathCnt: 0,
    lstgFloor: 0,
    parkingYn: false,
    roomType: "",
    roomFeature: [],
    heating: "",
    cooling: [],
    lstgDesc: "",
    imageUpload: [],
    appliance: [],
    furniture: [],
    building: []
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const formRes = await axios.post("/form", {
          codeGroup: {
            typeSale: "TRDST",
            lstgType1: "LSTG1",
            lstgType2: "LSTG2",
            facType: "FAC"
          }
        });

        const formData = formRes.data;
        setCommonCodes({
          typeSale: formData.typeSale || [],
          lstgType1: formData.lstgType1 || [],
          lstgType2: formData.lstgType2 || [],
          facType: formData.facType || []
        });
      } catch (err) {
        console.error("공통코드 불러오기 실패", err);
      }

      try {
  const optionRes = await axios.post("/lstg/facilityOption", {});
  const options = optionRes.data;

  if (!Array.isArray(options)) {
    console.error("시설 옵션 응답이 배열이 아닙니다:", options);
    return;
  }

      setFacilityAppliances(options.filter(opt => opt.facTypeCcCd === "001"));
      setFacilityFurnitures(options.filter(opt => opt.facTypeCcCd === "002"));
      setFacilityBuildings(options.filter(opt => opt.facTypeCcCd === "003"));
    } catch (err) {
      console.error("시설 옵션 불러오기 실패", err);
    }

    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        if (isEditMode) {
          const res = await axios.post("/lstg/listing-details", { lstgId });

          setFormData(prev => ({
            ...prev,
            lstgNm: res.lstgNm,
            lstgTypeCode1: res.lstgTypeCode1,
            lstgTypeSale: res.lstgTypeSale,
            lstgPrice: res.lstgPrice,
            lstgAreaSupply: res.lstgAreaSupply,
            lstgRoomCnt: res.lstgRoomCnt,
            lstgBathCnt: res.lstgBathCnt,
            lstgFloor: res.lstgFloor,
            parkingYn: res.lstgParkYn === "Y",
            roomType: res.roomType,
            roomFeature: res.roomFeature || [],
            heating: res.heating,
            cooling: res.cooling || [],
            lstgDesc: res.lstgDesc,
            imageUpload: [],
            appliance: res.appliance || [],
            furniture: res.furniture || [],
            building: res.building || []
          }));

          if (Array.isArray(res.lstgImageUrls)) {
            setExistingImages(res.lstgImageUrls);
          } else if (res.lstgThumbnailUrl) {
            setExistingImages([res.lstgThumbnailUrl]);
          }
        }
      } catch (err) {
        console.error("매물 정보 조회 실패", err);
      }
    };

    fetchListingDetails();
  }, [isEditMode, lstgId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (["roomFeature", "cooling", "appliance", "furniture", "building"].includes(name)) {
        setFormData((prev) => {
          const current = new Set(prev[name]);
          checked ? current.add(value) : current.delete(value);
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
      if (isEditMode) {
        data.append("lstgId", lstgId);
        await axios.post("/building/product/update", data);
        alert("수정 성공");
      } else {
        await axios.post("/building/product/add", data);
        alert("등록 성공");
      }
      navigate("/broker/myoffice/lstg/mng");
    } catch (error) {
      console.error(error);
      alert(isEditMode ? "수정 실패" : "등록 실패");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isEditMode ? "매물 수정" : "매물 등록"} />
      <ComponentCard title="매물 등록" onBack={() => navigate(-1)}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
          <ListingInfoSection formData={formData} onChange={handleChange} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListingTradeSection formData={formData} onChange={handleChange} />
            <ListingFacilitySection
              formData={formData}
              onChange={handleChange}
              applianceOptions={facilityAppliances}
              furnitureOptions={facilityFurnitures}
              buildingOptions={facilityBuildings}
            />
          </div>
          <ListingExtraInfoSection formData={formData} onChange={handleChange} />
          <ListingDescriptionSection formData={formData} onChange={handleChange} />
          <ListingPhotoUploadSection
            onChange={(files) =>
              setFormData((prev) => ({ ...prev, imageUpload: files }))
            }
            isEditMode={isEditMode}
            existingImages={existingImages}
          />
          <SubmitSection />
        </form>
      </ComponentCard>
    </>
  );
};

export default ListingNew;
