import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM brands ORDER BY name ASC`)
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { name, color } = req.body
  const { rows } = await pool.query(
    `INSERT INTO brands (name, color) VALUES ($1, $2) RETURNING *`,
    [name, color || '#1976d2']
  )
  res.status(201).json(rows[0])
})

router.put('/:id', async (req, res) => {
  const { name, color } = req.body
  const { rows } = await pool.query(
    `UPDATE brands SET name=$1, color=$2 WHERE id=$3 RETURNING *`,
    [name, color, req.params.id]
  )
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query(`DELETE FROM brands WHERE id=$1`, [req.params.id])
  res.json({ ok: true })
})

export default router
