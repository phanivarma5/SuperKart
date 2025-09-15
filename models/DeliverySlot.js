import mongoose from 'mongoose'

const DeliverySlotSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1 },
  bookedCount: { type: Number, default: 0 }
}, { timestamps: true })

DeliverySlotSchema.index({ start: 1, end: 1 }, { unique: true })

const DeliverySlot = mongoose.model('DeliverySlot', DeliverySlotSchema)
export default DeliverySlot

