// backend/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.post('/create-user', async (req, res) => {
  const { email, password, nome } = req.body

  if (!email || !password || !nome) {
    return res.status(400).json({ error: 'Campi mancanti' })
  }

  try {
    // 1. Crea l'utente con auth
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const userId = user.user.id

    // 2. Inserisce nella tabella 'utentiNew'
    const { error: insertError } = await supabase
      .from('utentiNew')
      .insert([{ auth_id: userId, email, nome }])

    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    res.status(200).json({ message: 'Utente creato con successo' })
  } catch (err) {
    res.status(500).json({ error: 'Errore del server' })
  }
})
// ✅ Rotta base per testare se il server risponde
app.get('/', (req, res) => {
  res.send('API Backend attiva 🚀')
})

app.listen(port, () => {
  console.log(`✅ Server attivo su http://localhost:${port}`)
})
