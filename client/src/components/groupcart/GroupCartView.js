import React from 'react'

export default function GroupCartView({ cart, onUpdateQty, onRemove }) {
  return (
    <div className="border rounded-lg">
      <div className="grid grid-cols-4 gap-2 p-3 font-semibold">
        <div>Item</div>
        <div>Price</div>
        <div>Qty</div>
        <div>Subtotal</div>
      </div>
      {cart.items.map(i=>(
        <div key={i._id} className="grid grid-cols-4 gap-2 p-3 border-t">
          <div>{i.title || i.product}</div>
          <div>₹{i.priceSnapshot.toFixed(2)}</div>
          <div className="flex gap-2">
            <button onClick={()=>onUpdateQty(i._id, Math.max(1, i.quantity-1))} className="px-2 border rounded">-</button>
            <div className="w-10 text-center">{i.quantity}</div>
            <button onClick={()=>onUpdateQty(i._id, i.quantity+1)} className="px-2 border rounded">+</button>
            <button onClick={()=>onRemove(i._id)} className="px-2 border rounded ml-2">Remove</button>
          </div>
          <div>₹{(i.priceSnapshot*i.quantity).toFixed(2)}</div>
        </div>
      ))}
      {!cart.items.length && <div className="p-4">No items</div>}
    </div>
  )
}
