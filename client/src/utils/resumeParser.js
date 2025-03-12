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
  try {
    if (file.type === 'application/pdf') {
      return await parsePdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDocx(file);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
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
    return processExtractedText(text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
};

// Parse DOCX files
const parseDocx = async (file) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth.js for DOCX parsing
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    
    // Parse the extracted text
    return processExtractedText(result.value);
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw error;
  }
};

// Process the extracted text to identify sections and extract information
const processExtractedText = (text) => {
  // Initialize the result object
  const result = {
    rawText: text,
    sections: {
      header: '',
      summary: '',
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      other: ''
    },
    extractedInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      links: [],
      skills: [],
      degrees: [],
      jobTitles: [],
      companies: []
    }
  };
  
  // Split text into lines and remove empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Identify sections
  const sectionIdentifiers = {
    summary: ['summary', 'profile', 'objective', 'about me', 'professional summary'],
    education: ['education', 'academic', 'degree', 'university', 'college', 'school'],
    experience: ['experience', 'employment', 'work history', 'professional experience', 'career'],
    skills: ['skills', 'technical skills', 'technologies', 'competencies', 'expertise'],
    projects: ['projects', 'personal projects', 'academic projects', 'key projects'],
    certifications: ['certifications', 'certificates', 'credentials', 'qualifications']
  };
  
  // Current section being processed
  let currentSection = 'header';
  
  // Process each line
  lines.forEach(line => {
    const lowerLine = line.toLowerCase().trim();
    
    // Check if this line is a section header
    let isSectionHeader = false;
    for (const [section, keywords] of Object.entries(sectionIdentifiers)) {
      if (keywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
        currentSection = section;
        isSectionHeader = true;
        break;
      }
    }
    
    // If not a section header, add to current section
    if (!isSectionHeader) {
      if (currentSection === 'header' && result.sections.header.length < 200) {
        result.sections.header += line + '\n';
        
        // Extract contact information from header
        extractContactInfo(line, result.extractedInfo);
      } else if (currentSection === 'summary') {
        result.sections.summary += line + '\n';
      } else if (currentSection === 'education') {
        result.sections.education.push(line);
        extractEducationInfo(line, result.extractedInfo);
      } else if (currentSection === 'experience') {
        result.sections.experience.push(line);
        extractExperienceInfo(line, result.extractedInfo);
      } else if (currentSection === 'skills') {
        result.sections.skills.push(line);
        extractSkills(line, result.extractedInfo);
      } else if (currentSection === 'projects') {
        result.sections.projects.push(line);
      } else if (currentSection === 'certifications') {
        result.sections.certifications.push(line);
      } else {
        result.sections.other += line + '\n';
      }
    }
  });
  
  // Clean up and finalize the result
  return finalizeResult(result);
};

// Extract contact information from text
const extractContactInfo = (text, extractedInfo) => {
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0 && !extractedInfo.email) {
    extractedInfo.email = emails[0];
  }
  
  // Extract phone number
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0 && !extractedInfo.phone) {
    extractedInfo.phone = phones[0];
  }
  
  // Extract links (LinkedIn, GitHub, etc.)
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(linkRegex);
  if (links) {
    extractedInfo.links = [...new Set([...extractedInfo.links, ...links])];
  }
  
  // Try to extract name from the first few lines if not already found
  if (!extractedInfo.name && text.length < 100 && !text.includes('@') && !text.includes('http')) {
    const potentialName = text.trim();
    if (potentialName.split(' ').length <= 4) {
      extractedInfo.name = potentialName;
    }
  }
};

// Extract education information
const extractEducationInfo = (text, extractedInfo) => {
  const degreeKeywords = [
    'bachelor', 'master', 'phd', 'doctorate', 'bs', 'ba', 'ms', 'ma', 'mba', 'b.tech', 'm.tech',
    'b.e.', 'm.e.', 'b.sc', 'm.sc', 'associate', 'diploma'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for degree keywords
  for (const keyword of degreeKeywords) {
    if (lowerText.includes(keyword)) {
      // Try to extract the full degree
      const words = text.split(' ');
      const keywordIndex = words.findIndex(word => word.toLowerCase().includes(keyword));
      
      if (keywordIndex !== -1) {
        // Take a few words before and after the keyword to capture the full degree
        const start = Math.max(0, keywordIndex - 2);
        const end = Math.min(words.length, keywordIndex + 4);
        const degree = words.slice(start, end).join(' ');
        
        extractedInfo.degrees.push(degree);
        break;
      }
    }
  }
};

// Extract experience information
const extractExperienceInfo = (text, extractedInfo) => {
  // Look for job titles
  const jobTitleKeywords = [
    'engineer', 'developer', 'programmer', 'analyst', 'manager', 'director', 'lead',
    'architect', 'designer', 'consultant', 'specialist', 'administrator', 'coordinator'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for job title keywords
  for (const keyword of jobTitleKeywords) {
    if (lowerText.includes(keyword)) {
      // Try to extract the full job title
      const words = text.split(' ');
      const keywordIndex = words.findIndex(word => word.toLowerCase().includes(keyword));
      
      if (keywordIndex !== -1) {
        // Take a few words before and after the keyword to capture the full title
        const start = Math.max(0, keywordIndex - 2);
        const end = Math.min(words.length, keywordIndex + 2);
        const title = words.slice(start, end).join(' ');
        
        if (title.length < 50) {  // Sanity check to avoid capturing too much text
          extractedInfo.jobTitles.push(title);
          break;
        }
      }
    }
  }
  
  // Try to extract company names
  // This is more complex and error-prone, so we'll use a simple heuristic
  // Look for lines that might contain company names (e.g., lines with "at", "for", etc.)
  if (lowerText.includes(' at ') || lowerText.includes(' for ')) {
    const atIndex = lowerText.indexOf(' at ');
    const forIndex = lowerText.indexOf(' for ');
    
    if (atIndex !== -1) {
      const companyStart = atIndex + 4;
      const companyEnd = lowerText.indexOf(',', companyStart);
      if (companyEnd !== -1 && companyEnd - companyStart < 50) {
        const company = text.substring(companyStart, companyEnd).trim();
        extractedInfo.companies.push(company);
      }
    } else if (forIndex !== -1) {
      const companyStart = forIndex + 5;
      const companyEnd = lowerText.indexOf(',', companyStart);
      if (companyEnd !== -1 && companyEnd - companyStart < 50) {
        const company = text.substring(companyStart, companyEnd).trim();
        extractedInfo.companies.push(company);
      }
    }
  }
};

// Extract skills
const extractSkills = (text, extractedInfo) => {
  console.log('[Skill Extraction] Starting skill extraction from text');
  
  // Common technical skills to look for
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'git', 'github',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'redis', 'elasticsearch',
    'firebase', 'mongo-db', 'mongo', 'vs-code', 'vs-studio', 'jupyter',
    'machine learning', 'ai', 'data science', 'data analysis', 'big data', 'hadoop', 'spark',
    'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision',
    'agile', 'scrum', 'kanban', 'jira', 'confluence', 'devops', 'ci/cd',
    'nestjs', 'chrome extensions', 'react native', 'bull queue', 'retool'
  ];
  
  const lowerText = text.toLowerCase();
  console.log('[Skill Extraction] Looking for skill sections in text');
  
  // IMPROVED: Direct search for skills in the text first
  for (const skill of technicalSkills) {
    if (lowerText.includes(skill)) {
      console.log(`[Skill Extraction] Found skill in text: "${skill}"`);
      extractedInfo.skills.push(skill);
    }
  }
  
  // IMPROVED: Look for skill section with a broader pattern
  const skillSectionRegex = /technical skills|skills|programming|languages|development|technologies|tools|utilities/gi;
  const matches = [...text.matchAll(skillSectionRegex)];
  console.log('[Skill Extraction] Found skill section matches:', matches.length);
  
  if (matches.length > 0) {
    for (const match of matches) {
      const startIdx = match.index;
      // Find the next section header or end of text (relaxed pattern)
      const nextSectionRegex = /experience|education|projects|achievements|positions|certifications|awards|interests|hobbies|references|personal|extracurricular|\n\s*[A-Z][A-Z\s]+\s*\n|$/gi;
      nextSectionRegex.lastIndex = startIdx;
      const nextSectionMatch = nextSectionRegex.exec(text);
      const endIdx = nextSectionMatch ? nextSectionMatch.index : text.length;
      
      // Extract the skill section text
      const skillSectionText = text.substring(startIdx, endIdx);
      console.log('[Skill Extraction] Found skill section:', skillSectionText);
      
      // IMPROVED: Handle bullet point patterns like "• Languages: JavaScript, C/C++, Python, SQL"
      const bulletPatterns = skillSectionText.match(/[•\-\*]\s*[A-Za-z]+\s*:\s*[^•\-\*]*/g) || [];
      console.log('[Skill Extraction] Found bullet patterns:', bulletPatterns);
      
      for (const bulletPattern of bulletPatterns) {
        console.log('[Skill Extraction] Processing bullet pattern:', bulletPattern);
        // Extract the part after the colon
        const colonIndex = bulletPattern.indexOf(':');
        if (colonIndex !== -1) {
          const skillList = bulletPattern.substring(colonIndex + 1).trim();
          console.log('[Skill Extraction] Extracted skill list:', skillList);
          
          // Split by commas or other delimiters
          const listedSkills = skillList.split(/[,|\/]/);
          for (const skill of listedSkills) {
            const cleanedSkill = skill.trim().toLowerCase();
            if (cleanedSkill && cleanedSkill.length > 0) {
              console.log(`[Skill Extraction] Extracted skill from bullet: "${cleanedSkill}"`);
              extractedInfo.skills.push(cleanedSkill);
              
              // Check for multiple skills within one item (e.g., "C/C++")
              if (cleanedSkill.includes('/')) {
                const subSkills = cleanedSkill.split('/');
                for (const subSkill of subSkills) {
                  if (subSkill.trim()) {
                    extractedInfo.skills.push(subSkill.trim());
                  }
                }
              }
            }
          }
        }
      }
      
      // Also look for standard patterns like "Languages: Java, Python"
      const categoryPatterns = skillSectionText.match(/[A-Za-z]+:\s*[^•\-\*\n]*/g) || [];
      console.log('[Skill Extraction] Found category patterns:', categoryPatterns);
      
      for (const categoryPattern of categoryPatterns) {
        const [category, skillList] = categoryPattern.split(':').map(item => item.trim());
        console.log(`[Skill Extraction] Processing category "${category}" with skills: "${skillList}"`);
        
        if (skillList) {
          // Split by commas or other delimiters
          const listedSkills = skillList.split(/[,|\/]/);
          for (const skill of listedSkills) {
            const cleanedSkill = skill.trim().toLowerCase();
            if (cleanedSkill && cleanedSkill.length > 0) {
              console.log(`[Skill Extraction] Extracted skill from category: "${cleanedSkill}"`);
              extractedInfo.skills.push(cleanedSkill);
            }
          }
        }
      }
    }
  }
  
  // Try to extract from entire text using comma-separated or bullet-point lists
  console.log('[Skill Extraction] Extracting from lists or bullet points');
  const skillLists = text.split(/[,•\-\*]/);
  for (const item of skillLists) {
    const trimmedItem = item.trim();
    if (trimmedItem.length > 0 && trimmedItem.length < 30) {
      // Check if this item is likely a skill (not a sentence)
      if (!trimmedItem.includes(' and ') && !trimmedItem.includes(' the ') && !trimmedItem.includes(' with ')) {
        // Check if it's a known technical skill or a single word that might be a skill
        if (technicalSkills.includes(trimmedItem.toLowerCase()) || 
            (trimmedItem.split(' ').length <= 2 && /^[A-Za-z]/.test(trimmedItem))) {
          console.log(`[Skill Extraction] Extracted skill from list: "${trimmedItem.toLowerCase()}"`);
          extractedInfo.skills.push(trimmedItem.toLowerCase());
        }
      }
    }
  }
  
  // Handle compound skills like "React JS" or "React Native"
  for (let i = 0; i < extractedInfo.skills.length; i++) {
    const skill = extractedInfo.skills[i];
    if (skill === 'react') {
      // Look for "js" or "native" in other skills
      if (extractedInfo.skills.includes('js')) {
        extractedInfo.skills.push('react js');
      }
      if (extractedInfo.skills.includes('native')) {
        extractedInfo.skills.push('react native');
      }
    }
  }
  
  // Remove duplicates
  extractedInfo.skills = [...new Set(extractedInfo.skills)];
  console.log('[Skill Extraction] Final extracted skills:', extractedInfo.skills);
};

// Clean up and finalize the parsing result
const finalizeResult = (result) => {
  // Remove duplicates from arrays
  result.extractedInfo.skills = [...new Set(result.extractedInfo.skills)];
  result.extractedInfo.degrees = [...new Set(result.extractedInfo.degrees)];
  result.extractedInfo.jobTitles = [...new Set(result.extractedInfo.jobTitles)];
  result.extractedInfo.companies = [...new Set(result.extractedInfo.companies)];
  result.extractedInfo.links = [...new Set(result.extractedInfo.links)];
  
  return result;
};

// Analyze resume for a specific company and role
export const analyzeResumeForCompany = (parsedResume, company, role) => {
  console.log('[Resume Analysis] Starting analysis for company:', company, 'role:', role);
  
  // Company-specific requirements mockup
  const companyRequirements = {
    'Microsoft': {
      'SDE': {
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'CI/CD', 'Git'],
        preferredSkills: ['Azure', 'C#', '.NET', 'GraphQL', 'Docker', 'Kubernetes'],
        experienceYears: 0, // For fresher
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      },
      'Data Scientist': {
        requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Statistics'],
        preferredSkills: ['TensorFlow', 'PyTorch', 'Big Data', 'Azure ML', 'Power BI'],
        experienceYears: 0, // For fresher
        education: ['Computer Science', 'Data Science', 'Statistics', 'Mathematics']
      }
    },
    'Google': {
      'SDE': {
        requiredSkills: ['JavaScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'Git'],
        preferredSkills: ['Go', 'Kubernetes', 'Cloud Computing', 'Distributed Systems'],
        experienceYears: 0, // For fresher
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    },
    'Amazon': {
      'SDE': {
        requiredSkills: ['Java', 'Python', 'JavaScript', 'AWS', 'Microservices', 'SQL'],
        preferredSkills: ['React', 'Node.js', 'NoSQL', 'Docker', 'Kubernetes'],
        experienceYears: 0, // For fresher
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    },
    'TCS': {
      'ASE': {
        requiredSkills: ['Java', 'SQL', 'Data Structures', 'Algorithms', 'Web Development'],
        preferredSkills: ['Spring', 'Hibernate', 'JavaScript', 'React', 'Angular'],
        experienceYears: 0,
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    },
    'Infosys': {
      'SDE': {
        requiredSkills: ['Java', 'SQL', 'JavaScript', 'HTML/CSS', 'Data Structures'],
        preferredSkills: ['Python', 'Angular', 'React', 'Spring', 'Microservices'],
        experienceYears: 0,
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    },
    'Flipkart': {
      'SDE': {
        requiredSkills: ['Java', 'JavaScript', 'Data Structures', 'Algorithms', 'System Design'],
        preferredSkills: ['React', 'Node.js', 'Distributed Systems', 'Kafka', 'Microservices'],
        experienceYears: 0,
        education: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    }
  };
  
  // Default requirements if company/role not found
  const defaultRequirements = {
    requiredSkills: ['JavaScript', 'Python', 'Java', 'SQL', 'Git'],
    preferredSkills: ['React', 'Node.js', 'Cloud Computing', 'Docker'],
    experienceYears: 0,
    education: ['Computer Science', 'Software Engineering', 'Information Technology']
  };
  
  // Get requirements for the selected company and role
  const requirements = companyRequirements[company]?.[role] || defaultRequirements;
  console.log('[Resume Analysis] Requirements for analysis:', requirements);
  
  // MOCKUP: Generate a realistic set of skills that would appear in a resume
  // This will be replaced by actual NLP/ML model later
  const mockResumeSkills = [
    // Programming languages
    'javascript', 'python', 'java', 'c++', 'html', 'css', 'sql',
    
    // Frameworks & libraries
    'react', 'node.js', 'express', 'django',
    
    // Cloud & DevOps
    'git', 'github', 'docker',
    
    // Databases
    'mongodb', 'mysql',
    
    // Additional skills that may be relevant for most roles
    'data structures', 'algorithms', 'problem solving', 'communication'
  ];
  
  // For mockup, randomly select between 60-90% of the skills to be "matched"
  // to create realistic variation in results
  const matchPercentage = 0.6 + Math.random() * 0.3; // 60-90% match rate
  
  // Determine which skills to consider as matched
  // We'll ensure Java, JavaScript, and Python are always matched since they
  // appear in most resumes for CS students
  const alwaysMatched = ['javascript', 'java', 'python'];
  
  const matchedSkills = requirements.requiredSkills
    .filter(skill => {
      const skillLower = skill.toLowerCase();
      return alwaysMatched.includes(skillLower) || 
             mockResumeSkills.includes(skillLower) && 
             Math.random() < matchPercentage;
    })
    .concat(
      requirements.preferredSkills.filter(skill => {
        const skillLower = skill.toLowerCase();
        return mockResumeSkills.includes(skillLower) && 
               Math.random() < matchPercentage;
      })
    );
  
  console.log('[Resume Analysis] Matched skills:', matchedSkills);
  
  // Find missing required skills (those not in matched skills)
  const missingSkills = requirements.requiredSkills
    .filter(skill => !matchedSkills.includes(skill));
  
  console.log('[Resume Analysis] Missing skills:', missingSkills);
  
  // Calculate match score (0-100)
  const requiredSkillsScore = requirements.requiredSkills.length > 0 
    ? (requirements.requiredSkills.length - missingSkills.length) / requirements.requiredSkills.length * 70
    : 0;
  
  const preferredSkillsScore = requirements.preferredSkills.length > 0
    ? matchedSkills.filter(skill => requirements.preferredSkills.includes(skill)).length / requirements.preferredSkills.length * 30
    : 0;
  
  const score = Math.round(requiredSkillsScore + preferredSkillsScore);
  
  // Generate strengths based on matched skills
  const strengths = [];
  if (matchedSkills.length > 0) {
    if (matchedSkills.some(skill => ['javascript', 'typescript', 'react', 'angular', 'vue'].includes(skill.toLowerCase()))) {
      strengths.push('Strong frontend development skills');
    }
    
    if (matchedSkills.some(skill => ['node.js', 'express', 'django', 'flask', 'spring'].includes(skill.toLowerCase()))) {
      strengths.push('Solid backend development experience');
    }
    
    if (matchedSkills.some(skill => ['python', 'machine learning', 'data analysis', 'tensorflow', 'pytorch'].includes(skill.toLowerCase()))) {
      strengths.push('Good data science and machine learning foundation');
    }
    
    if (matchedSkills.some(skill => ['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(skill.toLowerCase()))) {
      strengths.push('Cloud and DevOps knowledge');
    }
    
    if (matchedSkills.some(skill => ['sql', 'mongodb', 'postgresql', 'mysql'].includes(skill.toLowerCase()))) {
      strengths.push('Database expertise');
    }
  }
  
  // Generate weaknesses based on missing skills and other factors
  const weaknesses = [];
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing some key skills for ${company.toLowerCase()} (${missingSkills.slice(0, 3).join(', ')})`);
  }
  
  // Add some general weaknesses that are common in entry-level resumes
  weaknesses.push('Experience section could be more detailed');
  weaknesses.push('Lacks quantifiable achievements');
  
  // Generate suggestions
  const suggestions = [
    `Add experience with ${missingSkills[0] || 'relevant technologies'} if you have any`,
    'Include metrics and quantifiable achievements',
    'Add more details about your project outcomes and impact',
    `Tailor your summary to match ${role} at ${company.toLowerCase()}`
  ];
  
  // Return analysis results
  return {
    score,
    strengths,
    weaknesses,
    skillsMatch: {
      matched: matchedSkills,
      missing: missingSkills
    },
    suggestions
  };
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
