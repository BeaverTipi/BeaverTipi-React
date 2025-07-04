import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import ListingTable from "../components/myOfficeListing/ListingTable";


function ListingMng() {
  const [lstgList, setLstgList] = useState();
  const axios = useAxios();

  useEffect(() => {
    axios.get("/lstg/list/M2507000110")
      .then(data => {
        setLstgList(data);
        console.log(data);

      }) //interceptor에서 resp.data를 리턴해주기 때문에 바로 가능!
      .catch(error => console.error("'lstgList' loading failed", error));
  }, [axios]);

  return (
    <>
      <h1>ListingMng</h1>
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <ListingTable lstgList={lstgList} />
        </ComponentCard>
      </div>
    </>
  )
}

export default ListingMng