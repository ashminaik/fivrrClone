import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['client', 'freelancer'] },
  avatar: { type: String, default: null },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: String, required: true }
});

// Gig Schema
const GigSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sellerId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: null },
  images: [{ type: String }],
  deliveryTime: { type: String, default: '5 days' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: String, required: true }
});

// Order Schema - status: Pending → In Progress → Delivered → Completed
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  gigId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'] },
  createdAt: { type: String, required: true }
});

// Review Schema
const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  gigId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: String, required: true }
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Gig = mongoose.models.Gig || mongoose.model('Gig', GigSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// User functions
export async function getUsers() {
  await connectDB();
  return await User.find({}).lean();
}

export async function getUserById(id) {
  await connectDB();
  return await User.findOne({ id }).lean();
}

export async function getUserByEmail(email) {
  await connectDB();
  return await User.findOne({ email }).lean();
}

export async function createUser(user) {
  await connectDB();
  const newUser = new User(user);
  return await newUser.save();
}

// Gig functions
export async function getGigs() {
  await connectDB();
  return await Gig.find({}).lean();
}

export async function getFeaturedGigs() {
  await connectDB();
  const gigs = await Gig.find({}).sort({ createdAt: -1 }).limit(12).lean();
  return gigs;
}

export async function getGigById(id) {
  await connectDB();
  return await Gig.findOne({ id }).lean();
}

export async function getGigsBySeller(sellerId) {
  await connectDB();
  return await Gig.find({ sellerId }).lean();
}

export async function createGig(gig) {
  await connectDB();
  const newGig = new Gig(gig);
  return await newGig.save();
}

export async function updateGig(id, updates) {
  await connectDB();
  return await Gig.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
}

export async function deleteGig(id) {
  await connectDB();
  return await Gig.findOneAndDelete({ id });
}

// Order functions
export async function getOrders() {
  await connectDB();
  return await Order.find({}).lean();
}

export async function getOrderById(id) {
  await connectDB();
  return await Order.findOne({ id }).lean();
}

export async function getOrdersByBuyer(buyerId) {
  await connectDB();
  return await Order.find({ buyerId }).lean();
}

export async function getOrdersBySeller(sellerId) {
  await connectDB();
  return await Order.find({ sellerId }).lean();
}

export async function createOrder(order) {
  await connectDB();
  const newOrder = new Order(order);
  return await newOrder.save();
}

export async function updateOrder(id, updates) {
  await connectDB();
  return await Order.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
}

// Review functions
export async function getReviewsByGig(gigId) {
  await connectDB();
  return await Review.find({ gigId }).sort({ createdAt: -1 }).lean();
}

export async function getReviewByOrder(orderId) {
  await connectDB();
  return await Review.findOne({ orderId }).lean();
}

export async function getReviewsByBuyer(buyerId) {
  await connectDB();
  return await Review.find({ buyerId }).sort({ createdAt: -1 }).lean();
}

export async function createReview(review) {
  await connectDB();
  const newReview = new Review(review);
  const saved = await newReview.save();
  // Update gig rating
  const reviews = await Review.find({ gigId: review.gigId }).lean();
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Gig.findOneAndUpdate({ id: review.gigId }, { $set: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length } });
  return saved;
}

// Message functions
export async function getMessagesByOrder(orderId) {
  await connectDB();
  return await Message.find({ orderId }).sort({ createdAt: 1 }).lean();
}

export async function createMessage(message) {
  await connectDB();
  const newMessage = new Message(message);
  return await newMessage.save();
}
