import React, { useEffect, useRef, useState } from 'react';

const KakaoMapGeocoderComponent = () => {
  const mapContainerRef = useRef(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setIsKakaoLoaded(true));
    } else if (!existingScript) {
      const script = document.createElement('script');
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=f6ac04f1e14d24a9da646848581a9a89&autoload=false&libraries=services";
      script.async = true;
      script.onload = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          window.kakao.maps.load(() => {
            setIsKakaoLoaded(true);
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isKakaoLoaded || !mapContainerRef.current) return;

    if (!window.kakao.maps.services) {
      console.error("❌ Geocoder를 사용할 수 없습니다. services 라이브러리가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const address = "서울특별시 중구 세종대로 110";

    geocoder.addressSearch(address, (result, status) => {
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
        console.error("❌ 주소 변환 실패:", status);
      }
    });
  }, [isKakaoLoaded]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '500px', height: '400px', border: '1px solid #ccc' }}
    >
      {!isKakaoLoaded && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: '100%', height: '100%', backgroundColor: '#f0f0f0', color: '#666'
        }}>
          📡 Kakao 지도 SDK 로딩 중...
        </div>
      )}
    </div>
  );
};

export default KakaoMapGeocoderComponent;
