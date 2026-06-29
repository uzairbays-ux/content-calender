import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db.js'
import cardsRouter from './routes/cards.js'
import brandsRouter from './routes/brands.js'
import audiencesRouter from './routes/audiences.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' })) // large enough for base64 images

app.use('/api/cards', cardsRouter)
app.use('/api/brands', brandsRouter)
app.use('/api/audiences', audiencesRouter)

app.get('/api/health', (_, res) => res.json({ ok: true }))

initDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`))
}).catch(err => {
  console.error('DB init failed:', err)
  process.exit(1)
})
