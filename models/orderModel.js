import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  { timestamps: true }
);

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
})

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupCart: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupCart' },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  deliverySlot: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliverySlot' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'created' }
}, { timestamps: true })

export default mongoose.model("Order", orderSchema);