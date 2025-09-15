import express from 'express'
const router = express.Router()
import * as c from '../controllers/deliverySlotController.js'

router.get('/', c.listSlots)
router.post('/seed', c.seedSlots)
router.post('/hold', c.holdSlot)

export default router;
