import { useEffect, useState } from 'react'
import KakaoMapGeocoderComponent from '../components/KakaoMapGeocoderComponent';
import { useAxios } from '../hooks/useAxios';

const { kakao } = window;
function OfficeMap() {

  // const brokerAddr = "대전광역시 중구 계룡로 765번길 16";
  const brokerAddr = "대전광역시 중구 계룡로 846";
  // const brokerAddr = "대전광역시 중구 선화로35번길 18-13";
  // const brokerAddr = "대전광역시 유성구 문화원로46번길 26";
  // const brokerAddr = "보람로96 2010동";
  const axios = useAxios();
  const [lstgList, setLstgList] = useState({});

  useEffect(() => {
    axios.get("/lstg/list/M2507000110")
      .then(data => setLstgList(data)) //interceptor에서 resp.data를 리턴해주기 때문에 바로 가능!
      .catch(error => console.error("목록 불러오기 실패", error));
  }, []);

  return (
    <>
      <KakaoMapGeocoderComponent kakao={kakao} brokerAddr={brokerAddr} radius={300} />
      <div>OfficeMap</div>
      <div id={"whereToPrintLstgList"}>
        <ul>
          {
            Object.entries(lstgList).map(([resident, addr]) => (
              <li key={resident}>
                <strong>broker</strong> : {addr}
              </li>
            ))
          }
        </ul>
      </div>
    </>
  )
}

export default OfficeMap