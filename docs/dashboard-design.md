# Dashboard High-Level Design (HLD)

Based on our project requirements and flow diagrams, here's a comprehensive high-level design for the dashboard:

## 1. Dashboard Layout Structure

### Main Components:
- **Sidebar Navigation** - For quick access to different modules
- **Header** - User info, notifications, settings
- **Main Content Area** - Dynamic content based on selected section
- **Progress Summary** - Visual indicators of preparation progress

## 2. Dashboard Sections (In Sequential Order)

### A. Welcome & Overview
- Personalized greeting
- Preparation progress summary
- Quick action buttons (Resume Upload, Practice Interview, etc.)
- Recent activity

### B. Company & Role Selection
- Company search/selection interface
  - Popular companies with logos
  - Search functionality
  - Option to add custom company
- Role/Position selection
  - Common roles for selected company
  - Seniority level selection (Junior, Mid, Senior)
  - **New Graduate/Fresher option** for entry-level positions
  - Custom role input option
- **Experience level indicators**
  - Clear options for freshers with no professional experience
  - Different paths based on experience level

### C. Resume Management
- Resume upload interface
  - Drag-and-drop area
  - File type validation
  - Upload progress indicator
- Resume analysis status
  - Analysis progress
  - Strength/weakness visualization
  - Match percentage with selected role
- Improvement suggestions
  - Actionable feedback
  - Missing skills highlight
  - Format recommendations
  - **Company-specific criteria matching**
  - **Alternative emphasis for freshers** (education, projects, skills)

### D. Preparation Path
- Customized preparation roadmap
  - Timeline visualization
  - Milestone tracking
  - Estimated completion dates
- Next steps guidance
  - Recommended actions
  - Priority tasks

### E. Technical Assessment Hub
- Coding challenge progress
  - Completed vs. remaining challenges
  - Performance metrics
- Practice problem recommendations
  - Company-specific problems
  - Skill-based recommendations
- Recent submissions

### F. Interview Preparation
- Mock interview scheduler
  - Calendar interface
  - Interview type selection
- Practice session history
  - Performance trends
  - Recorded sessions
- Behavioral question practice
  - Question bank
  - Response templates

### G. Analytics & Insights
- Performance dashboard
  - Skill growth charts
  - Comparison with benchmarks
- Improvement areas
  - Targeted recommendations
  - Resource suggestions

## 3. User Flow Through Dashboard

1. User logs in → lands on Welcome & Overview
2. Prompted to select Company & Role if not already done
3. Guided to upload/update resume based on selected company/role
4. Presented with personalized preparation path
5. Access to technical assessment and interview practice
6. Ongoing analytics and progress tracking

## 4. Technical Components

- **State Management**: Zustand for dashboard state
- **UI Components**: Tailwind CSS with custom components
- **Visualizations**: Charts for progress and analytics
- **Navigation**: Tab-based or wizard-style progression
- **Responsiveness**: Adapts to different screen sizes

## 5. Data Requirements

- User profile data
- Company and role information
- Resume analysis results
- Technical assessment progress
- Interview performance metrics
- Recommendation data

## 6. Resume Evaluation Approach

- **Company Requirements Database**
  - Structured collection of company-specific requirements
  - Role-based skill sets and qualifications
  - Regularly updated criteria for major companies

- **Pattern Matching System**
  - Rule-based matching against company requirements
  - Keyword relevance scoring
  - Experience and skill gap identification

- **Differentiated Analysis for Experience Levels**
  - Fresher-specific criteria focusing on education and projects
  - Mid-level emphasis on relevant experience and skills
  - Senior-level focus on leadership and advanced expertise

- **Feedback Generation**
  - Templated improvement suggestions
  - Personalized recommendations based on gap analysis
  - Company-specific optimization tips

This approach provides valuable resume feedback without requiring complex AI model training, while maintaining privacy by processing all data locally.

This dashboard design follows a logical progression that guides users through the interview preparation process while providing valuable insights and feedback at each step.
