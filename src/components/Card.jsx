import React from 'react'

export default function Card({title, children}){
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )
}
