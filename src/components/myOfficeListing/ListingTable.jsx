import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";

export default function ListingTable({
  onSelectListing,
  lstgList,
  getListingTypeName,
  getProdStatCodesName,
  getTypeSaleCodeName,
  getListingDetailTypeName,
}) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-700">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  번호
                </TableCell>
                <TableCell
  isHeader
  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300 w-[120px]"
>
                  매물유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  매물 상세 유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  매물명
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                  >
                  임대인
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  거래유형
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  거래상태
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  등록 일자
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-300"
                >
                  비고
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {lstgList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-gray-400">
                    매물 없음
                  </TableCell>
                </TableRow>
              ) : (
                lstgList.map((lstg, i) => (
                  <TableRow
                    key={lstg.lstgId}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-xs text-gray-500 dark:text-gray-300">
                      {i + 1}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      <Badge size="sm" color="info">
                        {getListingTypeName(lstg.lstgTypeCode1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      <Badge size="sm" color="info">
                        {getListingDetailTypeName(lstg.lstgTypeCode2)}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      {Array.isArray(lstg.lstgTypeCode1) ? (
                        lstg.lstgTypeCode1.map((_, index) => (
                          <div
                            key={index}
                            className="cursor-pointer hover:underline text-gray-500 dark:text-gray-200"
                            onClick={() => onSelectListing(lstg.lstgId)}
                          >
                            {lstg.lstgNm}
                          </div>
                        ))
                      ) : (
                        <div
                          className="cursor-pointer hover:underline text-gray-500 dark:text-gray-200"
                          onClick={() => onSelectListing(lstg.lstgId)}
                        >
                          {lstg.lstgNm}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      {lstg.tenancyInfo ? lstg.tenancyInfo.mbrNm : "-"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      {getTypeSaleCodeName(lstg.lstgTypeSale)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      {getProdStatCodesName(lstg.lstgProdStat)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      {lstg.lstgRegDate ? lstg.lstgRegDate.split("T")[0] : "-"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-300">
                      -
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
