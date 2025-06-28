import React, { useEffect, useRef, useState } from 'react';

/**
 * KakaoMapGeocoderComponent는 주소를 좌표로 변환하여 지도를 표시하고 마커를 추가하는 React 함수형 컴포넌트입니다.
 *
 * 이 컴포넌트는 다음 기능을 수행합니다:
 * 1. Kakao Maps JavaScript SDK를 동적으로 로드합니다.
 * 2. SDK 로드 완료 후, Geocoder 서비스를 이용하여 특정 주소를 좌표로 변환합니다.
 * 3. 변환된 좌표를 중심으로 지도를 초기화하고, 해당 위치에 마커를 표시합니다.
 * 4. 지도와 관련된 DOM 요소를 관리하고, 컴포넌트 언마운트 시 정리합니다.
 */
const KakaoMapGeocoderComponent = () => {
  // 지도를 담을 HTML div 요소에 접근하기 위한 useRef 훅
  const mapContainerRef = useRef(null);

  // Kakao Maps SDK가 성공적으로 로드되었는지 추적하는 상태
  const [isKakaoMapsLoaded, setIsKakaoMapsLoaded] = useState(false);

  // 첫 번째 useEffect: Kakao Maps SDK를 동적으로 로드합니다.
  // 이 이펙트는 컴포넌트가 마운트될 때 한 번만 실행됩니다 (의존성 배열: []).
  useEffect(() => {
    // 윈도우 객체에 이미 kakao.maps 객체가 존재한다면, SDK가 이미 로드된 것으로 간주합니다.
    if (window.kakao && window.kakao.maps) {
      setIsKakaoMapsLoaded(true);
      return; // 이미 로드되었으므로 스크립트를 다시 추가할 필요가 없습니다.
    }

    // 새로운 script 요소를 생성합니다.
    const script = document.createElement('script');
    script.async = true; // 스크립트를 비동기적으로 로드합니다.

    // !!! 중요: 여기에 발급받으신 실제 Kakao Maps APP KEY를 넣어주세요. !!!
    // 예: script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_ACTUAL_APP_KEY&libraries=services";
    // services 라이브러리는 Geocoder 사용을 위해 필수입니다.
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=f6ac04f1e14d24a9da646848581a9a89&libraries=services";

    // 스크립트 로드가 완료되었을 때 실행될 이벤트 리스너를 추가합니다.
    script.onload = () => {
      // window.kakao와 window.kakao.maps 객체가 존재하는지 다시 확인합니다.
      if (window.kakao && window.kakao.maps) {
        setIsKakaoMapsLoaded(true); // SDK 로드 완료 상태로 업데이트합니다.
      } else {
        console.error("카카오 맵스 SDK 로드 실패: 'kakao.maps' 객체를 찾을 수 없습니다.");
      }
    };

    // 스크립트 로드 중 에러가 발생했을 때 실행될 이벤트 리스너를 추가합니다.
    script.onerror = (error) => {
      console.error("카카오 맵스 SDK 로드 중 에러 발생:", error);
    };

    // 생성된 스크립트 요소를 문서의 <head> 태그에 추가합니다.
    document.head.appendChild(script);

    // 컴포넌트가 언마운트될 때 실행될 클린업(cleanup) 함수입니다.
    // 추가했던 스크립트 요소를 제거하여 메모리 누수를 방지합니다.
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []); // 빈 의존성 배열은 이 이펙트가 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  // 두 번째 useEffect: Kakao Maps SDK 로드 완료 후 지오코딩 및 지도를 초기화합니다.
  // 이 이펙트는 'isKakaoMapsLoaded' 상태가 true로 변경될 때와
  // 'mapContainerRef.current' (지도를 담을 div 요소)가 유효할 때 실행됩니다.
  useEffect(() => {
    // SDK가 로드되었고, 맵 컨테이너 요소가 DOM에 존재할 때만 지도를 생성합니다.
    if (isKakaoMapsLoaded && mapContainerRef.current) {
      // 주소
      const address = "서울특별시 중구 세종대로 110";

      // Geocoder 객체 생성
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 주소를 좌표로 변환
      geocoder.addressSearch(address, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          // 변환 성공 시
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도에 마커 표시 등 추가 작업
          // 지도를 생성할 때 필요한 옵션을 정의합니다.
          const mapOption = {
            center: coords, // 주소로 얻은 좌표를 지도의 중심으로 설정
            level: 3 // 지도의 확대 레벨
          };

          // Kakao 지도 인스턴스를 생성하고 mapContainerRef가 가리키는 div에 지도를 그립니다.
          const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);

          // 마커를 생성하고 지도에 표시합니다.
          const marker = new window.kakao.maps.Marker({
            map: map, // 마커를 표시할 지도 객체
            position: coords // 마커의 위치 (주소로 얻은 좌표)
          });

          // (선택 사항) 지도 컨트롤 추가 등
          // map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);

        } else {
          // 변환 실패 시
          console.error('주소 변환 실패:', status);
        }
      });
    }
  }, [isKakaoMapsLoaded]); // isKakaoMapsLoaded 상태가 변경될 때마다 이 이펙트를 재실행합니다.

  // 컴포넌트 렌더링 부분: 지도를 표시할 div 요소를 반환합니다.
  return (
    <div
      id="map" // 원래 HTML 코드와 동일한 ID를 유지 (필수는 아님, ref가 더 중요)
      ref={mapContainerRef} // 이 ref를 통해 지도가 생성될 div 요소를 참조합니다.
      style={{ width: '500px', height: '400px', border: '1px solid #ccc' }} // 지도의 크기를 설정하는 인라인 스타일
    >
      {/* SDK 로딩 중 사용자에게 상태를 알려주는 메시지 (선택 사항) */}
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
