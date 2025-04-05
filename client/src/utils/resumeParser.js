import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

// Environment variables for API configuration - move to .env file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Main parser function that handles different file types
export const parseResume = async (file) => {
  console.log('[Resume Parser] Starting resume parsing');
  
  try {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let text;
    
    switch (fileExtension) {
      case 'pdf':
        text = await parsePdf(file);
        break;
      case 'docx':
        text = await parseDocx(file);
        break;
      case 'txt':
        text = await parseTxt(file);
        break;
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }
    
    return { text, raw: text };
  } catch (error) {
    console.error('[Resume Parser] Error parsing resume:', error);
    throw error;
  }
};

// Parse PDF files
const parsePdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    
    const loadingTask = pdfjs.getDocument({ data: typedArray });
    const pdf = await loadingTask.promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items.map(item => item.str);
      text += textItems.join(' ') + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

// Parse DOCX files
const parseDocx = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const processedText = result.value
          .replace(/\n{3,}/g, '\n\n')
          .replace(/\s+/g, ' ')
          .trim();
        
        resolve(processedText);
      } catch (error) {
        console.error('[DOCX Parser] Error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('[DOCX Parser] Error reading file:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Parse TXT files
const parseTxt = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const processedText = text
          .replace(/\n{3,}/g, '\n\n')
          .replace(/\s+/g, ' ')
          .trim();
        
        resolve(processedText);
      } catch (error) {
        console.error('[TXT Parser] Error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('[TXT Parser] Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// Rate limiter for API calls
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 500;

async function rateLimiter() {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
}

// New function to validate API key before making requests
const validateApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key. Please add your API key to the .env file as VITE_GEMINI_API_KEY.');
  }
  
  // Basic validation - API keys often have a minimum length
  if (GEMINI_API_KEY.length < 10) {
    throw new Error('Invalid Gemini API key format. Please check your API key.');
  }
};

// Analyze resume with Gemini with improved error handling
export const analyzeResumeWithGemini = async (parsedResume, company, role, experienceLevel) => {
  try {
    // Validate API key first
    validateApiKey();
    
    await rateLimiter();

    const prompt = {
      contents: [{
        parts: [{
          text: `You are an expert HR professional and technical recruiter. Analyze this resume for ${company} ${role} position (${experienceLevel} level).
          
Resume Text:
${parsedResume.text}

IMPORTANT: Return ONLY the JSON object without any markdown formatting or code blocks.

{
  "personal_info": {
    "name": "candidate name",
    "contact": {
      "email": "email if found",
      "phone": "phone if found",
      "location": "location if found"
    }
  },
  "education": [
    {
      "degree": "degree name",
      "institution": "institution name",
      "year": "year",
      "gpa": "if available",
      "highlights": ["relevant coursework", "achievements"]
    }
  ],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "duration",
      "responsibilities": ["key responsibility 1", "key responsibility 2"],
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "missing_critical": ["missing skill 1", "missing skill 2"]
  },
  "scores": {
    "technical_match": {
      "score": 85,
      "reasoning": "explanation"
    },
    "experience_match": {
      "score": 80,
      "reasoning": "explanation"
    },
    "education_match": {
      "score": 90,
      "reasoning": "explanation"
    },
    "overall_score": {
      "score": 85,
      "summary": "overall assessment"
    }
  },
  "improvements": {
    "critical": [
      {
        "area": "area to improve",
        "suggestion": "what to do",
        "impact": "expected impact"
      }
    ],
    "recommended": [
      {
        "area": "area to enhance",
        "suggestion": "what to do",
        "benefit": "potential benefit"
      }
    ]
  }
}`
        }]
      }]
    };

    try {
      let response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
      });

      // Handle rate limiting
      if (response.status === 429) {
        console.log('Rate limited, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prompt)
        });
      }

      // More detailed error handling
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        
        if (response.status === 401) {
          throw new Error(`API key authentication failed. Please check your API key and permissions. Status: ${response.status}, Details: ${errorText}`);
        } else if (response.status === 403) {
          throw new Error(`API access forbidden. Your API key may not have the required permissions. Status: ${response.status}, Details: ${errorText}`);
        } else {
          throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('[Gemini Test] Raw response:', data.candidates[0].content.parts[0].text);
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      // Clean the response text by removing markdown code blocks
      let responseText = data.candidates[0].content.parts[0].text;
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let analysis;
      try {
        analysis = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Resume Analysis] Error parsing JSON response:', parseError);
        console.error('[Resume Analysis] Response text:', responseText);
        throw new Error(`Failed to parse Gemini API response: ${parseError.message}`);
      }

      // Validate required fields
      const requiredFields = ['personal_info', 'education', 'experience', 'skills', 'scores'];
      for (const field of requiredFields) {
        if (!analysis[field]) {
          throw new Error(`Missing required field in analysis: ${field}`);
        }
      }

      analysis.metadata = {
        company,
        role,
        experience_level: experienceLevel,
        analyzed_at: new Date().toISOString()
      };

      return analysis;
    } catch (fetchError) {
      // Check for network errors
      if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        throw new Error('Network error connecting to Gemini API. Please check your internet connection.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[Resume Analysis] Gemini API error:', error);
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
};

// Added fallback analysis functionality when API fails
export const performLocalAnalysis = async (parsedResume, company, role, experienceLevel) => {
  // Simple keyword extraction and matching as fallback
  const text = parsedResume.text.toLowerCase();
  
  // Basic extraction of contact info using regex patterns
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  // Simplified skills extraction - detect common tech keywords
  const techSkills = [
    'javascript', 'react', 'node', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'html', 'css', 'sql', 'nosql',
    'mongodb', 'postgresql', 'mysql', 'typescript', 'git', 'linux', 'agile', 'scrum'
  ];
  
  const detectedSkills = techSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  
  return {
    metadata: {
      company,
      role,
      experience_level: experienceLevel,
      analyzed_at: new Date().toISOString(),
      analysis_method: 'local_fallback'
    },
    personal_info: {
      contact: {
        email: emails.length > 0 ? emails[0] : 'Not detected',
        phone: phones.length > 0 ? phones[0] : 'Not detected',
      }
    },
    skills: {
      technical: detectedSkills,
      missing_critical: [],
      recommended: []
    },
    note: "This is a simplified analysis performed locally. For detailed analysis, please ensure your API key is valid and properly configured."
  };
};

// Main analysis function with fallback
export const analyzeResumeForCompany = async (parsedResume, company, role) => {
  try {
    const experienceLevel = 'mid-level'; // TODO: Get from store
    
    try {
      // Try the main analysis with Gemini
      const analysis = await analyzeResumeWithGemini(parsedResume, company, role, experienceLevel);
      return analysis;
    } catch (apiError) {
      console.error('[Resume Analysis] API analysis failed, using fallback:', apiError);
      // If API fails, fall back to local analysis
      return await performLocalAnalysis(parsedResume, company, role, experienceLevel);
    }
  } catch (error) {
    console.error('[Resume Analysis] Analysis failed:', error);
    throw error;
  }
};

// Improved error handler with more specific messages
export const handleParsingError = (error) => {
  console.error('Resume parsing error:', error);
  
  if (error.message.includes('Unsupported file type')) {
    return 'The file format is not supported. Please upload a PDF, DOCX, or TXT file.';
  } else if (error.message.includes('corrupt') || error.message.includes('malformed')) {
    return 'The file appears to be corrupted or malformed. Please try uploading a different file.';
  } else if (error.message.includes('password')) {
    return 'The PDF file is password-protected. Please remove the password and try again.';
  } else if (error.message.includes('API key')) {
    return 'API key configuration error. Please contact the administrator to fix the API key.';
  } else if (error.message.includes('Network error')) {
    return 'Network connection error. Please check your internet connection and try again.';
  } else {
    return 'An error occurred while processing your resume. Please try again with a different file.';
  }
};

// Test Gemini API connection
export const testGeminiConnection = async () => {
  try {
    console.log('[Gemini Test] Testing API connection...');
    console.log('[Gemini Test] API Key:', GEMINI_API_KEY ? 'Present' : 'Missing');
    
    const prompt = {
      contents: [{
        parts: [{
          text: "Hi, are you available? Please respond with a simple 'yes'."
        }]
      }]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prompt)
    });

    console.log('[Gemini Test] Response status:', response.status);
    const data = await response.json();
    console.log('[Gemini Test] Response data:', data);

    return { success: response.ok, data };
  } catch (error) {
    console.error('[Gemini Test] Error:', error);
    return { success: false, error: error.message };
  }
};