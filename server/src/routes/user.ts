import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const auth = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.') as any);
    }
  },
});

// Get user profile
router.get('/profile', auth, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        progressStatus: true,
        resume: {
          select: {
            id: true,
            fileName: true,
            uploadedAt: true,
            score: true,
            feedback: true,
            skills: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req: any, res: any) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resume
router.post('/resume', auth, upload.single('resume'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user already has a resume
    const existingResume = await prisma.resume.findUnique({
      where: { userId: req.user.id },
    });

    let resume;
    if (existingResume) {
      // Update existing resume
      resume = await prisma.resume.update({
        where: { id: existingResume.id },
        data: {
          filePath: req.file.path,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          // Reset analysis data
          analyzedAt: null,
          score: null,
          feedback: null,
          skills: {
            deleteMany: {},
          },
        },
      });
    } else {
      // Create new resume
      resume = await prisma.resume.create({
        data: {
          userId: req.user.id,
          filePath: req.file.path,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
        },
      });

      // Update progress status
      await prisma.progressStatus.update({
        where: { userId: req.user.id },
        data: { resumeUploaded: true },
      });
    }

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress
router.get('/progress', auth, async (req: any, res: any) => {
  try {
    const progress = await prisma.progressStatus.findUnique({
      where: { userId: req.user.id },
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user progress
router.put('/progress', auth, async (req: any, res: any) => {
  try {
    const { resumeAnalyzed, jobSelected, technicalAssessmentCompleted, interviewCompleted } = req.body;

    const updatedProgress = await prisma.progressStatus.update({
      where: { userId: req.user.id },
      data: {
        resumeAnalyzed: resumeAnalyzed !== undefined ? resumeAnalyzed : undefined,
        jobSelected: jobSelected !== undefined ? jobSelected : undefined,
        technicalAssessmentCompleted: technicalAssessmentCompleted !== undefined ? technicalAssessmentCompleted : undefined,
        interviewCompleted: interviewCompleted !== undefined ? interviewCompleted : undefined,
        lastActivity: new Date(),
      },
    });

    res.json({
      message: 'Progress updated successfully',
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;