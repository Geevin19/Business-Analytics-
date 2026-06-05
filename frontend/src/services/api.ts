import axios from 'axios'
import { supabase } from '@/lib/supabase'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase JWT on every request
api.interceptors.request.use(async config => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  }
)

export default api
