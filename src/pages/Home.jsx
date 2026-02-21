import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function Home(){
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card title="Overview">
        <p className="mb-3">Professional Event Management System UI mock showing Admin, Vendor and User flows.</p>
        <Link to="/login" className="text-teal-600">Go to Login →</Link>
      </Card>

      <Card title="Quick Links">
        <ul className="text-sm space-y-2">
          <li><Link to="/admin" className="text-gray-700 hover:text-teal-600">Admin Dashboard</Link></li>
          <li><Link to="/vendor" className="text-gray-700 hover:text-teal-600">Vendor Area</Link></li>
          <li><Link to="/user" className="text-gray-700 hover:text-teal-600">User Center</Link></li>
        </ul>
      </Card>

      <Card title="Memberships">
        <p className="mb-3">Add or update vendor membership durations — 6 months / 1 year / 2 years.</p>
        <Link to="/membership" className="text-teal-600">Manage Membership →</Link>
      </Card>
    </div>
  )
}
