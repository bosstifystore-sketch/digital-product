import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { X, Upload, CheckCircle } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  amount: number
  product: any
  userProfileUrl?: string
  onClose: () => void
}

export default function CheckoutModal({ isOpen, amount, product, userProfileUrl, onClose }: CheckoutModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [verifyingCoupon, setVerifyingCoupon] = useState(false)

  if (!isOpen) return null

  const finalAmount = appliedCoupon ? amount - (amount * (appliedCoupon.discount_percentage / 100)) : amount

  async function handleApplyCoupon() {
    if (!couponCode) return
    setVerifyingCoupon(true)
    setCouponError('')
    
    const { data, error } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single()
    
    if (error || !data) {
      setCouponError('Invalid coupon code')
      setAppliedCoupon(null)
    } else {
      if (!data.is_active) {
        setCouponError('This coupon is no longer active')
      } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError('This coupon has expired')
      } else if (data.usage_limit && data.used_count >= data.usage_limit) {
        setCouponError('This coupon has reached its usage limit')
      } else {
        setAppliedCoupon(data)
        setCouponError('')
      }
    }
    setVerifyingCoupon(false)
  }

  async function handlePlaceOrder() {
    if (!user) { navigate('/login'); return }
    if (!screenshotFile) { setError('Please upload a payment screenshot'); return }
    
    setBuying(true)
    setError('')

    // 1. Upload screenshot
    const fileExt = screenshotFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('payment_screenshots')
      .upload(`public/${fileName}`, screenshotFile)

    if (uploadError) {
      setError('Failed to upload screenshot. Try again.')
      setBuying(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('payment_screenshots')
      .getPublicUrl(`public/${fileName}`)

    // 2. Insert order
    const orderData: any = {
      user_id: user.id,
      product_id: product.id !== 'dynamic-follower-package' ? product.id : null,
      product_details: {
        title: product.title,
        original_price: amount,
        price: finalAmount,
        category: product.category,
        image: product.images?.[0] || '',
        coupon_applied: appliedCoupon ? appliedCoupon.code : null,
        discount_percentage: appliedCoupon ? appliedCoupon.discount_percentage : 0
      },
      status: 'pending',
      payment_screenshot_url: publicUrlData.publicUrl
    }

    if (userProfileUrl) {
      orderData.product_details.target_url = userProfileUrl;
    }

    const { error: orderError } = await supabase.from('orders').insert(orderData)

    if (orderError) {
      setError('Failed to place order. Please try again.')
    } else {
      // If coupon used, increment used_count
      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id }).catch(() => {
           // Fallback if RPC doesn't exist, just try direct update
           supabase.from('coupons').update({ used_count: appliedCoupon.used_count + 1 }).eq('id', appliedCoupon.id).then()
        })
      }
      setSuccess(true)
      setTimeout(() => navigate('/orders'), 2000)
    }
    setBuying(false)
  }

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: 450, textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your payment proof has been submitted. Admins will verify it shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Complete Payment</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <label className="form-label">Have a Coupon Code?</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter code" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon}
            />
            {appliedCoupon ? (
              <button className="btn btn-secondary" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>Remove</button>
            ) : (
              <button className="btn btn-primary" onClick={handleApplyCoupon} disabled={verifyingCoupon || !couponCode}>
                {verifyingCoupon ? '...' : 'Apply'}
              </button>
            )}
          </div>
          {couponError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8 }}>{couponError}</p>}
          {appliedCoupon && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 8 }}>✓ Code applied: {appliedCoupon.discount_percentage}% OFF</p>}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Scan the QR code below to pay 
            {appliedCoupon && <span style={{ textDecoration: 'line-through', marginRight: 8, opacity: 0.5 }}>₹{amount.toLocaleString('en-IN')}</span>}
            <strong style={{ color: appliedCoupon ? '#10b981' : 'inherit' }}>₹{finalAmount.toLocaleString('en-IN')}</strong>
          </p>
          
          <div style={{ background: '#fff', padding: 12, borderRadius: 16, display: 'inline-block', marginBottom: 16 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9523502242@pthdfc&pn=Bosstify&am=${finalAmount}&cu=INR`} 
              alt="Payment QR Code" 
              style={{ width: 'min(160px, 40vw)', height: 'min(160px, 40vw)', display: 'block' }}
            />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>UPI ID: <strong>9523502242@pthdfc</strong></p>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> Upload Payment Screenshot *
          </label>
          <input 
            type="file" 
            accept="image/*"
            className="form-input" 
            style={{ padding: '8px' }}
            onChange={e => setScreenshotFile(e.target.files?.[0] || null)}
          />
        </div>
        
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button 
          className="btn btn-primary btn-lg w-full" 
          onClick={handlePlaceOrder}
          disabled={buying}
          style={{ marginTop: 8 }}
        >
          {buying ? 'Verifying & Placing Order...' : 'Submit Payment Proof'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Your order will be processed once an admin verifies the screenshot.
        </p>
      </div>
    </div>
  )
}
