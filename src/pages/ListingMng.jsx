import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import ListingTable from "../components/myOfficeListing/ListingTable";
import Drawer from "../components/Drawer";
import { useState } from "react";
import ListingDetails from "../components/myOfficeListing/ListingDetails";

export default function ListingMng() {
  const [selectedLstgId, setSelectedLstgId] = useState(null);
  console.log("🔥 selectedLstgId:", selectedLstgId);

  return (
    <>
      <h1>ListingMng</h1>
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6 relative w-full">
        <ComponentCard title="Basic Table 1">
          <ListingTable onSelectListing={setSelectedLstgId} />
          <Drawer isOpen={!!selectedLstgId} onClose={() => setSelectedLstgId(null)} >
            {selectedLstgId && <ListingDetails lstgId={selectedLstgId} />}
          </Drawer>
        </ComponentCard>
      </div>
    </>
  )
}
