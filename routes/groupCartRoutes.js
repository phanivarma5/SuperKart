import express from 'express'
const router = express.Router()
import * as c from '../controllers/groupCartController.js'

router.post('/', c.createCart)
router.get('/', c.getCarts)
router.get('/:cartId', c.getCart)
router.post('/:cartId/items', c.addItem)
router.delete('/:cartId/items/:itemId', c.removeItem)
router.post('/:cartId/checkout', c.checkout)

export default router;
