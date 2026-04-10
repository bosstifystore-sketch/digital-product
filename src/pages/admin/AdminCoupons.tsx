import { useEffect, useState } from 'react'
import { supabase, type Coupon } from '../../lib/supabaseClient'
import { Plus, Trash2, Tag, Percent, Calendar, CheckSquare, XSquare } from 'lucide-react'

const emptyForm = { code: '', discount_percentage: 10, is_active: true, usage_limit: '' as string | number, expires_at: '' }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function fetchCoupons() {
    setLoading(true)
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (data) setCoupons(data as Coupon[])
    if (error) showToast(error.message, 'error')
    setLoading(false)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAddCoupon() {
    if (!form.code) { showToast('Coupon code is required', 'error'); return }
    if (form.discount_percentage <= 0 || form.discount_percentage > 100) { showToast('Discount must be between 1 and 100', 'error'); return }
    setSaving(true)

    const payload = {
      code: form.code.toUpperCase(),
      discount_percentage: form.discount_percentage,
      is_active: form.is_active,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null
    }

    const { error } = await supabase.from('coupons').insert(payload)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Coupon created successfully')
      setForm(emptyForm)
      fetchCoupons()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) showToast(error.message, 'error')
    else fetchCoupons()
  }

  async function toggleActive(code: Coupon) {
    const { error } = await supabase.from('coupons').update({ is_active: !code.is_active }).eq('id', code.id)
    if (error) showToast(error.message, 'error')
    else fetchCoupons()
  }

  return (
    <div className="admin-content" style={{ padding: '20px' }}>
      {toast && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Coupon Codes</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create and manage discount codes for your customers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        {/* ADD COUPON FORM */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} style={{ color: 'var(--accent)' }} /> Add New Coupon
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={14}/> Code</label>
              <input className="form-input" placeholder="e.g. DIWALI50" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Percent size={14}/> Discount Percentage (%)</label>
              <input type="number" className="form-input" min={1} max={100} value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: Number(e.target.value) })} />
            </div>

            <div className="form-group">
              <label className="form-label">Usage Limit (Optional)</label>
              <input type="number" className="form-input" placeholder="e.g. 1 for one-time use" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14}/> Expiry Date (Optional)</label>
              <input type="datetime-local" className="form-input" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              <label className="form-label" style={{ margin: 0 }}>Active</label>
            </div>

            <button className="btn btn-primary w-full" onClick={handleAddCoupon} disabled={saving}>
              {saving ? 'Saving...' : 'Create Coupon'}
            </button>
          </div>
        </div>

        {/* COUPONS LIST */}
        <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Existing Coupons</h2>
          {loading ? (
             <div className="spinner" />
          ) : coupons.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>No coupons found.</p>
          ) : (
            <div className="table-wrap">
              <table style={{ width: '100%', minWidth: 600 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0 0 12px 0' }}>Code</th>
                    <th style={{ padding: '0 0 12px 0' }}>Discount</th>
                    <th style={{ padding: '0 0 12px 0' }}>Status</th>
                    <th style={{ padding: '0 0 12px 0' }}>Usage</th>
                    <th style={{ padding: '0 0 12px 0' }}>Expires At</th>
                    <th style={{ padding: '0 0 12px 0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {coupons.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 0', fontWeight: 700 }}>{c.code}</td>
                      <td>{c.discount_percentage}% OFF</td>
                      <td>
                        <button 
                          onClick={() => toggleActive(c)} 
                          className="btn btn-sm" 
                          style={{ background: c.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.is_active ? '#10b981' : '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          {c.is_active ? <><CheckSquare size={14}/> Active</> : <><XSquare size={14}/> Inactive</>}
                        </button>
                      </td>
                      <td>{c.used_count} / {c.usage_limit || '∞'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.expires_at ? new Date(c.expires_at).toLocaleString() : 'Never'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
