import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';

// Define a custom interface for Request with user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const router = express.Router();

// Authentication middleware function
const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.') as any);
    }
  }
});

// Get all resumes for a user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const resumes = await (prisma as any).resume.findMany({
      where: { userId },
      include: {
        versions: {
          select: {
            id: true,
            notes: true,
            createdAt: true
          }
        },
        analysis: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Upload a new resume
router.post('/upload', authenticateUser, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const file = req.file;
    const { companyId, roleId } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileData = fs.readFileSync(file.path);
    
    const resume = await (prisma as any).resume.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        companyId: companyId || null,
        roleId: roleId || null,
        versions: {
          create: {
            fileData,
            notes: 'Initial version'
          }
        }
      },
      include: {
        versions: true
      }
    });
    
    fs.unlinkSync(file.path);
    
    res.status(201).json(resume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Add a new version to an existing resume
router.post('/:resumeId/version', authenticateUser, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { resumeId } = req.params;
    const { notes } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const resume = await (prisma as any).resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const fileData = fs.readFileSync(file.path);
    
    const version = await (prisma as any).resumeVersion.create({
      data: {
        resumeId,
        fileData,
        notes: notes || null
      }
    });
    
    await (prisma as any).resume.update({
      where: { id: resumeId },
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size
      }
    });
    
    fs.unlinkSync(file.path);
    
    res.status(201).json(version);
  } catch (error) {
    console.error('Error adding resume version:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to add resume version' });
  }
});

// Get a specific resume version
router.get('/:resumeId/version/:versionId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { resumeId, versionId } = req.params;
    
    const resume = await (prisma as any).resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const version = await (prisma as any).resumeVersion.findFirst({
      where: {
        id: versionId,
        resumeId
      }
    });
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.setHeader('Content-Type', resume.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
    
    res.send(version.fileData);
  } catch (error) {
    console.error('Error fetching resume version:', error);
    res.status(500).json({ error: 'Failed to fetch resume version' });
  }
});

// Save analysis results
router.post('/:resumeId/analysis', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { resumeId } = req.params;
    const { score, strengths, weaknesses, skillsMatched, skillsMissing, suggestions } = req.body;
    
    const resume = await (prisma as any).resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const existingAnalysis = await (prisma as any).resumeAnalysis.findUnique({
      where: { resumeId }
    });
    
    let analysis;
    
    if (existingAnalysis) {
      analysis = await (prisma as any).resumeAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          score,
          strengths: JSON.stringify(strengths),
          weaknesses: JSON.stringify(weaknesses),
          skillsMatched: JSON.stringify(skillsMatched),
          skillsMissing: JSON.stringify(skillsMissing),
          suggestions: JSON.stringify(suggestions)
        }
      });
    } else {
      analysis = await (prisma as any).resumeAnalysis.create({
        data: {
          resumeId,
          score,
          strengths: JSON.stringify(strengths),
          weaknesses: JSON.stringify(weaknesses),
          skillsMatched: JSON.stringify(skillsMatched),
          skillsMissing: JSON.stringify(skillsMissing),
          suggestions: JSON.stringify(suggestions)
        }
      });
    }
    
    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error saving analysis results:', error);
    res.status(500).json({ error: 'Failed to save analysis results' });
  }
});

// Delete a resume
router.delete('/:resumeId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { resumeId } = req.params;
    
    const resume = await (prisma as any).resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    await (prisma as any).resumeVersion.deleteMany({
      where: { resumeId }
    });
    
    await (prisma as any).resumeAnalysis.deleteMany({
      where: { resumeId }
    });
    
    await (prisma as any).resume.delete({
      where: { id: resumeId }
    });
    
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;
