import React from 'react'
import { Outlet } from 'react-router'

function Listing() {
  return (
    <>
      <div>Listing</div>
      <Outlet />
    </>
  )
}

export default Listing