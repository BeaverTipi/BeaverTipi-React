import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";

function getListingTypeName(code) {
  switch (code) {
    case "001":
      return "아파트";
    case "002":
      return "빌라";
    case "003":
      return "오피스텔";
    case "004":
      return "단독주택";
    case "005":
      return "상가";
    case "006":
      return "오피스빌딩";
    case "007":
      return "상점";
    case "008":
      return "기타";
    default:
      return "기타";
  }
}

export default function ListingTable() {
  const [lstgList, setLstgList] = useState([]);
  const axios = useAxios();

  useEffect(() => {
    axios.get("/lstg/list")
      .then(data => {
        let cnt = 1;
        data.forEach(lstg => {
          lstg["indexNo"] = cnt;
          cnt++;
        })
        setLstgList(data);
        console.log("하하", data);

      }) //interceptor에서 resp.data를 리턴해주기 때문에 바로 가능!
      .catch(error => console.error("'lstgList' loading failed", error));
  }, []);

  console.log("시발^0^: ", lstgList);


  const [listingWindow, setListingWindow] = useState(null);

  const handleOpenListingDetail = (lstg) => {



    const url = `http://localhost:81/broker/myoffice/listing-details`;
    const windowName = `BeaverTipi::${lstg.lstgNm}`;
    let newWin;

    if (!listingWindow || listingWindow.closed) {
      newWin = window.open(url, windowName, "width=800,height=600");
      setListingWindow(newWin);
    } else {
      listingWindow.location.href = url;
      listingWindow.focus();
      newWin = listingWindow;
    }

    // 메시지 수신 후 lstgId 보내기
    const waitForReady = (event) => {
      if (event.origin !== "http://localhost:81") return;
      if (event.data?.type === "ready") {
        console.log("💌 자식이 준비 완료 알림 보냄");
        newWin.postMessage({ type: "lstgData", lstgId: lstg.lstgId }, "http://localhost:81");
        window.removeEventListener("message", waitForReady);
      }
    };
    //    const waitForReady = (event) => {
    //     if (event.origin !== "http://localhost:81") return;
    //     if (event.data?.type === "ready") {
    //       console.log("💌 자식이 준비 완료 알림 보냄");

    //       // 🔐 Spring 서버로 JWT 발급 요청
    //       rawAxios.post("http://localhost/rest/broker/myoffice/api/token", { lstgId: lstg.lstgId }, {
    //         withCredentials: true,
    //       })
    //         .then((res) => {
    //           const token = res.data.token;

    //           // ✅ JWT 토큰을 자식 창에 전달
    //           newWin.postMessage({ type: "secureLstg", token }, "http://localhost:81");

    //           // 💡 메시지 리스너 제거
    //           window.removeEventListener("message", waitForReady);
    //         })
    //         .catch((err) => {
    //           console.error("❌ JWT 토큰 발급 실패:", err);
    //           alert("보안 토큰을 발급받지 못했습니다.");
    //           window.removeEventListener("message", waitForReady);
    //         });
    //     }
    //   };
    //   window.addEventListener("message", waitForReady);
    //   window.addEventListener("message", waitForReady);
    // };

    window.addEventListener("message", waitForReady);
  };



  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  번호
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  매물명
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  임대인
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  거래유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  거래상태
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  비고
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {lstgList.map(lstg => (
                <TableRow key={lstg.lstgId}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        {/* <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {lstg.indexNo}
                        </span> */}
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {lstg.indexNo}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {getListingTypeName(lstg.lstgTypeCode)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="cursor-pointer text-gray-500 hover:underline flex -space-x-2"
                      onClick={() => handleOpenListingDetail(lstg)}
                    >
                      {lstg.lstgNm}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {lstg.tenancyInfo.mbrNm}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {lstg.tenancyInfo.mbrNm}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        lstg.lstgStatCode === "ACTIVE"
                          ? "success"
                          : lstg.lstgStatCode === "CONTRACTED"
                            ? "warning"
                            : "error"
                      }
                    >
                      {lstg.lstgStatCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ^0^
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
