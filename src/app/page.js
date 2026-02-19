import Link from 'next/link';
import { getFeaturedGigs, getUserById } from '@/lib/db';
import HeroSearch from '@/app/components/HeroSearch';

export const dynamic = 'force-dynamic';

function getAvatarColor(name) {
  const colors = ['#3b82f6', '#d946ef', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getCategoryIcon(category) {
  const icons = {
    'Programming & Tech': '💻',
    'Graphics & Design': '🎨',
    'Digital Marketing': '📈',
    'Writing & Translation': '✍️',
    'Video & Animation': '🎬',
    'Music & Audio': '🎵',
    'Business & Finance': '💼',
    'Data & Analytics': '📊'
  };
  return icons[category] || '✨';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price ?? 0);
}

export default async function HomePage() {
  const featuredGigs = await getFeaturedGigs();

  const gigsWithSellers = await Promise.all(
    featuredGigs.slice(0, 8).map(async (gig) => {
      const seller = await getUserById(gig.sellerId);
      return { 
        ...gig, 
        sellerName: seller?.name || 'Unknown',
        sellerLocation: seller?.location || ''
      };
    })
  );

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              Find the perfect<br />
              <span className="highlight">freelance services</span><br />
              for your business
            </h1>
            <p>
              Connect with talented Indian freelancers. 
              Quality work at affordable prices — from web development to creative design.
            </p>
            <HeroSearch />
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">500+</div>
                <div className="hero-stat-label">Indian Freelancers</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">2K+</div>
                <div className="hero-stat-label">Projects Completed</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">4.8★</div>
                <div className="hero-stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Services</h2>
              <p className="section-subtitle">Handpicked Indian talent for your next project</p>
            </div>
            <Link href="/gigs" className="btn btn-secondary">
              View All →
            </Link>
          </div>

          <div className="gig-grid">
            {gigsWithSellers.map((gig) => (
              <Link href={`/gigs/${gig.id}`} key={gig.id} className="gig-card card">
                <div className="gig-card-image">
                  {(gig.images && gig.images.length > 0) || gig.image ? (
                    <img src={gig.images?.[0] || gig.image} alt={gig.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="category-icon">{getCategoryIcon(gig.category)}</span>
                  )}
                  <div className="price-tag">{formatPrice(gig.price)}</div>
                </div>
                <div className="gig-card-body">
                  <div className="gig-card-seller">
                    <div
                      className="avatar"
                      style={{ background: getAvatarColor(gig.sellerName) }}
                    >
                      {gig.sellerName[0]}
                    </div>
                    <div>
                      <span className="gig-card-seller-name">{gig.sellerName}</span>
                      {gig.sellerLocation && (
                        <span className="gig-card-location">📍 {gig.sellerLocation}</span>
                      )}
                    </div>
                  </div>
                  <div className="gig-card-title">{gig.title}</div>
                  <div className="gig-card-footer">
                    <div className="stars">
                      {'★'.repeat(Math.floor(gig.rating))}{'☆'.repeat(5 - Math.floor(gig.rating))}
                      <span className="rating-value">{(gig.rating ?? 0).toFixed(1)}</span>
                      <span className="review-count">({gig.reviewCount ?? 0})</span>
                    </div>
                    <span className="badge badge-primary">{gig.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">fivrrClone</div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            © 2024 fivrrClone. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}