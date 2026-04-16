import { useNavigate } from 'react-router-dom'
import type { Product } from '../lib/supabaseClient'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate()
  const validImages = product.images?.filter(img => img && img.trim() !== '') || []
  const mainImage = validImages[0] || 'https://placehold.co/400x300/13131f/7c3aed?text=Bosstify'

  return (
    <div className="card product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card-img-wrap">
        <img
          src={mainImage}
          alt={product.title}
          className="product-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/13131f/7c3aed?text=Bosstify'
          }}
        />
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category.replace('_', ' ')}</span>
        <h3 className="product-card-title" title={product.title}>{product.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <p className="product-card-price" style={{ margin: 0 }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <span className={`product-card-badge ${product.stock_status ? 'badge-instock' : 'badge-outstock'}`} style={{ position: 'static', margin: 0 }}>
            {product.stock_status ? 'In Stock' : 'Sold'}
          </span>
        </div>
      </div>
    </div>
  )
}
