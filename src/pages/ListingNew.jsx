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
import axios from "axios";
import Swal from "sweetalert2";

const ListingNew = () => {
  const navigate = useNavigate();
  const secureAxios = useSecureAxios();
  const { lstgId } = useParams();
  const isEditMode = !!lstgId;
  
  const PROTOCOL = window.location.protocol; // 'http:' or 'https:'
  let HOSTNAME = window.location.hostname;   // e.g., react.beavertipi.com
  // 👉 react 서브도메인 접근 시 백엔드는 beavertipi.com 사용
  if (HOSTNAME === "react.beavertipi.com") {
    HOSTNAME = "beavertipi.com";
  }
    if (HOSTNAME === "dev.beavertipi.com") {
    HOSTNAME = "dev1.beavertipi.com";
  }
      if (HOSTNAME === "hbdev.beavertipi.com") {
    HOSTNAME = "hbdev1.beavertipi.com";
  }
  const SPRING_URL_ORIGIN = `${PROTOCOL}//${HOSTNAME}`;
  
  const axiosForFormData = axios.create({
    baseURL: SPRING_URL_ORIGIN,
    withCredentials: true,
  });

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
    lstgNm: "", // LISTING_NM
    lstgTypeCode1: "", // LSTG_TYPE_CODE1
    lstgTypeCode2: "", // LSTG_TYPE_CODE2
    lstgTypeSale: "", // LSTG_TYPE_SALE
    lstgLease: "", // LSTG_LEASE
    lstgLeaseM: "", // LSTG_LEASE_M
    lstgLeaseAmt: "", // LSTG_LEASE_AMT
    lstgFee: "", // LSTG_FEE
    lstgAdd: "", // LSTG_ADD
    lstgAdd2: "", // LSTG_ADD2
    lstgPostal: "", // LSTG_POSTAL
    lstgRoomNum: "", // LSTG_ROOM_NUM
    lstgRoomCnt: "", // LSTG_ROOM_CNT
    lstgBathCnt: "", // LSTG_BATH_CNT
    lstgFloor: "", // LSTG_FLOOR
    lstgGArea: "", // LSTG_GR_AREA
    lstgExArea: "", // LSTG_EX_AREA
    parkingYn: false, // LSTG_PARK_YN
    roomType: "", // 커스텀 필드
    roomFeature: [], // 커스텀 필드
    heating: "", // 커스텀 필드
    cooling: [], // 커스텀 필드
    lstgDst: "", // LSTG_DESC
    imageUpload: [], // 업로드 이미지 리스트
    appliance: [], // FAC_TYPE_CC_CD = 001
    furniture: [], // FAC_TYPE_CC_CD = 002
    building: [], // FAC_TYPE_CC_CD = 003
  });

  const filteredLstgType2 = commonCodes.lstgType2.filter(
    (item) => item.parentCodeValue === formData.lstgTypeCode1
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { typeSale, lstgType1, lstgType2, facType } =
          await secureAxios.post("/form", {
            codeGroup: {
              typeSale: "TRDST",
              lstgType1: "LSTG1",
              lstgType2: "LSTG2",
              facType: "FAC",
            },
          });
        setCommonCodes({ typeSale, lstgType1, lstgType2, facType });

        const options = await secureAxios.post("/lstg/facilityOption");
        if (!Array.isArray(options)) throw new Error("옵션 결과가 배열이 아님");

        setFacilityAppliances(
          options.filter((opt) => opt.facTypeCcCd === "001")
        );
        setFacilityFurnitures(
          options.filter((opt) => opt.facTypeCcCd === "002")
        );
        setFacilityBuildings(
          options.filter((opt) => opt.facTypeCcCd === "003")
        );
        console.log("✏️ 현재 모드:", isEditMode ? "수정 모드" : "등록 모드");
        if (isEditMode) {
          const res = await secureAxios.post("/lstg/listing-details", {
            lstgId,
          });
          console.log(res);
          setFormData((prev) => {
            const facilityOptions = res.facOptions || [];

            return {
              ...prev,
              lstgNm: res.lstgNm,
              lstgTypeCode1: res.lstgTypeCode1,
              lstgTypeCode2: res.lstgTypeCode2,
              lstgTypeSale: res.lstgTypeSale,
              lstgLeaseAmt: res.lstgLeaseAmt,
              lstgLeaseM: res.lstgLeaseM,
              lstgFee: res.lstgFee,
              lstgGArea: res.lstgGArea,
              lstgExArea: res.lstgExArea,
              lstgRoomCnt: res.lstgRoomCnt,
              lstgBathCnt: res.lstgBathCnt,
              lstgFloor: res.lstgFloor,
              lstgRoomNum: res.lstgRoomNum,
              lstgAdd: res.lstgAdd,
              lstgAdd2: res.lstgAdd2,
              lstgPostal: res.lstgPostal,
              parkingYn: res.lstgParkYn === "Y",
              roomType: res.roomType,
              roomFeature: res.roomFeature || [],
              heating: res.heating,
              cooling: res.cooling || [],
              lstgDst: res.lstgDst,

              // ✅ 여기에서 facilityOptions 필터링해서 각각 분리
              appliance: facilityOptions
                .filter((opt) => opt.facTypeCcCd === "001")
                .map((opt) => opt.facOptId),
              furniture: facilityOptions
                .filter((opt) => opt.facTypeCcCd === "002")
                .map((opt) => opt.facOptId),
              building: facilityOptions
                .filter((opt) => opt.facTypeCcCd === "003")
                .map((opt) => opt.facOptId),
            };
          });

          const images =
            res.lstgImageUrls ??
            (res.lstgThumbnailUrl ? [res.lstgThumbnailUrl] : []);
          setExistingImages(images);
        }
      } catch (err) {
        console.error("초기 데이터 불러오기 실패", err);
      }

      const script = document.createElement("script");
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };

    fetchAll();
  }, [secureAxios, isEditMode, lstgId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const isMulti = [
        "roomFeature",
        "cooling",
        "appliance",
        "furniture",
        "building",
      ].includes(name);
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
      if (["appliance", "furniture", "building", "imageUpload"].includes(key))
        return;

      if (Array.isArray(value)) {
        value.forEach((v) => data.append(key, v));
      } else {
        data.append(key, value);
      }
    });

    // ✅ 시설 옵션 통합
    const selectedFacOptIds = [
      ...(formData.appliance || []),
      ...(formData.furniture || []),
      ...(formData.building || []),
    ];
    selectedFacOptIds.forEach((id) => {
      data.append("facilities", id);
    });

    // ✅ 이미지 업로드 추가
    if (Array.isArray(formData.imageUpload)) {
      formData.imageUpload.forEach((file) => {
        data.append("imageUpload", file);
      });
    }

    try {
      if (isEditMode) {
        data.append("lstgId", lstgId);
        console.log(data);
        await axiosForFormData.post(
          "/rest/broker/myoffice/lstg/product/update",
          data
        );
        Swal.fire({
          icon: "success",
          title: "수정 완료",
          text: "매물 정보가 성공적으로 수정되었습니다.",
          confirmButtonColor: "#a47148",
        }).then(() => navigate("/broker/myoffice/lstg/mng"));
      } else {
        console.log("✅ FormData 내용 확인:");
        for (let [key, value] of data.entries()) {
          console.log(`${key}:`, value);
        }
        await axiosForFormData.post(
          "/rest/broker/myoffice/lstg/product/add",
          data
        );
        Swal.fire({
          icon: "success",
          title: "등록 완료",
          text: "매물이 성공적으로 등록되었습니다.",
          confirmButtonColor: "#a47148",
        }).then(() => navigate("/broker/myoffice/lstg/mng"));
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: isEditMode ? "수정 실패" : "등록 실패",
        text: "서버 요청 중 오류가 발생했습니다.",
        confirmButtonColor: "#a47148",
      });
    }
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.address;
        const postalCode = data.zonecode;
        setFormData((prev) => ({
          ...prev,
          lstgAdd: fullAddress,
          lstgPostal: postalCode,
        }));
      },
    }).open();
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isEditMode ? "매물 수정" : "매물 등록"} />
      <ComponentCard
        title={isEditMode ? `${formData.lstgNm} 수정` : "신규 등록"}
        onBack={() => navigate(-1)}
      >
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-8"
        >
          <ListingInfoSection
            formData={formData}
            onRadioChange={handleRadioChange}
            onAddressSearch={handleAddressSearch}
            onChange={handleChange}
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
          <ListingDescriptionSection
            formData={formData}
            onChange={handleChange}
          />
          <ListingPhotoUploadSection
            onChange={(files) =>
              setFormData((prev) => ({ ...prev, imageUpload: files }))
            }
            isEditMode={isEditMode}
            existingImages={existingImages}
          />
          <SubmitSection isEdit={isEditMode} />
        </form>
      </ComponentCard>
    </>
  );
};

export default ListingNew;
