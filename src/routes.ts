// src/routes.ts
import type { Express } from 'express'
import { supabase, supabaseAdmin } from './supabase'
import { Pool } from 'pg'
import { authenticate } from './middleware'

// Initialize Postgres pool using DATABASE_URL from .env
const db = new Pool({ connectionString: process.env.DATABASE_URL })

export function registerRoute(app: Express) {
  // ─── Registration ────────────────────────────────────────────────
  app.post('/api/register', async (req, res) => {
    const { email, password, username, referral_code } = req.body
    if (!referral_code) {
      return res.status(400).json({ error: 'Referral code required' })
    }

    // 1️⃣ Check referral exists in local DB
    const { rowCount } = await db.query(
      'SELECT 1 FROM users WHERE referral_code=$1',
      [referral_code]
    )
    if (!rowCount) {
      return res.status(400).json({ error: 'Invalid referral code' })
    }

    // 2️⃣ Create Supabase Auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { referral_code },
    })
    if (error || !data.user) {
      return res.status(400).json({ error: error?.message })
    }

    // 3️⃣ Insert local profile
    await db.query(
      `INSERT INTO users(id, email, username, referral_code)
       VALUES($1, $2, $3, $4)`,
      [data.user.id, email, username, referral_code]
    )

    res.status(201).json({ user: { id: data.user.id, email, username } })
  })

  // ─── Login ────────────────────────────────────────────────────────
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Fetch local profile
    const { rows } = await db.query(
      'SELECT id, email, username FROM users WHERE id=$1',
      [data.user.id]
    )
    res.json({ user: rows[0], session: data.session })
  })

  // ─── Current User (“Me”) ─────────────────────────────────────────
  app.get(
    '/api/me',
    authenticate,
    async (req, res) => {
      const userId = (req as any).user.id
      try {
        const { rows } = await db.query(
          `SELECT id, email, username, onboarding_status
           FROM users
           WHERE id = $1`,
          [userId]
        )
        if (!rows[0]) {
          return res.status(404).json({ error: 'User not found' })
        }
        res.json({ user: rows[0] })
      } catch (err: any) {
        res.status(500).json({ error: err.message })
      }
    }
  )

  // ─── List Loans ───────────────────────────────────────────────────
  app.get(
    '/api/loans',
    authenticate,
    async (req, res) => {
      const user = (req as any).user
      try {
        const { rows } = await db.query(
          'SELECT id, amount, term_months, purpose, status, created_at FROM loans WHERE user_id = $1',
          [user.id]
        )
        res.json({ loans: rows })
      } catch (err: any) {
        res.status(500).json({ error: err.message })
      }
    }
  )
}
