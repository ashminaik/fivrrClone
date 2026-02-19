import { getGigById, getUserById } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import OrderButton from './OrderButton';
import ChatButton from './ChatButton';
import ReviewsSection from './ReviewsSection';

function getCategoryIcon(category) {
    const icons = {
        'Web Development': '💻',
        'Design': '🎨',
        'Marketing': '📈',
        'Writing': '✍️',
        'Video': '🎬',
        'Music': '🎵',
        'Programming & Tech': '💻',
        'Graphics & Design': '🎨',
        'Digital Marketing': '📈',
        'Writing & Translation': '✍️',
        'Video & Animation': '🎬',
        'Business & Finance': '💼',
        'Data & Analytics': '📊',
    };
    return icons[category] || '✨';
}

function getAvatarColor(name) {
    const colors = ['#3b82f6', '#d946ef', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default async function GigDetailPage({ params }) {
    const { id } = await params;
    const gig = await getGigById(id);

    if (!gig) {
        notFound();
    }

    const seller = await getUserById(gig.sellerId);

    return (
        <div className="gig-detail">
            <div className="container">
                <div className="gig-detail-layout">
                    {/* Left column */}
                    <div>
                        <div className="gig-detail-image">
                            {(gig.images && gig.images.length > 0) || gig.image ? (
                                <img src={gig.images?.[0] || gig.image} alt={gig.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span className="category-icon">{getCategoryIcon(gig.category)}</span>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                                {gig.title}
                            </h1>

                            <div className="gig-detail-seller">
                                <div
                                    className="avatar avatar-lg"
                                    style={{ background: getAvatarColor(seller?.name || 'Unknown') }}
                                >
                                    {(seller?.name || 'U')[0]}
                                </div>
                                <div className="gig-detail-seller-info">
                                    <span className="gig-detail-seller-name">{seller?.name || 'Unknown'}</span>
                                    <div className="stars">
                                        {'★'.repeat(Math.floor(gig.rating || 0))}{'☆'.repeat(5 - Math.floor(gig.rating || 0))}
                                        <span className="rating-value">{(gig.rating ?? 0).toFixed(1)}</span>
                                        <span className="review-count">({gig.reviewCount ?? 0} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <span className="badge badge-primary">{gig.category}</span>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About This Service</h3>
                            <p className="gig-detail-description">{gig.description}</p>

                            <ReviewsSection gigId={gig.id} sellerId={gig.sellerId} />
                        </div>
                    </div>

                    {/* Right column — Purchase card */}
                    <div className="purchase-card">
                        <div className="price">
                            ₹{gig.price} <span>/ project</span>
                        </div>

                        <div className="purchase-includes">
                            <h4>What&apos;s Included</h4>
                            <ul>
                                <li>Full project delivery</li>
                                <li>Source files included</li>
                                <li>3 revision rounds</li>
                                <li>{gig.deliveryTime || '5 days'} delivery</li>
                            </ul>
                        </div>

                        <OrderButton gigId={gig.id} sellerId={gig.sellerId} price={gig.price} />
                        <ChatButton gigId={gig.id} sellerId={gig.sellerId} />

                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                            Secure checkout • Money-back guarantee
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
