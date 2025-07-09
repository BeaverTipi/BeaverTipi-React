import { useEffect } from "react";
import { useAxios } from "../../hooks/useAxios"


function ContractListingSelect() {

  const axios = useAxios();

  useEffect(() => {
    axios.get("/cont/new/listing")
      .then(data => {
        console.log("햐ㅏ하", data);

      })
      .catch(error => console.log("안된다~", error))


  }, []);
  return (
    <>
      <span>하하하하하하하하</span>
    </>
  )
}

export default ContractListingSelect