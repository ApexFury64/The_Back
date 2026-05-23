// Comprehensive Mock Data for TechWing AI Tutor

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// ── SUBJECTS DATA (Standards 1 to 12) ──

export type Subject = {
  id: string;
  name: string;
  code: string;
  color: string;
};

export type StandardSubjects = {
  standard: number;
  subjects: Subject[];
};

export const standardSubjectsData: StandardSubjects[] = [
  {
    standard: 1,
    subjects: [
      { id: '1-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '1-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '1-evs', name: 'Environmental Science', code: 'EVS', color: '#34d399' },
      { id: '1-hin', name: 'Hindi', code: 'HIN', color: '#f59e0b' },
      { id: '1-art', name: 'Art & Craft', code: 'ART', color: '#a78bfa' },
    ]
  },
  {
    standard: 2,
    subjects: [
      { id: '2-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '2-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '2-evs', name: 'Environmental Science', code: 'EVS', color: '#34d399' },
      { id: '2-hin', name: 'Hindi', code: 'HIN', color: '#f59e0b' },
      { id: '2-comp', name: 'Computer Basics', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 3,
    subjects: [
      { id: '3-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '3-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '3-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '3-sst', name: 'Social Studies', code: 'SST', color: '#f59e0b' },
      { id: '3-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '3-comp', name: 'Computer Science', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 4,
    subjects: [
      { id: '4-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '4-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '4-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '4-sst', name: 'Social Studies', code: 'SST', color: '#f59e0b' },
      { id: '4-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '4-comp', name: 'Computer Science', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 5,
    subjects: [
      { id: '5-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '5-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '5-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '5-sst', name: 'Social Studies', code: 'SST', color: '#f59e0b' },
      { id: '5-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '5-comp', name: 'Computer Science', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 6,
    subjects: [
      { id: '6-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '6-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '6-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '6-his', name: 'History & Civics', code: 'HIS', color: '#f59e0b' },
      { id: '6-geo', name: 'Geography', code: 'GEO', color: '#8b5cf6' },
      { id: '6-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '6-comp', name: 'Computer Applications', code: 'COMP', color: '#6366f1' },
      { id: '6-san', name: 'Sanskrit/Regional', code: 'SAN', color: '#ec4899' },
    ]
  },
  {
    standard: 7,
    subjects: [
      { id: '7-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '7-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '7-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '7-his', name: 'History & Civics', code: 'HIS', color: '#f59e0b' },
      { id: '7-geo', name: 'Geography', code: 'GEO', color: '#8b5cf6' },
      { id: '7-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '7-comp', name: 'Computer Applications', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 8,
    subjects: [
      { id: '8-eng', name: 'English', code: 'ENG', color: '#0ea5e9' },
      { id: '8-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '8-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '8-his', name: 'History & Civics', code: 'HIS', color: '#f59e0b' },
      { id: '8-geo', name: 'Geography', code: 'GEO', color: '#8b5cf6' },
      { id: '8-hin', name: 'Hindi', code: 'HIN', color: '#f43f5e' },
      { id: '8-comp', name: 'Computer Applications', code: 'COMP', color: '#6366f1' },
    ]
  },
  {
    standard: 9,
    subjects: [
      { id: '9-eng', name: 'English Language & Literature', code: 'ENG', color: '#0ea5e9' },
      { id: '9-math', name: 'Mathematics', code: 'MATH', color: '#00d4aa' },
      { id: '9-sci', name: 'Science (Phy, Chem, Bio)', code: 'SCI', color: '#34d399' },
      { id: '9-sst', name: 'Social Science', code: 'SST', color: '#f59e0b' },
      { id: '9-hin', name: 'Hindi Course A/B', code: 'HIN', color: '#f43f5e' },
      { id: '9-it', name: 'Information Technology', code: 'IT', color: '#6366f1' },
    ]
  },
  {
    standard: 10,
    subjects: [
      { id: '10-eng', name: 'English Language & Literature', code: 'ENG', color: '#0ea5e9' },
      { id: '10-math', name: 'Mathematics (Standard/Basic)', code: 'MATH', color: '#00d4aa' },
      { id: '10-sci', name: 'Science', code: 'SCI', color: '#34d399' },
      { id: '10-sst', name: 'Social Science', code: 'SST', color: '#f59e0b' },
      { id: '10-hin', name: 'Hindi Course A/B', code: 'HIN', color: '#f43f5e' },
      { id: '10-it', name: 'Information Technology', code: 'IT', color: '#6366f1' },
    ]
  },
  {
    standard: 11,
    subjects: [
      // Science Stream Focus
      { id: '11-phy', name: 'Physics', code: 'PHY', color: '#0ea5e9' },
      { id: '11-chem', name: 'Chemistry', code: 'CHEM', color: '#00d4aa' },
      { id: '11-math', name: 'Mathematics', code: 'MATH', color: '#f59e0b' },
      { id: '11-bio', name: 'Biology', code: 'BIO', color: '#34d399' },
      { id: '11-eng', name: 'English Core', code: 'ENG', color: '#8b5cf6' },
      { id: '11-cs', name: 'Computer Science', code: 'CS', color: '#6366f1' },
      // Commerce/Arts examples
      { id: '11-acc', name: 'Accountancy', code: 'ACC', color: '#f43f5e' },
      { id: '11-bst', name: 'Business Studies', code: 'BST', color: '#ec4899' },
      { id: '11-eco', name: 'Economics', code: 'ECO', color: '#10b981' },
    ]
  },
  {
    standard: 12,
    subjects: [
      { id: '12-phy', name: 'Physics', code: 'PHY', color: '#0ea5e9' },
      { id: '12-chem', name: 'Chemistry', code: 'CHEM', color: '#00d4aa' },
      { id: '12-math', name: 'Mathematics', code: 'MATH', color: '#f59e0b' },
      { id: '12-bio', name: 'Biology', code: 'BIO', color: '#34d399' },
      { id: '12-eng', name: 'English Core', code: 'ENG', color: '#8b5cf6' },
      { id: '12-cs', name: 'Computer Science', code: 'CS', color: '#6366f1' },
      { id: '12-acc', name: 'Accountancy', code: 'ACC', color: '#f43f5e' },
      { id: '12-bst', name: 'Business Studies', code: 'BST', color: '#ec4899' },
      { id: '12-eco', name: 'Economics', code: 'ECO', color: '#10b981' },
    ]
  }
];

export const getSubjectsForStandard = (std: number) => {
  return standardSubjectsData.find(s => s.standard === std)?.subjects || [];
};

// Mock syllabus modules by subject code (Deeply Nested & Realistic for 7th Grade)
const mockModules: Record<string, any[]> = {
  'ENG': [
    { 
      title: "Unit 1: Honeycomb - Prose & Poetry", 
      status: "in-progress",
      subTopics: [
        { title: "Three Questions", status: "completed" },
        { title: "The Squirrel (Poem)", status: "completed" },
        { title: "A Gift of Chappals", status: "in-progress" },
        { title: "The Rebel (Poem)", status: "locked" },
        { title: "Gopal and the Hilsa Fish", status: "locked" }
      ]
    },
    { 
      title: "Unit 2: An Alien Hand (Supplementary)", 
      status: "locked",
      subTopics: [
        { title: "The Tiny Teacher", status: "locked" },
        { title: "Bringing up Kari", status: "locked" },
        { title: "The Desert", status: "locked" }
      ]
    },
    { 
      title: "Unit 3: Grammar & Writing", 
      status: "in-progress",
      subTopics: [
        { title: "Nouns and Pronouns", status: "completed" },
        { title: "Adjectives & Degrees of Comparison", status: "in-progress" },
        { title: "Story Writing", status: "locked" },
        { title: "Notice Writing", status: "locked" }
      ]
    }
  ],
  'MATH': [
    { 
      title: "Unit 1: Number System", 
      status: "completed",
      subTopics: [
        { title: "Integers: Properties of Addition and Subtraction", status: "completed" },
        { title: "Integers: Multiplication and Division", status: "completed" },
        { title: "Fractions and Decimals", status: "completed" }
      ]
    },
    { 
      title: "Unit 2: Algebra & Data", 
      status: "in-progress",
      subTopics: [
        { title: "Data Handling", status: "completed" },
        { title: "Simple Equations", status: "in-progress" },
        { title: "Algebraic Expressions", status: "locked" }
      ]
    },
    { 
      title: "Unit 3: Geometry", 
      status: "locked",
      subTopics: [
        { title: "Lines and Angles", status: "locked" },
        { title: "The Triangle and its Properties", status: "locked" },
        { title: "Congruence of Triangles", status: "locked" },
        { title: "Practical Geometry", status: "locked" }
      ]
    }
  ],
  'SCI': [
    { 
      title: "Unit 1: Food and Nutrition", 
      status: "completed",
      subTopics: [
        { title: "Nutrition in Plants", status: "completed" },
        { title: "Nutrition in Animals", status: "completed" }
      ]
    },
    { 
      title: "Unit 2: Materials & Everyday Science", 
      status: "in-progress",
      subTopics: [
        { title: "Fibre to Fabric", status: "completed" },
        { title: "Heat and Temperature", status: "in-progress" },
        { title: "Acids, Bases and Salts", status: "locked" },
        { title: "Physical and Chemical Changes", status: "locked" }
      ]
    },
    { 
      title: "Unit 3: The Living World", 
      status: "locked",
      subTopics: [
        { title: "Weather, Climate and Adaptations", status: "locked" },
        { title: "Winds, Storms and Cyclones", status: "locked" },
        { title: "Soil: Profile and Types", status: "locked" },
        { title: "Respiration in Organisms", status: "locked" }
      ]
    }
  ],
  'HIS': [
    { 
      title: "Unit 1: Our Pasts - II", 
      status: "in-progress",
      subTopics: [
        { title: "Tracing Changes Through A Thousand Years", status: "completed" },
        { title: "New Kings And Kingdoms", status: "in-progress" },
        { title: "The Delhi Sultans", status: "locked" },
        { title: "The Mughal Empire", status: "locked" }
      ]
    }
  ],
  'GEO': [
    { 
      title: "Unit 1: Our Environment", 
      status: "in-progress",
      subTopics: [
        { title: "Environment Components", status: "completed" },
        { title: "Inside Our Earth", status: "in-progress" },
        { title: "Our Changing Earth", status: "locked" },
        { title: "Air and Atmosphere", status: "locked" }
      ]
    }
  ],
  'HIN': [
    { 
      title: "Unit 1: Vasant - Part 2", 
      status: "in-progress",
      subTopics: [
        { title: "Hum Panchhi Unmukt Gagan Ke", status: "completed" },
        { title: "Dadi Maa", status: "completed" },
        { title: "Himalaya Ki Betiyan", status: "in-progress" },
        { title: "Kathputli", status: "locked" }
      ]
    },
    { 
      title: "Unit 2: Vyakaran (Grammar)", 
      status: "locked",
      subTopics: [
        { title: "Sangya Aur Sarvanam", status: "locked" },
        { title: "Visheshan", status: "locked" },
        { title: "Patra Lekhan", status: "locked" }
      ]
    }
  ],
  'COMP': [
    { 
      title: "Unit 1: Basics of Computers", 
      status: "completed",
      subTopics: [
        { title: "Number System", status: "completed" },
        { title: "Computer Virus", status: "completed" }
      ]
    },
    { 
      title: "Unit 2: Software Applications", 
      status: "in-progress",
      subTopics: [
        { title: "Advanced Features of Excel", status: "completed" },
        { title: "Introduction to HTML", status: "in-progress" },
        { title: "Formatting in HTML", status: "locked" }
      ]
    },
    { 
      title: "Unit 3: Internet & Safety", 
      status: "locked",
      subTopics: [
        { title: "Cyber Safety", status: "locked" },
        { title: "Ethics in Computing", status: "locked" }
      ]
    }
  ]
};

// Mock student specific subjects (e.g. for a 7th standard student)
export const studentSubjects = getSubjectsForStandard(7).map((sub, index) => ({
  ...sub,
  progress: [85, 92, 78, 88, 75, 95, 80][index % 7],
  grade: ['A', 'A+', 'B+', 'A', 'B', 'A+', 'A'][index % 7],
  score: [85, 92, 78, 88, 75, 95, 80][index % 7],
  modules: mockModules[sub.code] || mockModules['SCI'] // Fallback if code missing
}));


// ── DASHBOARD STATS ──

export const studentStats = [
  { title: "Study Hours", value: "24.5h", trend: "+2.5h this week", icon: "Clock", trendUp: true },
  { title: "Quizzes Taken", value: "12", trend: "3 pending", icon: "BookOpen", trendUp: true },
  { title: "Exam Readiness", value: "87%", trend: "+5% vs last month", icon: "Target", trendUp: true },
  { title: "Current Streak", value: "14 Days", trend: "Personal best: 21", icon: "Flame", trendUp: true },
];

export const parentChildStats = [
  { title: "Overall Grade", value: "A-", trend: "Consistent", icon: "GraduationCap", trendUp: true },
  { title: "Study Hours", value: "18h", trend: "-2h this week", icon: "Clock", trendUp: false },
  { title: "Attendance", value: "95%", trend: "Above average", icon: "CheckCircle", trendUp: true },
  { title: "Assignments", value: "2", trend: "Due this week", icon: "FileText", trendUp: null },
];

export const teacherStats = [
  { title: "Total Students", value: "145", trend: "Across 4 classes", icon: "Users", trendUp: true },
  { title: "Avg Class Score", value: "78%", trend: "+3% this term", icon: "TrendingUp", trendUp: true },
  { title: "Pending Reviews", value: "24", trend: "Needs attention", icon: "AlertCircle", trendUp: false },
  { title: "AI Generated", value: "12", trend: "Papers & Quizzes", icon: "Bot", trendUp: true },
];

export const adminStats = [
  { title: "Total Students", value: "2,450", trend: "+124 this year", icon: "Users", trendUp: true },
  { title: "Teachers", value: "142", trend: "Active staff", icon: "Briefcase", trendUp: true },
  { title: "Avg Attendance", value: "94.2%", trend: "-1.2% this week", icon: "Activity", trendUp: false },
  { title: "AI Sessions", value: "12.4k", trend: "+24% this month", icon: "Bot", trendUp: true },
];

export const superAdminStats = [
  { title: "Total Schools", value: "48", trend: "+5 this month", icon: "Building2", trendUp: true },
  { title: "Active Users", value: "84.2k", trend: "+12% growth", icon: "Users", trendUp: true },
  { title: "AI Tokens Used", value: "24.5M", trend: "85% of limit", icon: "Cpu", trendUp: true },
  { title: "Platform Uptime", value: "99.99%", trend: "All systems operational", icon: "Activity", trendUp: true },
];

// ── CHARTS DATA ──

export const performanceData = [
  { name: 'Jan', value: 65, value2: 55 },
  { name: 'Feb', value: 72, value2: 58 },
  { name: 'Mar', value: 68, value2: 60 },
  { name: 'Apr', value: 85, value2: 65 },
  { name: 'May', value: 82, value2: 68 },
  { name: 'Jun', value: 90, value2: 70 },
];

export const weeklyStudyData = [
  { name: 'Mon', value: 2.5, value2: 1 },
  { name: 'Tue', value: 3.0, value2: 1.5 },
  { name: 'Wed', value: 2.0, value2: 0.5 },
  { name: 'Thu', value: 4.5, value2: 2 },
  { name: 'Fri', value: 1.5, value2: 0.5 },
  { name: 'Sat', value: 5.0, value2: 2.5 },
  { name: 'Sun', value: 4.0, value2: 1.5 },
];

export const subjectPerformanceData = [
  { name: 'Math', value: 92 },
  { name: 'Science', value: 78 },
  { name: 'History', value: 85 },
  { name: 'Geography', value: 88 },
  { name: 'English', value: 95 },
];

export const schoolPerformanceData = [
  { name: 'Term 1', value: 72, value2: 68 },
  { name: 'Term 2', value: 75, value2: 70 },
  { name: 'Term 3', value: 78, value2: 74 },
  { name: 'Final', value: 82, value2: 76 },
];

export const attendanceData = [
  { name: 'Mon', value: 95 },
  { name: 'Tue', value: 94 },
  { name: 'Wed', value: 96 },
  { name: 'Thu', value: 92 },
  { name: 'Fri', value: 88 },
];

export const platformGrowthData = [
  { name: 'Jan', value: 20, value2: 15000 },
  { name: 'Feb', value: 25, value2: 22000 },
  { name: 'Mar', value: 32, value2: 35000 },
  { name: 'Apr', value: 40, value2: 58000 },
  { name: 'May', value: 48, value2: 84000 },
];

// ── MISC WIDGET DATA ──

export const studentAssignments = [
  { id: 1, title: "Integers Mastery Worksheet", subject: "Mathematics", dueDate: "Tomorrow", status: "pending", subjectColor: "#00d4aa" },
  { id: 2, title: "Nutrition in Plants Diagram", subject: "Science", dueDate: "In 2 days", status: "pending", subjectColor: "#34d399" },
  { id: 3, title: "Inside Our Earth Report", subject: "Geography", dueDate: "Next week", status: "submitted", subjectColor: "#8b5cf6" },
  { id: 4, title: "Three Questions Story Analysis", subject: "English", dueDate: "Last week", status: "graded", subjectColor: "#0ea5e9" },
];

export const studentQuizzesData = [
  // Mathematics
  { id: 1, title: "Integers: Multiplication and Division", subject: "Mathematics", status: "pending", due: "Today", questions: 15, timeLimit: "30m", difficulty: "Hard" },
  { id: 6, title: "Fractions and Decimals", subject: "Mathematics", status: "completed", score: 85, questions: 20, timeTaken: "22m" },
  { id: 7, title: "Simple Equations", subject: "Mathematics", status: "pending", due: "Next Week", questions: 10, timeLimit: "20m", difficulty: "Medium" },
  
  // Science
  { id: 2, title: "Heat and Temperature", subject: "Science", status: "pending", due: "Tomorrow", questions: 20, timeLimit: "45m", difficulty: "Medium" },
  { id: 4, title: "Nutrition in Animals", subject: "Science", status: "completed", score: 78, questions: 25, timeTaken: "24m" },
  { id: 8, title: "Nutrition in Plants", subject: "Science", status: "completed", score: 95, questions: 15, timeTaken: "14m" },
  { id: 9, title: "Fibre to Fabric", subject: "Science", status: "completed", score: 82, questions: 15, timeTaken: "16m" },
  
  // History & Geography
  { id: 3, title: "New Kings And Kingdoms", subject: "History & Civics", status: "completed", score: 92, questions: 15, timeTaken: "12m" },
  { id: 10, title: "Tracing Changes Through A Thousand Years", subject: "History & Civics", status: "completed", score: 88, questions: 20, timeTaken: "18m" },
  { id: 11, title: "Inside Our Earth", subject: "Geography", status: "pending", due: "In 3 Days", questions: 15, timeLimit: "25m", difficulty: "Easy" },
  { id: 12, title: "Environment Components", subject: "Geography", status: "completed", score: 90, questions: 10, timeTaken: "8m" },

  // Languages (English & Hindi)
  { id: 5, title: "A Gift of Chappals", subject: "English", status: "completed", score: 88, questions: 20, timeTaken: "18m" },
  { id: 13, title: "Three Questions", subject: "English", status: "completed", score: 96, questions: 15, timeTaken: "11m" },
  { id: 14, title: "Nouns and Pronouns", subject: "English", status: "pending", due: "Tomorrow", questions: 30, timeLimit: "40m", difficulty: "Medium" },
  { id: 15, title: "Hum Panchhi Unmukt Gagan Ke", subject: "Hindi", status: "completed", score: 94, questions: 10, timeTaken: "9m" },
  { id: 16, title: "Dadi Maa", subject: "Hindi", status: "completed", score: 85, questions: 15, timeTaken: "15m" },

  // Computer Applications
  { id: 17, title: "Number System", subject: "Computer Applications", status: "completed", score: 100, questions: 10, timeTaken: "7m" },
  { id: 18, title: "Advanced Features of Excel", subject: "Computer Applications", status: "pending", due: "Next Week", questions: 20, timeLimit: "30m", difficulty: "Hard" },
];

export const recentAIChats = [
  { id: 1, topic: "Explain Adding Integers", subject: "Mathematics", time: "2 hours ago" },
  { id: 2, topic: "How does Heat Transfer?", subject: "Science", time: "Yesterday" },
  { id: 3, topic: "Layers of the Earth", subject: "Geography", time: "2 days ago" },
];

export const leaderboard = [
  { rank: 1, name: "Arjun Reddy", score: 9850, avatar: "AR" },
  { rank: 2, name: "Priya Sharma", score: 9620, avatar: "PS" },
  { rank: 3, name: "Vikram Singh", score: 9410, avatar: "VS" },
  { rank: 4, name: "Kavya Nair", score: 9100, avatar: "KN" },
  { rank: 5, name: "Ravi Kumar", score: 8950, avatar: "RK" },
];

export const weakSubjectAlerts = [
  { subject: "Science", issue: "Scored 65% in Acids, Bases and Salts", recommendation: "Suggest 2 extra hours of AI tutoring", severity: "high" },
  { subject: "Mathematics", issue: "Missed Polynomials assignment", recommendation: "Set reminders for due dates", severity: "medium" },
];

export const childDailyActivity = [
  { time: "08:00 AM", activity: "Attended Science Class (Chemical Reactions)", type: "class" },
  { time: "10:30 AM", activity: "AI Tutor Session (Polynomials)", type: "ai" },
  { time: "01:00 PM", activity: "Submitted English Assignment", type: "assignment" },
  { time: "03:45 PM", activity: "Completed Social Science Quiz (85%)", type: "quiz" },
  { time: "05:00 PM", activity: "Self Study (Hindi)", type: "study" },
];

export const teacherClasses = [
  { id: 1, name: "Class 10-A", subject: "Mathematics", students: 35, avgScore: 82, nextClass: "Today, 10:00 AM" },
  { id: 2, name: "Class 10-B", subject: "Mathematics", students: 32, avgScore: 78, nextClass: "Today, 11:30 AM" },
  { id: 3, name: "Class 9-A", subject: "Mathematics", students: 40, avgScore: 75, nextClass: "Tomorrow, 09:00 AM" },
  { id: 4, name: "Class 9-C", subject: "Mathematics", students: 38, avgScore: 71, nextClass: "Tomorrow, 12:00 PM" },
];

export const classesData = [
  { id: "c1", name: "Class 10-A", standard: 10, totalStudents: 35, subjects: ["Mathematics", "Science", "English Language & Literature", "Social Science", "Hindi Course A"] },
  { id: "c2", name: "Class 10-B", standard: 10, totalStudents: 32, subjects: ["Mathematics", "Science", "English Language & Literature", "Social Science", "Information Technology"] },
  { id: "c3", name: "Class 9-A", standard: 9, totalStudents: 40, subjects: ["Mathematics", "Science", "English Language & Literature", "Social Science", "Hindi Course B"] },
  { id: "c4", name: "Class 11-Sci", standard: 11, totalStudents: 28, subjects: ["Physics", "Chemistry", "Mathematics", "English Core", "Computer Science"] },
  { id: "c5", name: "Class 12-Com", standard: 12, totalStudents: 30, subjects: ["Accountancy", "Business Studies", "Economics", "English Core", "Mathematics"] },
];

export const parentProfiles = [
  {
    id: "p1",
    name: "Mr. Reddy",
    phone: "+91 9876543210",
    otp: "123456",
    linkedStudents: [
      { id: "s1", name: "Arjun Reddy", class: "10-A", relation: "Father" },
      { id: "s2", name: "Ananya Reddy", class: "7-B", relation: "Father" }
    ]
  },
  {
    id: "p2",
    name: "Mrs. Sharma",
    phone: "+91 9123456780",
    otp: "112233",
    linkedStudents: [
      { id: "s3", name: "Priya Sharma", class: "10-B", relation: "Mother" }
    ]
  }
];

export const weakStudents = [
  { name: "Rohan Patel", class: "10-B", score: 45, issue: "Struggling with Algebra", trend: "-5%" },
  { name: "Sneha Gupta", class: "9-A", score: 52, issue: "Missed 3 assignments", trend: "-2%" },
  { name: "Aman Verma", class: "10-A", score: 58, issue: "Low participation", trend: "+1%" },
];

export const recentAnnouncements = [
  { id: 1, title: "Term 1 Examination Schedule", content: "The schedule for Term 1 exams has been published. Exams begin on Oct 15th.", date: "Today", priority: "high" },
  { id: 2, title: "Science Fair 2026", content: "Registrations for the annual science fair are now open. Deadline is next Friday.", date: "Yesterday", priority: "medium" },
  { id: 3, title: "New AI Features", content: "We have upgraded the AI tutor with new interactive physics simulations.", date: "2 days ago", priority: "low" },
];

export const platformSchools = [
  { id: 1, name: "Delhi Public School", city: "Hyderabad", students: 2450, teachers: 142, plan: "enterprise", aiUsage: 85, status: "active" },
  { id: 2, name: "Kendriya Vidyalaya", city: "Delhi", students: 3200, teachers: 180, plan: "pro", aiUsage: 65, status: "active" },
  { id: 3, name: "St. Mary's High", city: "Mumbai", students: 1800, teachers: 95, plan: "pro", aiUsage: 92, status: "active" },
  { id: 4, name: "Cambridge International", city: "Bangalore", students: 1200, teachers: 85, plan: "enterprise", aiUsage: 78, status: "active" },
  { id: 5, name: "Sunshine Public", city: "Chennai", students: 850, teachers: 45, plan: "basic", aiUsage: 45, status: "active" },
];

export const systemHealthData = [
  { metric: "API Response Time", value: "124ms", status: "healthy" },
  { metric: "Database Load", value: "42%", status: "healthy" },
  { metric: "AI Token Usage", value: "85%", status: "warning" },
  { metric: "Storage Capacity", value: "68%", status: "healthy" },
  { metric: "Redis Cache Hit", value: "94%", status: "healthy" },
  { metric: "WebSocket Conns", value: "12.4k", status: "healthy" },
];

export const notifications = [
  { id: 1, title: "New Assignment", message: "Physics worksheet due tomorrow", time: "10 min ago", read: false, type: "alert" },
  { id: 2, title: "Quiz Graded", message: "You scored 92% in Mathematics", time: "1 hour ago", read: false, type: "success" },
  { id: 3, title: "Live Class", message: "Chemistry live class starting in 15 mins", time: "2 hours ago", read: true, type: "info" },
  { id: 4, title: "System Update", message: "Platform maintenance scheduled for tonight", time: "1 day ago", read: true, type: "system" },
];
