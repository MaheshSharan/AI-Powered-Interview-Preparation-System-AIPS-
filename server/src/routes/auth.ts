import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with basic info only
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        registrationStep: 1,
        educationStatus: null, // Add null values for optional fields
        university: null,
        graduationYear: null,
        major: null,
        workStatus: null,
        experience: null,
        targetRole: null,
        linkedinUrl: null,
        githubUrl: null
      },
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        registrationStep: user.registrationStep
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new endpoint for updating registration step
router.put('/registration-step', async (req, res) => {
  try {
    const { userId, step, formData } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        registrationStep: step,
        ...formData // Spread any additional form data
      }
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        registrationStep: updatedUser.registrationStep
      }
    });
  } catch (error) {
    console.error('Update registration step error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('User lookup result:', { 
      found: !!user,
      userId: user?.id
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', { isValid: isPasswordValid });
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('JWT token generated');

    // Send user data without sensitive information
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      educationStatus: user.educationStatus,
      registrationStep: user.registrationStep
    };

    console.log('Login successful:', { 
      userId: userData.id,
      hasToken: !!token
    });

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  console.log('Authenticating user from token');
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Bearer header

  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    console.log('Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    console.log('Token verified, fetching user:', { userId: decoded.id });
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    console.log('User lookup result:', { found: !!user });

    if (!user) {
      console.log('Authentication failed: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      educationStatus: user.educationStatus,
      registrationStep: user.registrationStep
    };

    console.log('Authentication successful:', { userId: userData.id });
    res.json({ user: userData });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;