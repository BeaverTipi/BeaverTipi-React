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
import ListingDetails from "./ListingDetails";

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

export default function ListingTable({ onSelectListing }) {
  const [lstgList, setLstgList] = useState([]);
  const axios = useAxios();

  useEffect(() => {
    axios.get("/lstg/list")
      .then(data => {
        data.forEach((lstg, idx) => lstg["indexNo"] = idx + 1);
        setLstgList(data);
        console.log("하하", data);

      }) //interceptor에서 resp.data를 리턴해주기 때문에 바로 가능!
      .catch(error => console.error("'lstgList' loading failed", error));
  }, []);

  console.log("시발^0^: ", lstgList);

  return (
    <>
      <button onClick={() => onSelectListing("TEST123")}>테스트 버튼</button>

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
                <TableRow
                  key={lstg.lstgId}
                  className={"hover:bg-gray-100 dark:hover:bg-white/5"}
                >
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="pointer-events-none flex items-center gap-3">
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {lstg.indexNo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none ">
                      {/* {getListingTypeName(lstg.lstgTypeSale) === 1 ? } */}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="cursor-pointer text-gray-500 hover:underline flex -space-x-2"
                      onClick={() => { console.log("📣 Row clicked!", lstg.lstgId); onSelectListing(lstg.lstgId); }}>
                      {lstg.lstgNm}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none flex -space-x-2">
                      {lstg.tenancyInfo !== null ? lstg.tenancyInfo.mbrNm : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none">
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
                        {lstg.lstgProdStat}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="pointer-events-none ">
                      ^0^
                    </div>
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
