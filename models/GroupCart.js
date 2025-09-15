import mongoose from 'mongoose'

const GroupCartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  priceSnapshot: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
})


const GroupCartSchema = new mongoose.Schema({
  items: [GroupCartItemSchema],
  log: { type: String }
}, { timestamps: true })

const GroupCart = mongoose.model('GroupCart', GroupCartSchema)
export default GroupCart
