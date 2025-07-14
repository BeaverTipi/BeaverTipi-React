import React, { useEffect, useState } from 'react'
import { useSecureAxios } from '../../../hooks/useSecureAxios'

function ContractList() {
  const axios = useSecureAxios();
  const [contractList, setContractList] = useState();
  useEffect(() => {
    axios.get("/cont/mng/list")
      .then(data => setContractList(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
    </>
  )
}

export default ContractList