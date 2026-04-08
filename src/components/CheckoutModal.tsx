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

  if (!isOpen) return null

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
        price: amount,
        category: product.category,
        image: product.images?.[0] || '',
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
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Scan the QR code below to pay <strong>₹{amount.toLocaleString('en-IN')}</strong>
          </p>
          
          <div style={{ background: '#fff', padding: 12, borderRadius: 16, display: 'inline-block', marginBottom: 16 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=admin@ybl&pn=DigiStore&am=${amount}&cu=INR`} 
              alt="Payment QR Code" 
              style={{ width: 'min(160px, 40vw)', height: 'min(160px, 40vw)', display: 'block' }}
            />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>UPI ID: <strong>admin@ybl</strong> (Placeholder)</p>
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
