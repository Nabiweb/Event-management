import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container px-4 py-6 text-sm text-gray-600">© {new Date().getFullYear()} Event Management · Built with React & Tailwind</div>
    </footer>
  )
}
