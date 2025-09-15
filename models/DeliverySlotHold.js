import mongoose from 'mongoose'

const DeliverySlotHoldSchema = new mongoose.Schema({
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliverySlot', required: true },
  byGroupCart: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupCart' },
  byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

DeliverySlotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const DeliverySlotHold = mongoose.model('DeliverySlotHold', DeliverySlotHoldSchema)
export default DeliverySlotHold
