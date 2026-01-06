import DashboardLayout from '@/layouts/dashboardLayout'
import UserLayout from '@/layouts/UserLayout'
import React from 'react'

const MyConnections = () => {
  return (
    <UserLayout>
      <DashboardLayout>
        <h1>My Connections</h1>
      </DashboardLayout>
    </UserLayout>
  )
}

export default MyConnections
