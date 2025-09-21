import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function DeliverySlotPicker({ onHold, selectedSlotId }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState({ from: new Date().toISOString(), to: new Date(Date.now()+7*24*60*60*1000).toISOString() })

  const load = async () => {
    setLoading(true)
    const { data } = await axios.get('/api/delivery-slots', { params: range })
    setSlots(data)
    setLoading(false)
  }

  useEffect(()=>{ load() }, [range.from, range.to])

  if (loading) return <div>Loading slots...</div>

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="date" value={new Date(range.from).toISOString().slice(0,10)} onChange={e=>setRange(r=>({ ...r, from: new Date(e.target.value).toISOString() }))} className="border rounded px-2 py-1" />
        <input type="date" value={new Date(range.to).toISOString().slice(0,10)} onChange={e=>setRange(r=>({ ...r, to: new Date(e.target.value).toISOString() }))} className="border rounded px-2 py-1" />
        <button onClick={load} className="px-3 py-1 border rounded">Refresh</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {slots.map(s=>(
          <div key={s._id} className={`border rounded p-3 ${selectedSlotId===s._id ? 'ring-2 ring-black' : ''}`}>
            <div className="font-medium">{new Date(s.start).toLocaleString()} → {new Date(s.end).toLocaleTimeString()}</div>
            <div className="text-sm">Available: {s.available}</div>
            <button disabled={s.available<=0} onClick={()=>onHold(s._id)} className="mt-2 px-3 py-1 rounded bg-black text-white disabled:opacity-50">
              {selectedSlotId===s._id ? 'Held' : 'Hold Slot'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
