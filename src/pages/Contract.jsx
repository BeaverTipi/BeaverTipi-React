import { Outlet } from 'react-router'
import { ContractInfoProvider } from '../context/ContractInfoContext'

function Contract() {
  return (
    <>

      <ContractInfoProvider>
        <Outlet />
      </ContractInfoProvider>
    </>
  )
}

export default Contract