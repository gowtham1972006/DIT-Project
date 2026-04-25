import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    'Missing MONGODB_URI environment variable. Set it in .env.local (dev) or in the Vercel dashboard (prod).'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully via cache');
      setupAdmin();
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  rollNo: { type: String, unique: true, sparse: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, default: 'student', enum: ['student', 'peer', 'admin', 'counselor'] },
  // Peer-supporter-only fields (hidden from students/peers, admin-only visibility)
  roll_number: { type: String, unique: true, sparse: true },
  experience_level: { type: String, enum: ['basic', 'moderate', 'trained'], default: null },
  // Peer approval workflow: pending → approved | rejected
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  anonymous_id: { type: String, unique: true, sparse: true },
  created_at: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  intensity: { type: String, default: 'low', enum: ['low', 'medium', 'high'] },
  created_at: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  session_id: { type: String, ref: 'ChatSession', required: true },
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const alertSchema = new mongoose.Schema({
  session_id: { type: String, ref: 'ChatSession', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anonymous_id: { type: String, required: true },
  intensity_level: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'resolved'] },
  timestamp: { type: Date, default: Date.now }
});

// Peer-to-peer real-time chat schemas
const peerSessionSchema = new mongoose.Schema({
  session_id:      { type: String, required: true, unique: true },
  student_id:      { type: String, required: true },
  student_anon_id: { type: String, default: 'Anonymous' },
  peer_id:         { type: String, default: null },
  topic:           { type: String, default: 'General Support' },
  status:          { type: String, enum: ['waiting', 'active', 'closed'], default: 'waiting' },
  created_at:      { type: Date, default: Date.now },
});

const peerMessageSchema = new mongoose.Schema({
  session_id:   { type: String, required: true, index: true },
  sender_role:  { type: String, enum: ['student', 'peer'], required: true },
  sender_label: { type: String, required: true },
  content:      { type: String, required: true },
  timestamp:    { type: Date, default: Date.now },
});

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.User;
  delete mongoose.models.ChatSession;
  delete mongoose.models.Message;
  delete mongoose.models.Alert;
  delete mongoose.models.PeerSession;
  delete mongoose.models.PeerMessage;
}

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export const PeerSession = mongoose.models.PeerSession || mongoose.model('PeerSession', peerSessionSchema);
export const PeerMessage = mongoose.models.PeerMessage || mongoose.model('PeerMessage', peerMessageSchema);

async function setupAdmin() {
  try {
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({
        username: 'admin',
        password_hash: '$2b$10$j/EBkTuOHWG2hz8x1K/gptZQSbKsUymTBOySL3ujt2rceIe1l1vTy',
        role: 'admin'
      });
    }
  } catch (e) {
    console.error("Setup admin error", e);
  }
}
