import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM audiences ORDER BY short_name ASC`)
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { short_name, description, shopify_segment } = req.body
  const { rows } = await pool.query(
    `INSERT INTO audiences (short_name, description, shopify_segment)
     VALUES ($1, $2, $3) ON CONFLICT (short_name) DO UPDATE
     SET description=$2, shopify_segment=$3 RETURNING *`,
    [short_name, description, shopify_segment]
  )
  res.status(201).json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query(`DELETE FROM audiences WHERE id=$1`, [req.params.id])
  res.json({ ok: true })
})

export default router
