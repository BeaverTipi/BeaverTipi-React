import React, { useEffect, useRef, useState } from 'react';

const KakaoMapGeocoderComponent = () => {
  const mapContainerRef = useRef(null);
  const [isKakaoMapsLoaded, setIsKakaoMapsLoaded] = useState(false);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setIsKakaoMapsLoaded(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=f6ac04f1e14d24a9da646848581a9a89&autoload=false&libraries=services";

    script.onload = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          setIsKakaoMapsLoaded(true);
        });
      } else {
        console.error("카카오 맵스 SDK 로드 실패: 'kakao.maps.load' 또는 'kakao.maps'가 없음");
      }
    };

    script.onerror = (error) => {
      console.error("카카오 맵스 SDK 로드 중 에러 발생:", error);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isKakaoMapsLoaded && mapContainerRef.current) {
      // Geocoder가 정의되어 있는지 먼저 확인
      if (!window.kakao.maps.services || !window.kakao.maps.services.Geocoder) {
        console.error("Geocoder를 사용할 수 없습니다. services 라이브러리가 로드되지 않았습니다.");
        return;
      }

      const address = "서울특별시 중구 세종대로 110";
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          const mapOption = {
            center: coords,
            level: 3
          };

          const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);

          new window.kakao.maps.Marker({
            map: map,
            position: coords
          });
        } else {
          console.error('주소 변환 실패:', status);
        }
      });
    }
  }, [isKakaoMapsLoaded]);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ width: '500px', height: '400px', border: '1px solid #ccc' }}
    >
      {!isKakaoMapsLoaded && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: '100%', height: '100%', backgroundColor: '#f0f0f0', color: '#666'
        }}>
          Kakao 지도 SDK 로딩 중...
        </div>
      )}
    </div>
  );
};

export default KakaoMapGeocoderComponent;
