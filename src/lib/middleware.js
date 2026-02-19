import { verifyToken } from './jwt';
import { getUserById, getGigById } from './db';

export async function authenticateRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return { error: 'Invalid or expired token', status: 401 };
    }

    const user = await getUserById(decoded.userId);
    if (!user) {
        return { error: 'User not found', status: 404 };
    }

    return { user };
}

export async function authorizeGigOwner(request, gigId) {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth;

    const gig = await getGigById(gigId);
    if (!gig) {
        return { error: 'Gig not found', status: 404 };
    }

    if (gig.sellerId !== auth.user.id) {
        return { error: 'Forbidden: You can only edit/delete your own gigs', status: 403 };
    }

    return { user: auth.user, gig };
}
