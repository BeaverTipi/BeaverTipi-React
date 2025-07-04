import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import ListingTable from "../components/myOfficeListing/ListingTable";


function ListingMng() {


  return (
    <>
      <h1>ListingMng</h1>
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <ListingTable />
        </ComponentCard>
      </div>
    </>
  )
}

export default ListingMng