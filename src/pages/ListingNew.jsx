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
    facType: [],
  });
  
  const [facilityAppliances, setFacilityAppliances] = useState([]);
  const [facilityFurnitures, setFacilityFurnitures] = useState([]);
  const [facilityBuildings, setFacilityBuildings] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    lstgNm: "",
    lstgTypeCode1: "",
    lstgTypeSale: "",
    roomType: "",
    roomFeature: [],
    heating: "",
    cooling: [],
    lstgDesc: "",
    imageUpload: [],
    appliance: [],
    furniture: [],
    building: [],
    lstgFloor: "",
    lstgBath: "",
    lstgRoomCnt: "",
    lstgAdd: "",
    lstgAdd2: "",
    lstgPostal: "",
  });
    // 📍 filtered 소분류 코드 만들기
  const filteredLstgType2 = commonCodes.lstgType2.filter(
    (item) => item.parentCodeValue === formData.lstgTypeCode1
  );
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 공통 코드 불러오기
        const { typeSale, lstgType1, lstgType2, facType } = await axios.post("/form", {
          codeGroup: {
            typeSale: "TRDST",
            lstgType1: "LSTG1",
            lstgType2: "LSTG2",
            facType: "FAC",
          },
        });
        setCommonCodes({ typeSale, lstgType1, lstgType2, facType });
        
        // 시설 옵션 불러오기
        const options = await axios.post("/lstg/facilityOption");
        if (!Array.isArray(options)) throw new Error("옵션 결과가 배열이 아님");

        setFacilityAppliances(options.filter((opt) => opt.facTypeCcCd === "001"));
        setFacilityFurnitures(options.filter((opt) => opt.facTypeCcCd === "002"));
        setFacilityBuildings(options.filter((opt) => opt.facTypeCcCd === "003"));

        // 수정 모드일 경우 상세 정보 조회
        if (isEditMode) {
          const res = await axios.post("/lstg/listing-details", { lstgId });
          setFormData((prev) => ({
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
            appliance: res.appliance || [],
            furniture: res.furniture || [],
            building: res.building || [],
          }));

          const images = res.lstgImageUrls ?? (res.lstgThumbnailUrl ? [res.lstgThumbnailUrl] : []);
          setExistingImages(images);
        }
      } catch (err) {
        console.error("초기 데이터 불러오기 실패", err);
      }

      // 카카오 주소 검색 스크립트 삽입
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };

    fetchAll();
  }, [axios, isEditMode, lstgId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const isMulti = ["roomFeature", "cooling", "appliance", "furniture", "building"].includes(name);
      setFormData((prev) => {
        if (isMulti) {
          const current = new Set(prev[name]);
          checked ? current.add(value) : current.delete(value);
          return { ...prev, [name]: [...current] };
        } else {
          return { ...prev, [name]: checked };
        }
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value, isChecked) => {
    setFormData((prev) => {
      const current = new Set(prev[name] || []);
      isChecked ? current.add(value) : current.delete(value);
      return { ...prev, [name]: [...current] };
    });
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
    } catch (err) {
      console.error(err);
      alert(isEditMode ? "수정 실패" : "등록 실패");
    }
  };
// ✅ 주소검색 함수
const handleAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: function (data) {
      const fullAddress = data.address; // 도로명 주소 또는 지번 주소
      const postalCode = data.zonecode; // 우편번호

      setFormData((prev) => ({
        ...prev,
        lstgAdd: fullAddress,
        lstgPostal: postalCode,
        // lstgAdd2는 사용자가 직접 입력하게 두는 것이 일반적
      }));
    },
  }).open();
};

  return (
    <>
      <PageBreadcrumb pageTitle={isEditMode ? "매물 수정" : "매물 등록"} />
      <ComponentCard title={isEditMode ? "수정" : "신규 등록"} onBack={() => navigate(-1)}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
          <ListingInfoSection
            formData={formData}
            onRadioChange={handleRadioChange}
            onAddressSearch={handleAddressSearch}
            commonCodes={commonCodes}
            filteredLstgType2={filteredLstgType2}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListingTradeSection formData={formData} onChange={handleChange} />
            <ListingExtraInfoSection
              formData={formData}
              onChange={handleChange}
              onCheckboxChange={handleCheckboxChange}
              onRadioChange={handleRadioChange}
            />
          </div>
          <ListingFacilitySection
            formData={formData}
            applianceOptions={facilityAppliances}
            furnitureOptions={facilityFurnitures}
            buildingOptions={facilityBuildings}
            onCheckboxChange={handleCheckboxChange}
          />
          <ListingDescriptionSection formData={formData} onChange={handleChange} />
          <ListingPhotoUploadSection
            onChange={(files) => setFormData((prev) => ({ ...prev, imageUpload: files }))}
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
