import DeliverySlot from '../models/DeliverySlot.js'
import DeliverySlotHold from '../models/DeliverySlotHold.js'

export const listSlots = async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date()
  const to = req.query.to ? new Date(req.query.to) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const slots = await DeliverySlot.find({ start: { $gte: from }, end: { $lte: to } }).sort({ start: 1 })
  const holds = await DeliverySlotHold.aggregate([
    { $match: { expiresAt: { $gt: new Date() } } },
    { $group: { _id: '$slot', holds: { $sum: 1 } } }
  ])
  const holdMap = new Map(holds.map(h => [h._id.toString(), h.holds]))
  const data = slots.map(s => {
    const h = holdMap.get(s._id.toString()) || 0
    const available = Math.max(0, s.capacity - s.bookedCount - h)
    return { _id: s._id, start: s.start, end: s.end, capacity: s.capacity, bookedCount: s.bookedCount, holds: h, available }
  })
  res.json(data)
}

export const seedSlots = async (req, res) => {
  const { dayCount, dailyStartHour, slotMinutes, slotsPerDay, capacity } = req.body
  const startDate = new Date()
  startDate.setMinutes(0, 0, 0)
  const docs = []
  for (let d = 0; d < dayCount; d++) {
    for (let s = 0; s < slotsPerDay; s++) {
      const start = new Date(startDate)
      start.setDate(start.getDate() + d)
      start.setHours(dailyStartHour)
      start.setMinutes(s * slotMinutes)
      const end = new Date(start)
      end.setMinutes(end.getMinutes() + slotMinutes)
      docs.push({ start, end, capacity })
    }
  }
  const created = await DeliverySlot.insertMany(docs, { ordered: false }).catch(() => [])
  res.status(201).json({ created: created.length })
}

export const holdSlot = async (req, res) => {
  const { slotId, groupCartId, userId, holdMinutes } = req.body
  const slot = await DeliverySlot.findById(slotId)
  if (!slot) return res.status(404).json({ message: 'Slot not found' })
  const activeHolds = await DeliverySlotHold.countDocuments({ slot: slotId, expiresAt: { $gt: new Date() } })
  const available = slot.capacity - slot.bookedCount - activeHolds
  if (available <= 0) return res.status(409).json({ message: 'No availability' })
  const expiresAt = new Date(Date.now() + (holdMinutes ? holdMinutes : 15) * 60 * 1000)
  const hold = await DeliverySlotHold.create({ slot: slotId, byGroupCart: groupCartId || undefined, byUser: userId || undefined, expiresAt })
  res.status(201).json({ holdId: hold._id, expiresAt })
}
