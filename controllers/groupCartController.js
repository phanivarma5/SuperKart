import GroupCart from '../models/GroupCart.js'
import Product from '../models/productModel.js'
import Order from '../models/orderModel.js'
import DeliverySlot from '../models/DeliverySlot.js'
import DeliverySlotHold from '../models/DeliverySlotHold.js'
import mongoose from 'mongoose'

const createCart = async (req, res) => {
  const cart = new GroupCart({ items: [], log: '' })
  await cart.save()
  res.status(201).json(cart)
}

const getCart = async (req, res) => {
  const cart = await GroupCart.findById(req.params.cartId)
  if (!cart) return res.status(404).json({ message: 'Not found' })
  res.json(cart)
}

const getCarts = async (req, res) => {
  const cart = await GroupCart.find()
  if (!cart) return res.status(404).json({ message: 'Not found' })
  res.json(cart)
}

const addItem = async (req, res) => {
  const { productId, quantity } = req.body
  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  const cart = await GroupCart.findById(req.params.cartId)
  if (!cart) return res.status(404).json({ message: 'Cart not found' })

  const idx = cart.items.findIndex(i => i.product.toString() === productId)
  if (idx >= 0) {
    cart.items[idx].quantity += quantity
    cart.items[idx].priceSnapshot = product.price
    cart.items[idx].title = product.name || product.title || ''
  } else {
    cart.items.push({
      product: product._id,
      title: product.name || product.title || '',
      priceSnapshot: product.price,
      quantity
    })
  }

  cart.log = `Item ${productId} added/updated`
  await cart.save()
  res.json(cart)
}

const removeItem = async (req, res) => {
  const cart = await GroupCart.findById(req.params.cartId)
  if (!cart) return res.status(404).json({ message: 'Cart not found' })
  const item = cart.items.id(req.params.itemId)
  if (!item) return res.status(404).json({ message: 'Item not found' })
  item.remove()
  cart.log = `Item ${req.params.itemId} removed`
  await cart.save()
  res.json(cart)
}

const checkout = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const { slotId, holdId, userId } = req.body
    session.startTransaction()

    const cart = await GroupCart.findById(req.params.cartId).session(session)
    if (!cart) {
      await session.abortTransaction()
      return res.status(404).json({ message: 'Cart not found' })
    }
    if (!cart.items.length) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Cart empty' })
    }

    const hold = await DeliverySlotHold.findOne({ _id: holdId, slot: slotId }).session(session)
    if (!hold) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Hold not found' })
    }
    if (hold.expiresAt <= new Date()) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Hold expired' })
    }

    const slotDoc = await DeliverySlot.findById(slotId).session(session)
    const holdsCount = await DeliverySlotHold.countDocuments({
      slot: slotId,
      expiresAt: { $gt: new Date() }
    }).session(session)
    const remaining = slotDoc.capacity - slotDoc.bookedCount - holdsCount
    if (remaining <= 0) {
      await session.abortTransaction()
      return res.status(409).json({ message: 'Slot full' })
    }

    await DeliverySlot.updateOne({ _id: slotId }, { $inc: { bookedCount: 1 } }).session(session)
    await DeliverySlotHold.deleteOne({ _id: holdId }).session(session)

    const items = cart.items.map(i => ({
      product: i.product,
      title: i.title,
      price: i.priceSnapshot,
      quantity: i.quantity
    }))
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

    const order = await Order.create([{
      user: userId,
      groupCart: cart._id,
      items,
      total,
      deliverySlot: slotId,
      paymentStatus: 'paid',
      status: 'created'
    }], { session })

    cart.log = 'Checked out'
    await cart.save({ session })
    await session.commitTransaction()

    res.status(201).json(order[0])
  } catch (e) {
    await session.abortTransaction()
    res.status(500).json({ message: 'Checkout failed' })
  } finally {
    session.endSession()
  }
}

export {
  createCart,
  getCart,
  addItem,
  removeItem,
  checkout,
  getCarts
}
