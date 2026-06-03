import { NextResponse } from 'next/server';

// Curriculum data keyed by subject → standard → modules with real topic names and icons
const curriculumData: Record<string, Record<number, { title: string; topics: { title: string; icon: string }[] }[]>> = {
  Mathematics: {
    6: [
      { title: 'Numbers & Integers', topics: [
        { title: 'Whole Numbers', icon: 'hash' },
        { title: 'Playing with Numbers', icon: 'dices' },
        { title: 'Negative Numbers & Integers', icon: 'minus-circle' },
      ]},
      { title: 'Geometry & Shapes', topics: [
        { title: 'Basic Geometrical Ideas', icon: 'triangle' },
        { title: 'Symmetry', icon: 'flip-horizontal' },
        { title: 'Practical Geometry', icon: 'ruler' },
      ]},
      { title: 'Fractions & Decimals', topics: [
        { title: 'Fractions', icon: 'divide' },
        { title: 'Decimals', icon: 'percent' },
      ]},
    ],
    7: [
      { title: 'Algebra & Equations', topics: [
        { title: 'Algebraic Expressions', icon: 'variable' },
        { title: 'Simple Equations', icon: 'equal' },
        { title: 'Exponents & Powers', icon: 'superscript' },
      ]},
      { title: 'Ratio & Proportion', topics: [
        { title: 'Ratios', icon: 'scale' },
        { title: 'Comparing Quantities', icon: 'bar-chart-3' },
      ]},
      { title: 'Data Handling', topics: [
        { title: 'Mean, Median & Mode', icon: 'pie-chart' },
        { title: 'Probability Intro', icon: 'dices' },
      ]},
    ],
    8: [
      { title: 'Linear Equations', topics: [
        { title: 'Linear Equations in One Variable', icon: 'trending-up' },
        { title: 'Graphing Linear Equations', icon: 'line-chart' },
      ]},
      { title: 'Quadrilaterals & Polygons', topics: [
        { title: 'Understanding Quadrilaterals', icon: 'square' },
        { title: 'Polygons & Angle Sums', icon: 'hexagon' },
      ]},
      { title: 'Mensuration', topics: [
        { title: 'Surface Area & Volume', icon: 'box' },
        { title: 'Area of Trapezium & Polygon', icon: 'pentagon' },
      ]},
      { title: 'Algebra II', topics: [
        { title: 'Factorisation', icon: 'split' },
        { title: 'Algebraic Identities', icon: 'braces' },
      ]},
    ],
    9: [
      { title: 'Number Systems', topics: [
        { title: 'Real Numbers', icon: 'infinity' },
        { title: 'Irrational Numbers', icon: 'sigma' },
      ]},
      { title: 'Polynomials', topics: [
        { title: 'Polynomials & Zeroes', icon: 'function-square' },
        { title: 'Remainder Theorem', icon: 'calculator' },
      ]},
      { title: 'Coordinate Geometry', topics: [
        { title: 'Cartesian Plane', icon: 'axis-3d' },
        { title: 'Plotting Points', icon: 'crosshair' },
      ]},
      { title: 'Geometry & Proofs', topics: [
        { title: 'Triangles & Congruence', icon: 'triangle' },
        { title: 'Circle Theorems', icon: 'circle' },
      ]},
    ],
    10: [
      { title: 'Algebra III', topics: [
        { title: 'Quadratic Equations', icon: 'square-function' },
        { title: 'Arithmetic Progressions', icon: 'list-ordered' },
      ]},
      { title: 'Trigonometry', topics: [
        { title: 'Trigonometric Ratios', icon: 'triangle' },
        { title: 'Heights & Distances', icon: 'mountain' },
      ]},
      { title: 'Statistics & Probability', topics: [
        { title: 'Statistics', icon: 'bar-chart-3' },
        { title: 'Probability', icon: 'dices' },
      ]},
      { title: 'Coordinate Geometry II', topics: [
        { title: 'Distance & Section Formula', icon: 'ruler' },
        { title: 'Area of Triangle', icon: 'triangle' },
      ]},
    ],
  },
  Science: {
    6: [
      { title: 'Food & Nutrition', topics: [
        { title: 'Components of Food', icon: 'apple' },
        { title: 'Sources of Food', icon: 'wheat' },
      ]},
      { title: 'Living World', topics: [
        { title: 'Living & Non-Living Things', icon: 'leaf' },
        { title: 'The Plant Kingdom', icon: 'flower-2' },
        { title: 'Body Movements', icon: 'activity' },
      ]},
      { title: 'Materials & Things', topics: [
        { title: 'Sorting Materials', icon: 'layers' },
        { title: 'Separation of Substances', icon: 'filter' },
      ]},
    ],
    7: [
      { title: 'Physical & Chemical Changes', topics: [
        { title: 'Physical vs Chemical Changes', icon: 'flask-conical' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes' },
      ]},
      { title: 'Heat & Temperature', topics: [
        { title: 'Heat Transfer', icon: 'thermometer' },
        { title: 'Temperature Measurement', icon: 'gauge' },
      ]},
      { title: 'Life Processes', topics: [
        { title: 'Nutrition in Plants', icon: 'sprout' },
        { title: 'Respiration in Organisms', icon: 'wind' },
        { title: 'Transportation in Animals', icon: 'heart-pulse' },
      ]},
    ],
    8: [
      { title: 'Force & Pressure', topics: [
        { title: 'Force & Friction', icon: 'move' },
        { title: 'Pressure in Fluids', icon: 'droplets' },
      ]},
      { title: 'Light & Sound', topics: [
        { title: 'Reflection of Light', icon: 'sun' },
        { title: 'Human Eye & Vision', icon: 'eye' },
        { title: 'Sound & Vibrations', icon: 'audio-lines' },
      ]},
      { title: 'Chemical Effects', topics: [
        { title: 'Chemical Effects of Current', icon: 'zap' },
        { title: 'Combustion & Flame', icon: 'flame' },
      ]},
      { title: 'Reproduction', topics: [
        { title: 'Cell Structure & Functions', icon: 'microscope' },
        { title: 'Reproduction in Animals', icon: 'baby' },
      ]},
    ],
    9: [
      { title: 'Matter & Its Properties', topics: [
        { title: 'Matter in Our Surroundings', icon: 'atom' },
        { title: 'Is Matter Around Us Pure?', icon: 'beaker' },
      ]},
      { title: 'Motion & Force', topics: [
        { title: 'Motion & Speed', icon: 'gauge' },
        { title: 'Force & Laws of Motion', icon: 'arrow-right-circle' },
        { title: 'Gravitation', icon: 'orbit' },
      ]},
      { title: 'Biology', topics: [
        { title: 'The Fundamental Unit of Life', icon: 'microscope' },
        { title: 'Tissues', icon: 'grid-3x3' },
        { title: 'Diversity in Living Organisms', icon: 'trees' },
      ]},
    ],
    10: [
      { title: 'Chemical Reactions', topics: [
        { title: 'Chemical Reactions & Equations', icon: 'flask-conical' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes' },
        { title: 'Metals & Non-Metals', icon: 'gem' },
      ]},
      { title: 'Physics', topics: [
        { title: 'Electricity', icon: 'zap' },
        { title: 'Magnetic Effects of Current', icon: 'magnet' },
        { title: 'Light — Reflection & Refraction', icon: 'sun' },
      ]},
      { title: 'Life Processes', topics: [
        { title: 'Life Processes', icon: 'heart-pulse' },
        { title: 'Heredity & Evolution', icon: 'dna' },
      ]},
    ],
  },
  English: {
    6: [
      { title: 'Grammar Fundamentals', topics: [
        { title: 'Parts of Speech', icon: 'a-large-small' },
        { title: 'Nouns & Pronouns', icon: 'type' },
        { title: 'Tenses — Present & Past', icon: 'clock' },
      ]},
      { title: 'Reading & Comprehension', topics: [
        { title: 'Short Stories', icon: 'book-open' },
        { title: 'Poem Appreciation', icon: 'feather' },
      ]},
    ],
    7: [
      { title: 'Writing Skills', topics: [
        { title: 'Letter Writing', icon: 'mail' },
        { title: 'Essay Writing', icon: 'file-text' },
        { title: 'Diary Entry', icon: 'notebook-pen' },
      ]},
      { title: 'Literature', topics: [
        { title: 'Prose — A Gift of Chappals', icon: 'book-open' },
        { title: 'Poetry — The Shed', icon: 'feather' },
      ]},
    ],
    8: [
      { title: 'Advanced Grammar', topics: [
        { title: 'Active & Passive Voice', icon: 'repeat' },
        { title: 'Direct & Indirect Speech', icon: 'message-square' },
        { title: 'Clauses & Phrases', icon: 'braces' },
      ]},
      { title: 'Literature & Composition', topics: [
        { title: 'Short Story Analysis', icon: 'book-open' },
        { title: 'Poem — The Ant and the Cricket', icon: 'feather' },
        { title: 'Comprehension Passages', icon: 'scan-text' },
      ]},
    ],
    9: [
      { title: 'Grammar & Usage', topics: [
        { title: 'Modals & Determiners', icon: 'settings' },
        { title: 'Subject-Verb Agreement', icon: 'check-circle' },
      ]},
      { title: 'Literature', topics: [
        { title: 'The Fun They Had', icon: 'book-open' },
        { title: 'The Road Not Taken', icon: 'git-branch' },
        { title: 'The Sound of Music', icon: 'music' },
      ]},
    ],
    10: [
      { title: 'Grammar Mastery', topics: [
        { title: 'Tenses — All Forms', icon: 'clock' },
        { title: 'Reported Speech & Clauses', icon: 'message-square' },
      ]},
      { title: 'Literature', topics: [
        { title: 'A Letter to God', icon: 'mail' },
        { title: 'Dust of Snow', icon: 'snowflake' },
        { title: 'The Midnight Visitor', icon: 'moon' },
      ]},
    ],
  },
  History: {
    6: [
      { title: 'Ancient Civilizations', topics: [
        { title: 'Early Humans & Hunter-Gatherers', icon: 'footprints' },
        { title: 'Indus Valley Civilization', icon: 'landmark' },
        { title: 'Vedic Period', icon: 'scroll' },
      ]},
      { title: 'Kingdoms & Empires', topics: [
        { title: 'Mahajanapadas', icon: 'castle' },
        { title: 'Ashoka & the Mauryan Empire', icon: 'crown' },
      ]},
    ],
    7: [
      { title: 'Medieval India', topics: [
        { title: 'Delhi Sultanate', icon: 'castle' },
        { title: 'Mughal Empire', icon: 'crown' },
        { title: 'Bhakti & Sufi Movements', icon: 'hand-heart' },
      ]},
      { title: 'World Developments', topics: [
        { title: 'Medieval Europe', icon: 'church' },
        { title: 'Trade Routes & Exploration', icon: 'ship' },
      ]},
    ],
    8: [
      { title: 'Modern India', topics: [
        { title: 'British Raj & Colonialism', icon: 'flag' },
        { title: 'Indian National Movement', icon: 'megaphone' },
        { title: 'Making of the Constitution', icon: 'scroll-text' },
      ]},
      { title: 'World History', topics: [
        { title: 'French Revolution', icon: 'swords' },
        { title: 'Industrial Revolution', icon: 'factory' },
      ]},
    ],
    9: [
      { title: 'India & the Contemporary World', topics: [
        { title: 'French Revolution', icon: 'swords' },
        { title: 'Russian Revolution', icon: 'flag' },
        { title: 'Nazism & Rise of Hitler', icon: 'shield-alert' },
      ]},
      { title: 'Livelihoods & Economy', topics: [
        { title: 'Forest Society & Colonialism', icon: 'trees' },
        { title: 'Pastoralists in the Modern World', icon: 'tractor' },
      ]},
    ],
    10: [
      { title: 'Nationalism', topics: [
        { title: 'Rise of Nationalism in Europe', icon: 'flag' },
        { title: 'Nationalism in India', icon: 'megaphone' },
      ]},
      { title: 'Economy & Globalization', topics: [
        { title: 'The Age of Industrialisation', icon: 'factory' },
        { title: 'Globalisation & the Indian Economy', icon: 'globe' },
      ]},
    ],
  },
  Geography: {
    6: [
      { title: 'The Earth', topics: [
        { title: 'Planet Earth', icon: 'globe' },
        { title: 'Globe — Latitudes & Longitudes', icon: 'compass' },
        { title: 'Motions of the Earth', icon: 'rotate-3d' },
      ]},
      { title: 'Environment', topics: [
        { title: 'Major Landforms', icon: 'mountain' },
        { title: 'India — Climate & Vegetation', icon: 'cloud-sun' },
      ]},
    ],
    7: [
      { title: 'Our Environment', topics: [
        { title: 'Inside Our Earth', icon: 'layers' },
        { title: 'Our Changing Earth', icon: 'mountain-snow' },
        { title: 'Air & Atmosphere', icon: 'wind' },
      ]},
      { title: 'Human-Environment', topics: [
        { title: 'Life in Deserts', icon: 'sun' },
        { title: 'Life in Tropical Regions', icon: 'palm-tree' },
      ]},
    ],
    8: [
      { title: 'Resources & Development', topics: [
        { title: 'Land, Soil & Water Resources', icon: 'droplets' },
        { title: 'Mineral & Power Resources', icon: 'gem' },
        { title: 'Agriculture', icon: 'wheat' },
      ]},
      { title: 'India & the World', topics: [
        { title: 'Industries', icon: 'factory' },
        { title: 'Human Resources', icon: 'users' },
      ]},
    ],
    9: [
      { title: 'Physical Features of India', topics: [
        { title: 'The Himalayan Mountains', icon: 'mountain' },
        { title: 'The Northern Plains', icon: 'map' },
        { title: 'Drainage Systems', icon: 'waves' },
      ]},
      { title: 'Climate & Vegetation', topics: [
        { title: 'Climate of India', icon: 'cloud-sun' },
        { title: 'Natural Vegetation & Wildlife', icon: 'trees' },
      ]},
    ],
    10: [
      { title: 'Resources & Development', topics: [
        { title: 'Resource Planning', icon: 'layout-dashboard' },
        { title: 'Forest & Wildlife Resources', icon: 'trees' },
        { title: 'Water Resources', icon: 'droplets' },
      ]},
      { title: 'Economy & Infrastructure', topics: [
        { title: 'Manufacturing Industries', icon: 'factory' },
        { title: 'Lifelines of National Economy', icon: 'train-front' },
      ]},
    ],
  },
  'Computer Science': {
    8: [
      { title: 'Introduction to Computers', topics: [
        { title: 'Computer Hardware & Software', icon: 'monitor' },
        { title: 'Operating Systems', icon: 'settings' },
        { title: 'Internet & Networking', icon: 'wifi' },
      ]},
      { title: 'Programming Basics', topics: [
        { title: 'Introduction to Coding', icon: 'code' },
        { title: 'HTML & Web Pages', icon: 'globe' },
      ]},
    ],
    9: [
      { title: 'IT Fundamentals', topics: [
        { title: 'IT Applications', icon: 'smartphone' },
        { title: 'Electronic Spreadsheet', icon: 'table' },
        { title: 'DBMS Concepts', icon: 'database' },
      ]},
      { title: 'Web Technology', topics: [
        { title: 'HTML Advanced', icon: 'code' },
        { title: 'Cascading Style Sheets', icon: 'palette' },
      ]},
    ],
    10: [
      { title: 'Cyber Safety', topics: [
        { title: 'Cyber Ethics', icon: 'shield' },
        { title: 'Internet Safety', icon: 'lock' },
      ]},
      { title: 'Programming with Python', topics: [
        { title: 'Python Basics', icon: 'terminal' },
        { title: 'Data Structures in Python', icon: 'brackets' },
        { title: 'Functions & Modules', icon: 'package' },
      ]},
    ],
  },
};

export async function GET() {
  const colors: Record<string, string> = {
    Mathematics: '#0ea5e9',
    Science: '#00d4aa',
    English: '#a78bfa',
    History: '#f59e0b',
    Geography: '#f97066',
    'Computer Science': '#38bdf8',
  };

  const subjectsData = [];
  const standards = [6, 7, 8, 9, 10];
  const subjectNames = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];

  let idCounter = 1;
  for (const std of standards) {
    for (const subjectName of subjectNames) {
      if (std < 8 && subjectName === 'Computer Science') continue;

      const color = colors[subjectName] || '#0ea5e9';
      const curriculum = curriculumData[subjectName]?.[std];

      if (!curriculum) continue;

      const mockModules = curriculum.map((mod, mi) => {
        const moduleStatus = std < 8 ? 'completed' : (mi === 0 ? 'completed' : (mi === 1 ? 'in-progress' : 'locked'));
        return {
          id: `m${idCounter}_${mi}`,
          title: mod.title,
          status: moduleStatus,
          subTopics: mod.topics.map((t, ti) => {
            let topicStatus = 'locked';
            if (std < 8) {
              topicStatus = 'completed';
            } else if (std === 8) {
              if (mi === 0) topicStatus = 'completed';
              else if (mi === 1 && ti === 0) topicStatus = 'in-progress';
              else if (mi === 1 && ti > 0) topicStatus = 'locked';
              else topicStatus = 'locked';
            }
            return {
              id: `t${idCounter}_${mi}_${ti}`,
              title: t.title,
              icon: t.icon,
              status: topicStatus,
            };
          }),
        };
      });

      const progressPercent = std < 8 ? 100 : (std === 8 ? Math.floor(Math.random() * 40) + 40 : 0);
      const grade = std < 8
        ? (['A+', 'A', 'B+'][Math.floor(Math.random() * 3)])
        : (['A', 'B+', 'B', 'C'][Math.floor(Math.random() * 4)]);

      subjectsData.push({
        id: `sub_${idCounter}`,
        name: subjectName,
        code: `${subjectName.substring(0, 3).toUpperCase()}${std}`,
        color,
        standard: std.toString(),
        progress: progressPercent,
        grade,
        modules: mockModules,
      });
      idCounter++;
    }
  }

  return NextResponse.json(subjectsData);
}
