import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
const MONGODB_URL = "mongodb+srv://ashminaik14_db_user:jBbNuOwuJzIzmxnJ@clusterfivrr.oluyya3.mongodb.net/fiverr-db?retryWrites=true&w=majority";

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['client', 'freelancer'] },
  avatar: { type: String, default: null },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  location: { type: String, default: '' },
  totalEarnings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
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
  images: [{ type: String }],
  deliveryTime: { type: String, required: true },
  tags: [{ type: String }],
  rating: { type: Number, required: true, default: 0 },
  reviewCount: { type: Number, required: true, default: 0 },
  totalOrders: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'paused', 'deleted'], default: 'active' },
  createdAt: { type: String, required: true }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  gigId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'] 
  },
  price: { type: Number, required: true },
  requirements: { type: String, default: '' },
  deliveryDate: { type: String },
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Gig = mongoose.models.Gig || mongoose.model('Gig', GigSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

// Indian Data
const indianFreelancers = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    bio: "Expert web developer with 5+ years of experience in React, Node.js and MongoDB",
    skills: ["React", "Node.js", "MongoDB", "JavaScript", "CSS"],
    location: "Bangalore, Karnataka"
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    bio: "Professional graphic designer specializing in logos and brand identity",
    skills: ["Photoshop", "Illustrator", "Logo Design", "Brand Identity"],
    location: "Mumbai, Maharashtra"
  },
  {
    name: "Amit Patel",
    email: "amit.patel@email.com",
    bio: "Full-stack developer and mobile app expert",
    skills: ["React Native", "Flutter", "Firebase", "Python"],
    location: "Ahmedabad, Gujarat"
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    bio: "Content writer and SEO specialist",
    skills: ["Content Writing", "SEO", "Blog Writing", "Copywriting"],
    location: "Hyderabad, Telangana"
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    bio: "Video editor and motion graphics artist",
    skills: ["Video Editing", "After Effects", "Premiere Pro", "Motion Graphics"],
    location: "Delhi, NCR"
  }
];

const indianClients = [
  {
    name: "Anjali Nair",
    email: "anjali.nair@email.com",
    bio: "Looking for talented freelancers for my startup",
    location: "Chennai, Tamil Nadu"
  },
  {
    name: "Rohit Verma",
    email: "rohit.verma@email.com",
    bio: "Need help with web development projects",
    location: "Pune, Maharashtra"
  }
];

const indianGigs = [
  {
    title: "Complete E-commerce Website Development",
    description: "I will build a professional e-commerce website with payment gateway integration, admin panel, and mobile responsive design. Technologies used: React, Node.js, MongoDB, Stripe",
    price: 25000,
    category: "Programming & Tech",
    deliveryTime: "7 days",
    tags: ["React", "Node.js", "E-commerce", "MongoDB"],
    featured: true
  },
  {
    title: "Professional Logo Design with Brand Guidelines",
    description: "Get a stunning logo design with complete brand guidelines including color palette, typography, and usage examples. 3 initial concepts + unlimited revisions",
    price: 3500,
    category: "Graphics & Design",
    deliveryTime: "3 days",
    tags: ["Logo Design", "Brand Identity", "Illustrator", "Photoshop"],
    featured: true
  },
  {
    title: "Mobile App Development (iOS & Android)",
    description: "Native mobile app development for both iOS and Android platforms. Includes UI/UX design, backend integration, and app store deployment",
    price: 45000,
    category: "Programming & Tech",
    deliveryTime: "14 days",
    tags: ["React Native", "Flutter", "Mobile App", "iOS", "Android"]
  },
  {
    title: "SEO-Optimized Blog Content (10 Articles)",
    description: "10 high-quality, SEO-optimized blog articles (1000 words each) with keyword research, meta descriptions, and royalty-free images",
    price: 8000,
    category: "Writing & Translation",
    deliveryTime: "5 days",
    tags: ["Content Writing", "SEO", "Blog Writing", "Copywriting"]
  },
  {
    title: "Professional Video Editing for YouTube",
    description: "Professional video editing services for YouTube videos including color grading, motion graphics, subtitles, and thumbnail design",
    price: 1500,
    category: "Video & Animation",
    deliveryTime: "2 days",
    tags: ["Video Editing", "YouTube", "After Effects", "Premiere Pro"]
  },
  {
    title: "Social Media Marketing Package",
    description: "Complete social media management for 1 month including content creation, posting, engagement, and monthly analytics report",
    price: 12000,
    category: "Digital Marketing",
    deliveryTime: "30 days",
    tags: ["Social Media", "Marketing", "Content Creation", "Analytics"]
  },
  {
    title: "Data Analysis & Visualization Dashboard",
    description: "Create interactive data dashboards using Python, Power BI, or Tableau. Includes data cleaning, analysis, and beautiful visualizations",
    price: 18000,
    category: "Data & Analytics",
    deliveryTime: "5 days",
    tags: ["Data Analysis", "Python", "Power BI", "Visualization"]
  },
  {
    title: "Business Plan & Financial Projections",
    description: "Comprehensive business plan with market research, financial projections, and investor pitch deck for startups",
    price: 10000,
    category: "Business & Finance",
    deliveryTime: "4 days",
    tags: ["Business Plan", "Financial Analysis", "Market Research", "Startup"]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Order.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});

    console.log('Cleared existing data');

    // Create freelancers
    const freelancerUsers = [];
    for (const freelancer of indianFreelancers) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        id: uuidv4(),
        ...freelancer,
        password: hashedPassword,
        role: 'freelancer',
        createdAt: new Date().toISOString()
      });
      await user.save();
      freelancerUsers.push(user);
    }

    // Create clients
    const clientUsers = [];
    for (const client of indianClients) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        id: uuidv4(),
        ...client,
        password: hashedPassword,
        role: 'client',
        skills: [],
        createdAt: new Date().toISOString()
      });
      await user.save();
      clientUsers.push(user);
    }

    // Create gigs
    const gigs = [];
    for (let i = 0; i < indianGigs.length; i++) {
      const gigData = indianGigs[i];
      const freelancer = freelancerUsers[i % freelancerUsers.length];
      
      const gig = new Gig({
        id: uuidv4(),
        sellerId: freelancer.id,
        ...gigData,
        images: [
          `https://picsum.photos/seed/gig${i}/400/300.jpg`,
          `https://picsum.photos/seed/gig${i}b/400/300.jpg`
        ],
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      await gig.save();
      gigs.push(gig);
    }

    // Create some orders
    const orders = [];
    for (let i = 0; i < 10; i++) {
      const gig = gigs[Math.floor(Math.random() * gigs.length)];
      const buyer = clientUsers[Math.floor(Math.random() * clientUsers.length)];
      const seller = freelancerUsers.find(f => f.id === gig.sellerId);
      
      const statuses = ['pending', 'in_progress', 'delivered', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const order = new Order({
        id: uuidv4(),
        gigId: gig.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        status,
        price: gig.price,
        requirements: "Please deliver high-quality work as described in the gig. Looking forward to working with you!",
        deliveryDate: new Date(Date.now() + (parseInt(gig.deliveryTime) * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      });
      await order.save();
      orders.push(order);
    }

    console.log(`✅ Created ${freelancerUsers.length} freelancers`);
    console.log(`✅ Created ${clientUsers.length} clients`);
    console.log(`✅ Created ${gigs.length} gigs`);
    console.log(`✅ Created ${orders.length} orders`);
    console.log('🎉 Database seeded successfully!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();