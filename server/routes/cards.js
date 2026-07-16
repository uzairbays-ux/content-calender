import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { brand_id, platform, status, date_from, date_to } = req.query
  let where = []
  let params = []
  let i = 1

  if (brand_id) { where.push(`brand_id = $${i++}`); params.push(brand_id) }
  if (platform) { where.push(`platform = $${i++}`); params.push(platform) }
  if (status) { where.push(`status = $${i++}`); params.push(status) }
  if (date_from) { where.push(`date >= $${i++}`); params.push(date_from) }
  if (date_to) { where.push(`date <= $${i++}`); params.push(date_to) }

  const sql = `SELECT * FROM content_cards ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date ASC, created_at DESC`
  const { rows } = await pool.query(sql, params)
  res.json(rows)
})

router.post('/', async (req, res) => {
  const {
    title, brand_id, brand_name, collection, product_name, product_url,
    platform, post_type, audience_name, audience_description,
    copy, hashtags, image_data, notes, status, date, time, created_by,
    flow_id, flow_name, flow_step, flow_total, step_reason
  } = req.body

  const { rows } = await pool.query(
    `INSERT INTO content_cards
      (title, brand_id, brand_name, collection, product_name, product_url,
       platform, post_type, audience_name, audience_description,
       copy, hashtags, image_data, notes, status, date, time, created_by,
       flow_id, flow_name, flow_step, flow_total, step_reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
     RETURNING *`,
    [title, brand_id || null, brand_name, collection, product_name, product_url,
     platform, post_type, audience_name, audience_description,
     copy, hashtags, image_data, notes, status || 'draft', date || null, time || null, created_by,
     flow_id || null, flow_name || null, flow_step || null, flow_total || null, step_reason || null]
  )
  res.status(201).json(rows[0])
})

router.put('/:id', async (req, res) => {
  const {
    title, brand_id, brand_name, collection, product_name, product_url,
    platform, post_type, audience_name, audience_description,
    copy, hashtags, image_data, notes, status, date, time, created_by,
    flow_id, flow_name, flow_step, flow_total, step_reason
  } = req.body

  const { rows } = await pool.query(
    `UPDATE content_cards SET
      title=$1, brand_id=$2, brand_name=$3, collection=$4, product_name=$5, product_url=$6,
      platform=$7, post_type=$8, audience_name=$9, audience_description=$10,
      copy=$11, hashtags=$12, image_data=$13, notes=$14, status=$15,
      date=$16, time=$17, created_by=$18,
      flow_id=$19, flow_name=$20, flow_step=$21, flow_total=$22, step_reason=$23,
      updated_at=NOW()
     WHERE id=$24 RETURNING *`,
    [title, brand_id || null, brand_name, collection, product_name, product_url,
     platform, post_type, audience_name, audience_description,
     copy, hashtags, image_data, notes, status, date || null, time || null, created_by,
     flow_id || null, flow_name || null, flow_step || null, flow_total || null, step_reason || null,
     req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Card not found' })
  res.json(rows[0])
})

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  const { rows } = await pool.query(
    `UPDATE content_cards SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, req.params.id]
  )
  res.json(rows[0])
})

router.patch('/:id/date', async (req, res) => {
  const { date } = req.body
  // placing a card on the calendar always takes it out of the stash
  const { rows } = await pool.query(
    `UPDATE content_cards SET date=$1, stashed=false, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [date, req.params.id]
  )
  res.json(rows[0])
})

router.patch('/:id/stash', async (req, res) => {
  const { stashed } = req.body
  // stashing removes the card from the calendar; unstashing returns it to the backlog
  const { rows } = await pool.query(
    stashed
      ? `UPDATE content_cards SET stashed=true, date=NULL, time=NULL, updated_at=NOW() WHERE id=$1 RETURNING *`
      : `UPDATE content_cards SET stashed=false, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [req.params.id]
  )
  res.json(rows[0])
})

router.delete('/all', async (req, res) => {
  await pool.query(`DELETE FROM content_cards`)
  res.json({ ok: true, deleted: 'all' })
})

router.delete('/:id', async (req, res) => {
  await pool.query(`DELETE FROM content_cards WHERE id=$1`, [req.params.id])
  res.json({ ok: true })
})

export default router
