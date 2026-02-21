import React, {useState} from 'react'

export default function MembershipForm(){
  const [duration, setDuration] = useState('6')
  const [membershipNumber, setMembershipNumber] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    alert(`Membership ${membershipNumber || '(new)'} set for ${duration} months`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Add / Update Membership</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Membership Number (required to update)</label>
            <input value={membershipNumber} onChange={e=>setMembershipNumber(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Duration</label>
            <div className="mt-2 flex gap-3">
              <label className={`inline-flex items-center px-3 py-2 border rounded ${duration==='6'? 'bg-teal-50 border-teal-200':''}`}>
                <input type="radio" name="duration" value="6" checked={duration==='6'} onChange={()=>setDuration('6')} className="mr-2" /> 6 months
              </label>
              <label className={`inline-flex items-center px-3 py-2 border rounded ${duration==='12'? 'bg-teal-50 border-teal-200':''}`}>
                <input type="radio" name="duration" value="12" checked={duration==='12'} onChange={()=>setDuration('12')} className="mr-2" /> 1 year
              </label>
              <label className={`inline-flex items-center px-3 py-2 border rounded ${duration==='24'? 'bg-teal-50 border-teal-200':''}`}>
                <input type="radio" name="duration" value="24" checked={duration==='24'} onChange={()=>setDuration('24')} className="mr-2" /> 2 years
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-teal-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
