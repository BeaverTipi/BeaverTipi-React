import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import ListingTable from "../components/myOfficeListing/ListingTable";


function ListingMng() {
  const [lstgList, setLstgList] = useState();
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
  }, [axios]);

  return (
    <>
      <h1>ListingMng</h1>
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          {/* <ListingTable lstgList={lstgList} /> */}
        </ComponentCard>
      </div>
    </>
  )
}

export default ListingMng