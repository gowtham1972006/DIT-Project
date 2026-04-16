'use server';

import { connectDB, User } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, generateAnonymousId, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Unified registration handler for both students and peer supporters
export async function registerUser(prevState, formData) {
  const role = formData.get('role') || 'student';
  const username = formData.get('username');
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  await connectDB();

  // --- Student registration ---
  if (role === 'student') {
    const rollNo = formData.get('rollNo');
    if (!rollNo) return { error: 'Roll number is required for students.' };

    const existing = await User.findOne({ $or: [{ username }, { rollNo }] });
    if (existing) {
      if (existing.username === username) return { error: 'Username already taken.' };
      if (existing.rollNo === rollNo) return { error: 'Roll number already registered.' };
    }

    const hashedPassword = await hashPassword(password);
    const anonId = generateAnonymousId();

    try {
      const newUser = await User.create({
        username,
        rollNo,
        password_hash: hashedPassword,
        role: 'student',
        status: 'approved', // students are auto-approved
        anonymous_id: anonId,
      });

      await createSession({
        id: newUser._id.toString(),
        username,
        role: 'student',
        status: 'approved',
        anonymous_id: anonId,
      });
    } catch (err) {
      return { error: 'Registration failed: ' + err.message };
    }

    redirect('/dashboard');
  }

  // --- Peer Supporter registration ---
  if (role === 'peer') {
    const roll_number = formData.get('roll_number');
    const experience_level = formData.get('experience_level');

    if (!roll_number) return { error: 'Roll number is required for peer supporters.' };
    if (!experience_level) return { error: 'Please select your experience level.' };
    if (!['basic', 'moderate', 'trained'].includes(experience_level)) {
      return { error: 'Invalid experience level selected.' };
    }

    const existing = await User.findOne({ $or: [{ username }, { roll_number }] });
    if (existing) {
      if (existing.username === username) return { error: 'Username already taken.' };
      if (existing.roll_number === roll_number) return { error: 'A peer supporter with this roll number already exists.' };
    }

    const hashedPassword = await hashPassword(password);

    try {
      await User.create({
        username,
        roll_number,       // admin-only field
        experience_level,
        password_hash: hashedPassword,
        role: 'peer',
        status: 'pending', // awaits admin approval
      });
    } catch (err) {
      return { error: 'Registration failed: ' + err.message };
    }

    // No session created — peer must wait for approval
    redirect('/register/pending');
  }

  return { error: 'Invalid role selected.' };
}

// Keep the old name as an alias so existing imports don't break
export const registerStudent = registerUser;

export async function loginUser(prevState, formData) {
  const identifier = formData.get('username');
  const password = formData.get('password');

  if (!identifier || !password) {
    return { error: 'Username/Roll number and password are required.' };
  }

  await connectDB();

  const user = await User.findOne({
    $or: [{ username: identifier }, { rollNo: identifier }],
  });

  if (!user) return { error: 'Invalid credentials.' };

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return { error: 'Invalid credentials.' };

  // Block peer supporters who are not yet approved
  if (user.role === 'peer' && user.status !== 'approved') {
    if (user.status === 'pending') {
      return {
        error: 'Your peer supporter account is pending admin approval.',
        pendingRedirect: true,
      };
    }
    if (user.status === 'rejected') {
      return {
        error: 'Your peer supporter application has been rejected. Please contact the administrator.',
      };
    }
  }

  await createSession({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    status: user.status,
    anonymous_id: user.anonymous_id,
  });

  if (user.role === 'admin' || user.role === 'counselor') redirect('/admin');
  if (user.role === 'peer' && user.status === 'approved') redirect('/peer');
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
