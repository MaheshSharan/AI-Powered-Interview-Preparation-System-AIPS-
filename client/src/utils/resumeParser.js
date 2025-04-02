import * as pdfjs from 'pdfjs-dist';
import { Document } from 'docx';
import mammoth from 'mammoth';

// Initialize PDF.js worker
// Use a more reliable approach for the worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  // Use the correct URL format with .mjs extension
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

// Main parser function that handles different file types
export const parseResume = async (file) => {
  console.log('[Resume Parser] Starting resume parsing');
  
  try {
    // Get file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Parse based on file type
    let text;
    switch (fileExtension) {
      case 'pdf':
        text = await parsePdf(file);
        break;
      case 'docx':
        text = await parseDocx(file);
        break;
      case 'rtf':
        text = await parseRtf(file);
        break;
      case 'txt':
        text = await parseTxt(file);
        break;
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }
    
    // Process the extracted text
    const result = processExtractedText(text);
    
    console.log('[Resume Parser] Successfully parsed resume');
    return result;
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
    
    console.log(`[PDF Parser] Successfully loaded PDF with ${pdf.numPages} pages`);
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items.map(item => item.str);
      text += textItems.join(' ') + '\n';
    }
    
    console.log('[PDF Parser] Extracted text:', text);
    return text; // Return the text instead of processing it
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

// Parse DOCX files
const parseDocx = async (file) => {
  console.log('[DOCX Parser] Starting DOCX parsing');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Configure Mammoth options for better text extraction
        const options = {
          transformDocument: (document) => {
            return document;
          },
          styleMap: [
            "p[style-name='Section Title'] => h1:fresh",
            "p[style-name='Subsection Title'] => h2:fresh",
            "r[style-name='Strong'] => strong",
            "p[style-name='List Paragraph'] => li:fresh",
            "p[style-name='Table Header'] => th:fresh",
            "p[style-name='Table Cell'] => td:fresh"
          ],
          includeDefaultStyleMap: true,
          convertImage: mammoth.images.imgElement((image) => {
            return image.read().then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer.toString('base64')}`
              };
            });
          })
        };

        const result = await mammoth.extractRawText({ arrayBuffer }, options);
        
        // Process the extracted text
        let processedText = result.value;
        
        // Clean up the text
        processedText = processedText
          .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        console.log('[DOCX Parser] Successfully extracted text from DOCX');
        resolve(processedText);
  } catch (error) {
        console.error('[DOCX Parser] Error parsing DOCX:', error);
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

// Parse RTF files
const parseRtf = async (file) => {
  console.log('[RTF Parser] Starting RTF parsing');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        
        // Basic RTF parsing
        let processedText = text
          .replace(/\\[a-z]{1,32}(-?\d{1,10})?[ ]?/g, '') // Remove RTF control words
          .replace(/\\'[0-9a-f]{2}/g, '') // Remove hex escapes
          .replace(/\\[{}]/g, '') // Remove RTF braces
          .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        console.log('[RTF Parser] Successfully extracted text from RTF');
        resolve(processedText);
      } catch (error) {
        console.error('[RTF Parser] Error parsing RTF:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('[RTF Parser] Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

// Parse TXT files
const parseTxt = async (file) => {
  console.log('[TXT Parser] Starting TXT parsing');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        
        // Process plain text
        let processedText = text
          .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        console.log('[TXT Parser] Successfully extracted text from TXT');
        resolve(processedText);
      } catch (error) {
        console.error('[TXT Parser] Error parsing TXT:', error);
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

// Process extracted text and identify sections
const processExtractedText = (text) => {
  console.log('[Text Processing] Starting text processing');
  
  // Initialize result object with sections
  const result = {
    sections: {
      header: [],
      summary: [],
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      other: []
    },
    extractedInfo: {
      contact: {},
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: []
    },
    formatAnalysis: {
      issues: [],
      suggestions: []
    }
  };

  // Common section headers in different formats
  const sectionHeaders = {
    education: [
      'education', 'academic', 'qualification', 'degree', 'university',
      'college', 'school', 'academic background', 'academic qualifications',
      'educational background', 'educational qualifications'
    ],
    experience: [
      'experience', 'work experience', 'employment', 'work history',
      'professional experience', 'career history', 'employment history',
      'work background', 'professional background'
    ],
    skills: [
      'skills', 'technical skills', 'core competencies', 'expertise',
      'technical expertise', 'technical competencies', 'key skills',
      'professional skills', 'technical abilities'
    ],
    projects: [
      'projects', 'project experience', 'personal projects', 'academic projects',
      'project work', 'project portfolio', 'project highlights'
    ],
    certifications: [
      'certifications', 'certificates', 'qualifications', 'professional certifications',
      'technical certifications', 'academic certifications', 'additional qualifications'
    ],
    summary: [
      'summary', 'objective', 'career objective', 'professional summary',
      'executive summary', 'profile', 'career profile', 'about'
    ]
  };

  // Split into lines and process each line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = 'other';
  let sectionContent = [];
  
  // Process each line
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check for section headers
    let isHeader = false;
    for (const [section, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(header => lowerLine.includes(header))) {
        // Save previous section content
        if (sectionContent.length > 0) {
          result.sections[currentSection] = [...sectionContent];
        }
        
        // Start new section
        currentSection = section;
        sectionContent = [];
        isHeader = true;
        break;
      }
    }
    
    // Add content to current section if not a header
    if (!isHeader) {
      sectionContent.push(line);
    }
  }
  
  // Save last section content
  if (sectionContent.length > 0) {
    result.sections[currentSection] = [...sectionContent];
  }
  
  // Extract information from each section
  extractContactInfo(text, result.extractedInfo);
  extractEducationInfo(Array.isArray(result.sections.education) ? result.sections.education.join('\n') : result.sections.education, result.extractedInfo);
  extractExperienceInfo(Array.isArray(result.sections.experience) ? result.sections.experience.join('\n') : result.sections.experience, result.extractedInfo);
  extractSkills(Array.isArray(result.sections.skills) ? result.sections.skills.join('\n') : result.sections.skills, result.extractedInfo);
  
  // Analyze format
  analyzeFormat(result);
  
  console.log('[Text Processing] Completed text processing');
  return result;
};

// Analyze resume format and content
const analyzeFormat = (result) => {
  const issues = [];
  const suggestions = [];
  
  // Check for missing sections
  const requiredSections = ['education', 'experience', 'skills'];
  for (const section of requiredSections) {
    if (!result.sections[section] || result.sections[section].length === 0) {
      issues.push(`Missing ${section} section`);
      suggestions.push(`Add a ${section} section to your resume`);
    }
  }
  
  // Check section order
  const sectionOrder = ['summary', 'education', 'experience', 'skills', 'projects', 'certifications'];
  const currentOrder = Object.keys(result.sections).filter(section => 
    result.sections[section] && result.sections[section].length > 0
  );
  
  for (let i = 0; i < currentOrder.length; i++) {
    if (currentOrder[i] !== sectionOrder[i]) {
      issues.push(`Section order could be improved`);
      suggestions.push(`Consider reordering sections to follow standard resume format`);
    }
  }
  
  // Check content quality
  for (const [section, content] of Object.entries(result.sections)) {
    if (content && content.length > 0) {
      // Check for bullet points
      const hasBullets = content.some(line => 
        line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
      );
      
      if (!hasBullets && section !== 'summary') {
        issues.push(`${section} section could use bullet points`);
        suggestions.push(`Use bullet points in ${section} section for better readability`);
      }
      
      // Check for action verbs
      const actionVerbs = ['developed', 'created', 'implemented', 'managed', 'led', 'designed'];
      const hasActionVerbs = content.some(line => 
        actionVerbs.some(verb => line.toLowerCase().includes(verb))
      );
      
      if (!hasActionVerbs && section === 'experience') {
        issues.push('Experience section could use more action verbs');
        suggestions.push('Start bullet points with action verbs to highlight achievements');
      }
    }
  }
  
  // Add analysis results to the result object
  result.formatAnalysis.issues = issues;
  result.formatAnalysis.suggestions = suggestions;
};

// Extract contact information from text
const extractContactInfo = (text, extractedInfo) => {
  // Email regex pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Phone regex pattern (various formats)
  const phonePattern = /(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g;
  
  // Location regex pattern (basic)
  const locationPattern = /([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)/g;
  
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // Name detection (assuming first line of header is name)
  const lines = text.split('\n');
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 0 && !firstLine.toLowerCase().includes('resume')) {
      extractedInfo.name = firstLine;
    }
  }
  
  // Extract email
  const emails = text.match(emailPattern);
  if (emails) {
    extractedInfo.email = emails[0];
  }
  
  // Extract phone
  const phones = text.match(phonePattern);
  if (phones) {
    extractedInfo.phone = phones[0];
  }
  
  // Extract location
  const locations = text.match(locationPattern);
  if (locations) {
    // Filter out common false positives
    const validLocations = locations.filter(loc => 
      !['Resume', 'Email', 'Phone', 'Address'].includes(loc)
    );
    if (validLocations.length > 0) {
      extractedInfo.location = validLocations[0];
    }
  }
  
  // Extract URLs (LinkedIn, GitHub, etc.)
  const urls = text.match(urlPattern);
  if (urls) {
    extractedInfo.links = urls.filter(url => 
      url.includes('linkedin.com') || 
      url.includes('github.com') || 
      url.includes('portfolio')
    );
  }
  
  // Clean up extracted information
  if (extractedInfo.name) {
    extractedInfo.name = extractedInfo.name.replace(/[^\w\s-]/g, '').trim();
  }
  if (extractedInfo.email) {
    extractedInfo.email = extractedInfo.email.toLowerCase();
  }
  if (extractedInfo.phone) {
    extractedInfo.phone = extractedInfo.phone.replace(/[^\d+]/g, '');
  }
  if (extractedInfo.location) {
    extractedInfo.location = extractedInfo.location.trim();
  }
};

// Extract education information from text
const extractEducationInfo = (text, extractedInfo) => {
  if (!text) return;
  
  // Common degree types
  const degreeTypes = [
    'bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma',
    'bsc', 'msc', 'mba', 'btech', 'mtech', 'bca', 'mca'
  ];
  
  // Common education institutions
  const institutions = [
    'university', 'college', 'institute', 'school', 'academy',
    'polytechnic', 'technical', 'engineering', 'business'
  ];
  
  // Split into lines and process each line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Skip lines that are too short or don't contain relevant information
    if (line.length < 10 || 
        lowerLine.includes('gpa') || 
        lowerLine.includes('grade') || 
        lowerLine.includes('percentage')) {
      continue;
    }
    
    // Check if line contains degree information
    const hasDegree = degreeTypes.some(degree => lowerLine.includes(degree));
    const hasInstitution = institutions.some(inst => lowerLine.includes(inst));
    
    if (hasDegree || hasInstitution) {
      // Extract degree
      const degreeMatch = line.match(new RegExp(degreeTypes.join('|'), 'i'));
      if (degreeMatch) {
        const degree = degreeMatch[0];
        // Clean up degree text
        const cleanDegree = degree
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        // Add to degrees if not already present
        if (!extractedInfo.degrees.includes(cleanDegree)) {
          extractedInfo.degrees.push(cleanDegree);
        }
      }
      
      // Extract institution
      const institutionMatch = line.match(new RegExp(institutions.join('|'), 'i'));
      if (institutionMatch) {
        // Get the full institution name (usually before the degree)
        const parts = line.split(/\s+/);
        const institutionIndex = parts.findIndex(part => 
          institutions.some(inst => part.toLowerCase().includes(inst))
        );
        
        if (institutionIndex !== -1) {
          // Get the institution name (usually 2-4 words before the degree)
          const startIndex = Math.max(0, institutionIndex - 3);
          const institutionName = parts.slice(startIndex, institutionIndex + 1).join(' ');
          
          // Clean up institution name
          const cleanInstitution = institutionName
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          // Add to result if not already present
          if (!extractedInfo.institutions) {
            extractedInfo.institutions = [];
          }
          if (!extractedInfo.institutions.includes(cleanInstitution)) {
            extractedInfo.institutions.push(cleanInstitution);
          }
        }
      }
    }
  }
  
  // Clean up extracted information
  if (extractedInfo.degrees) {
    extractedInfo.degrees = [...new Set(extractedInfo.degrees)];
  }
  if (extractedInfo.institutions) {
    extractedInfo.institutions = [...new Set(extractedInfo.institutions)];
  }
};

// Extract experience information from text
const extractExperienceInfo = (text, extractedInfo) => {
  if (!text) return;
  
  // Common job titles
  const jobTitles = [
    'engineer', 'developer', 'programmer', 'designer', 'architect',
    'manager', 'director', 'lead', 'consultant', 'analyst',
    'specialist', 'coordinator', 'associate', 'assistant', 'intern'
  ];
  
  // Common industries
  const industries = [
    'software', 'technology', 'it', 'finance', 'banking',
    'healthcare', 'education', 'retail', 'manufacturing'
  ];
  
  // Split into lines and process each line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Skip lines that are too short or don't contain relevant information
    if (line.length < 10 || 
        lowerLine.includes('gpa') || 
        lowerLine.includes('grade') || 
        lowerLine.includes('percentage')) {
      continue;
    }
    
    // Check if line contains job title
    const hasJobTitle = jobTitles.some(title => lowerLine.includes(title));
    const hasIndustry = industries.some(industry => lowerLine.includes(industry));
    
    if (hasJobTitle || hasIndustry) {
      // Extract job title
      const titleMatch = line.match(new RegExp(jobTitles.join('|'), 'i'));
      if (titleMatch) {
        // Get the full job title (usually 2-4 words)
        const parts = line.split(/\s+/);
        const titleIndex = parts.findIndex(part => 
          jobTitles.some(title => part.toLowerCase().includes(title))
        );
        
        if (titleIndex !== -1) {
          // Get the job title (usually 2-4 words)
          const startIndex = Math.max(0, titleIndex - 2);
          const endIndex = Math.min(parts.length, titleIndex + 2);
          const jobTitle = parts.slice(startIndex, endIndex).join(' ');
          
          // Clean up job title
          const cleanTitle = jobTitle
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          // Add to job titles if not already present
          if (!extractedInfo.jobTitles.includes(cleanTitle)) {
            extractedInfo.jobTitles.push(cleanTitle);
          }
        }
      }
      
      // Extract company name
      const industryMatch = line.match(new RegExp(industries.join('|'), 'i'));
      if (industryMatch) {
        // Get the company name (usually before the job title)
        const parts = line.split(/\s+/);
        const industryIndex = parts.findIndex(part => 
          industries.some(industry => part.toLowerCase().includes(industry))
        );
        
        if (industryIndex !== -1) {
          // Get the company name (usually 2-4 words before the industry)
          const startIndex = Math.max(0, industryIndex - 3);
          const companyName = parts.slice(startIndex, industryIndex).join(' ');
          
          // Clean up company name
          const cleanCompany = companyName
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          // Add to companies if not already present
          if (!extractedInfo.companies.includes(cleanCompany)) {
            extractedInfo.companies.push(cleanCompany);
          }
        }
      }
    }
  }
  
  // Clean up extracted information
  if (extractedInfo.jobTitles) {
    extractedInfo.jobTitles = [...new Set(extractedInfo.jobTitles)];
  }
  if (extractedInfo.companies) {
    extractedInfo.companies = [...new Set(extractedInfo.companies)];
  }
};

// Extract skills from text
const extractSkills = (text, extractedInfo) => {
  if (!text) return;
  
  // Common programming languages
  const programmingLanguages = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'swift',
    'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'shell'
  ];
  
  // Common frameworks and libraries
  const frameworks = [
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'spring', 'laravel', 'rails', 'bootstrap', 'jquery', 'tensorflow',
    'pytorch', 'scikit-learn', 'pandas', 'numpy'
  ];
  
  // Common databases
  const databases = [
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle',
    'sql server', 'elasticsearch', 'cassandra', 'dynamodb'
  ];
  
  // Common tools and technologies
  const tools = [
    'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins',
    'jira', 'confluence', 'slack', 'figma', 'photoshop', 'illustrator'
  ];
  
  // Common methodologies
  const methodologies = [
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd',
    'tdd', 'bdd', 'lean', 'six sigma'
  ];
  
  // Combine all skill categories
  const allSkills = [
    ...programmingLanguages,
    ...frameworks,
    ...databases,
    ...tools,
    ...methodologies
  ];
  
  // Split into lines and process each line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Skip lines that are too short or don't contain relevant information
    if (line.length < 5) continue;
    
    // Check for skills in the line
    const foundSkills = allSkills.filter(skill => lowerLine.includes(skill));
    
    if (foundSkills.length > 0) {
      // Clean up and add each found skill
      foundSkills.forEach(skill => {
        const cleanSkill = skill
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        // Add to skills if not already present
        if (!extractedInfo.skills.includes(cleanSkill)) {
          extractedInfo.skills.push(cleanSkill);
        }
      });
    }
  }
  
  // Clean up extracted skills
  if (extractedInfo.skills) {
  extractedInfo.skills = [...new Set(extractedInfo.skills)];
  }
  
  // Categorize skills
  const categorizedSkills = {
    programmingLanguages: extractedInfo.skills.filter(skill => 
      programmingLanguages.includes(skill.toLowerCase())
    ),
    frameworks: extractedInfo.skills.filter(skill => 
      frameworks.includes(skill.toLowerCase())
    ),
    databases: extractedInfo.skills.filter(skill => 
      databases.includes(skill.toLowerCase())
    ),
    tools: extractedInfo.skills.filter(skill => 
      tools.includes(skill.toLowerCase())
    ),
    methodologies: extractedInfo.skills.filter(skill => 
      methodologies.includes(skill.toLowerCase())
    )
  };
  
  // Add categorized skills to the result
  extractedInfo.categorizedSkills = categorizedSkills;
};

// Analyze resume for a specific company and role
export const analyzeResumeForCompany = (parsedResume, company, role) => {
  console.log('[Resume Analysis] Starting analysis for company:', company, 'role:', role);
  console.log('[Resume Analysis] Parsed resume:', parsedResume);
  
  // TODO: Replace with TensorFlow.js model in future implementation
  // This is a mockup implementation that will be replaced with the ML model
  
  // Extract resume data
  const resumeSkills = parsedResume.skills || [];
  const resumeEducation = parsedResume.education || [];
  const resumeExperience = parsedResume.experience || [];
  const resumeProjects = parsedResume.projects || [];
  
  // Mockup analysis results - this will be generated by the TensorFlow.js model in the future
  const mockupResults = generateMockupAnalysisResults(company, role, resumeSkills);
  
  // Add company insights to help with interview preparation
  mockupResults.companyInsights = getCompanyInsights(company);
  
  console.log('[Resume Analysis] Analysis results:', mockupResults);
  return mockupResults;
};

// Helper function to generate mockup analysis results
// This will be replaced by the TensorFlow.js model output
const generateMockupAnalysisResults = (company, role, resumeSkills) => {
  // Generate a more realistic score based on the company and skills
  const score = Math.floor(Math.random() * 61) + 40; // Random score between 40-100
  
  // Sample matched and missing skills
  const matchedSkills = resumeSkills.slice(0, Math.min(resumeSkills.length, 5));
  
  // Company-specific missing skills
  const missingSkillsByCompany = {
    'Microsoft': ['TypeScript', 'Azure', '.NET', 'System Design'],
    'Google': ['Go', 'Kubernetes', 'Cloud Computing', 'System Design'],
    'Amazon': ['AWS', 'Microservices', 'NoSQL', 'System Design'],
    'TCS': ['Spring', 'Hibernate', 'JavaScript', 'React'],
    'Infosys': ['Angular', 'Spring', 'Microservices', 'Oracle'],
    'Flipkart': ['React', 'Node.js', 'Kafka', 'Microservices']
  };
  
  const missingSkills = missingSkillsByCompany[company] || 
    ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'];
  
  // Generate strengths based on matched skills
  const strengths = [
    `Strong foundation in ${matchedSkills.slice(0, 2).join(' and ')}`,
    `Demonstrated experience with ${matchedSkills.slice(2, 4).join(' and ')}`,
    `Good project portfolio showing practical application of skills`
  ].filter(s => s.indexOf('undefined') === -1);
  
  // Generate weaknesses based on missing skills
  const weaknesses = [
    `Missing key skills for ${company} ${role} position: ${missingSkills.slice(0, 3).join(', ')}`,
    `Limited experience with ${missingSkills.slice(1, 3).join(' and ')}`,
    `Resume could better highlight achievements and metrics`
  ];
  
  // Generate suggestions
  const suggestions = [
    `Add experience with ${missingSkills[0]} and ${missingSkills[1]} to align with ${company}'s technical requirements`,
    `Include metrics and quantifiable achievements in your experience section (${company} values data-driven results)`,
    `Add relevant projects that showcase your skills in`,
    `Tailor your resume to emphasize Teamwork and Communication, which are core values at ${company}`,
    `Prepare for Technical Questions and Problem Solving questions, which are common in ${company}'s interview process`
  ];
  
  return {
    score,
    skillsMatch: {
      matched: matchedSkills,
      missing: missingSkills
    },
    strengths,
    weaknesses,
    suggestions,
    // This will be populated with ML model insights in the future
    mlInsights: {
      relevanceScore: score,
      skillGapSeverity: 'Moderate',
      recommendedFocus: missingSkills.slice(0, 2),
      estimatedInterviewReadiness: `${score > 70 ? 'Good' : 'Needs Improvement'}`
    }
  };
};

// Get company-specific insights to help with interview preparation
const getCompanyInsights = (company) => {
  const companyInsights = {
    'Microsoft': {
      technicalFocus: [
        'Software Architecture and System Design',
        'Code Quality and Testing Practices',
        'Problem-solving with Algorithms and Data Structures',
        'Cloud Services (Azure) Knowledge'
      ],
      culturalValues: [
        'Growth Mindset - Embracing challenges and learning from failures',
        'Diversity and Inclusion',
        'Customer-Obsessed Innovation',
        'Collaborative Teamwork'
      ],
      resumePreferences: [
        'Quantifiable achievements with metrics',
        'Project impact and business outcomes',
        'Technical depth in specific areas',
        'Evidence of continuous learning'
      ],
      interviewFocus: [
        'Coding challenges with emphasis on optimization',
        'System design for scalability',
        'Behavioral questions based on growth mindset',
        'Problem-solving approach and communication'
      ]
    },
    'Google': {
      technicalFocus: [
        'Algorithm Efficiency and Optimization',
        'Distributed Systems and Scalability',
        'Data Structures Implementation',
        'Machine Learning Fundamentals'
      ],
      culturalValues: [
        'Googleyness - Comfort with ambiguity, bias for action',
        'Innovation and Creative Problem-Solving',
        'User-Focused Design Thinking',
        'Intellectual Humility'
      ],
      resumePreferences: [
        'X-Y-Z Format: Accomplished [X] as measured by [Y] by doing [Z]',
        'Leadership examples even for non-leadership roles',
        'Academic excellence and technical depth',
        'Evidence of "scrappiness" and entrepreneurial mindset'
      ],
      interviewFocus: [
        'Algorithm optimization under constraints',
        'System design for Google-scale problems',
        'Coding efficiency and clean code practices',
        'Leadership and collaboration scenarios'
      ]
    },
    'Amazon': {
      technicalFocus: [
        'Scalable Architecture Design',
        'Operational Excellence and Monitoring',
        'Microservices and Distributed Systems',
        'AWS Services and Cloud Computing'
      ],
      culturalValues: [
        'Customer Obsession - Working backwards from customer needs',
        'Ownership and Long-term Thinking',
        'Bias for Action and Calculated Risk-Taking',
        'Frugality and Resource Optimization'
      ],
      resumePreferences: [
        'Results-oriented achievements with metrics',
        'Examples demonstrating Amazon Leadership Principles',
        'Problem statements followed by solutions and results',
        'Evidence of ownership and accountability'
      ],
      interviewFocus: [
        'Behavioral questions based on Leadership Principles',
        'System design with focus on scalability and reliability',
        'Coding with emphasis on edge cases and error handling',
        'Problem-solving approach and decision-making process'
      ]
    },
    'TCS': {
      technicalFocus: [
        'Software Development Lifecycle',
        'Enterprise Application Development',
        'Database Management and SQL',
        'Core Programming Fundamentals'
      ],
      culturalValues: [
        'Adaptability and Learning Agility',
        'Client-Focused Service Orientation',
        'Global Collaboration and Teamwork',
        'Process Discipline and Quality Focus'
      ],
      resumePreferences: [
        'Academic performance and credentials',
        'Technical foundation across multiple domains',
        'Communication and collaboration skills',
        'Adaptability to different technologies'
      ],
      interviewFocus: [
        'Technical fundamentals and aptitude',
        'Communication and English language proficiency',
        'Logical reasoning and problem-solving',
        'Cultural fit and adaptability assessment'
      ]
    },
    'Infosys': {
      technicalFocus: [
        'Programming Fundamentals and Logic',
        'Database Concepts and SQL',
        'Web Technologies and Frameworks',
        'Software Testing and Quality Assurance'
      ],
      culturalValues: [
        'Learnability and Continuous Improvement',
        'Client Value Creation',
        'Quality Consciousness',
        'Integrity and Transparency'
      ],
      resumePreferences: [
        'Academic excellence and credentials',
        'Technical foundation and aptitude',
        'Communication skills and clarity',
        'Evidence of learning ability'
      ],
      interviewFocus: [
        'Technical basics across multiple domains',
        'Aptitude and logical reasoning',
        'Communication and presentation skills',
        'Adaptability and learning potential'
      ]
    },
    'Flipkart': {
      technicalFocus: [
        'E-commerce Domain Knowledge',
        'Scalable System Architecture',
        'Performance Optimization',
        'Microservices and Distributed Systems'
      ],
      culturalValues: [
        'Customer First Approach',
        'Bias for Action and Speed',
        'Innovation and Entrepreneurial Mindset',
        'Ownership and Accountability'
      ],
      resumePreferences: [
        'Project complexity and technical challenges',
        'Problem-solving approach and solutions',
        'Impact and scale of previous work',
        'Evidence of ownership and initiative'
      ],
      interviewFocus: [
        'Data Structures and Algorithms',
        'System Design for E-commerce Scale',
        'Problem-solving under constraints',
        'Ownership and Decision-making scenarios'
      ]
    }
  };
  
  return companyInsights[company] || companyInsights['Google']; // Default to Google if company not found
};

// Function to handle errors during parsing
export const handleParsingError = (error) => {
  console.error('Resume parsing error:', error);
  
  // Return a user-friendly error message based on the error type
  if (error.message.includes('Unsupported file type')) {
    return 'The file format is not supported. Please upload a PDF or DOCX file.';
  } else if (error.message.includes('corrupt') || error.message.includes('malformed')) {
    return 'The file appears to be corrupted or malformed. Please try uploading a different file.';
  } else if (error.message.includes('password')) {
    return 'The PDF file is password-protected. Please remove the password and try again.';
  } else {
    return 'An error occurred while parsing your resume. Please try again with a different file.';
  }
};
