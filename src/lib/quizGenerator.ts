export interface Question {
  id: string;
  text: string;
  options: string; // JSON string array
  correctAnswer: number;
}

// Simple deterministic hash to get consistent questions and correct answers for a quizId
function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function generateQuestions(
  quizId: string,
  subject: string,
  standard: number,
  title: string
): Question[] {
  const hash = getStringHash(quizId);
  const normalizedSubject = subject.toLowerCase().trim();
  const t = title.toLowerCase();

  let pool: Omit<Question, 'id'>[] = [];

  if (normalizedSubject.includes('math')) {
    if (t.includes('number') || t.includes('integer') || t.includes('real')) {
      pool = [
        { text: "What is the product of a positive integer and a negative integer?", options: JSON.stringify(["Positive", "Negative", "Zero", "Depends on the values"]), correctAnswer: 1 },
        { text: "Which of the following is an irrational number?", options: JSON.stringify(["3.14", "22/7", "Square root of 2", "0.3333..."]), correctAnswer: 2 },
        { text: "What is the additive inverse of -15?", options: JSON.stringify(["-15", "1/15", "15", "0"]), correctAnswer: 2 },
        { text: "Between any two rational numbers, how many rational numbers exist?", options: JSON.stringify(["Exactly one", "Exactly ten", "None", "Infinitely many"]), correctAnswer: 3 },
        { text: "Which of the following numbers is prime?", options: JSON.stringify(["1", "2", "4", "9"]), correctAnswer: 1 },
        { text: "Express 0.75 as a simplified fraction.", options: JSON.stringify(["3/4", "7/5", "1/2", "3/5"]), correctAnswer: 0 },
        { text: "What is the value of 5 to the power of 3?", options: JSON.stringify(["15", "25", "125", "75"]), correctAnswer: 2 }
      ];
    } else if (t.includes('equation') || t.includes('algebra')) {
      pool = [
        { text: "Solve for x: 3x + 5 = 20", options: JSON.stringify(["3", "5", "6", "15"]), correctAnswer: 1 },
        { text: "Solve for y: 2(y - 3) = 14", options: JSON.stringify(["5", "7", "10", "8"]), correctAnswer: 2 },
        { text: "Identify the coefficient of xy in the expression 5xy - 3x.", options: JSON.stringify(["5", "-3", "1", "xy"]), correctAnswer: 0 },
        { text: "What is the degree of the polynomial 4x^3 + 2x^2 - 7?", options: JSON.stringify(["1", "2", "3", "0"]), correctAnswer: 2 },
        { text: "Factorise completely: x^2 - 9", options: JSON.stringify(["(x-3)(x-3)", "(x+3)(x-3)", "(x+9)(x-1)", "(x-9)(x+1)"]), correctAnswer: 1 },
        { text: "If 4x - 7 = 5, what is the value of x?", options: JSON.stringify(["1", "2", "3", "4"]), correctAnswer: 2 },
        { text: "What are the roots of the quadratic equation x^2 - 5x + 6 = 0?", options: JSON.stringify(["2 and 3", "-2 and -3", "1 and 6", "-1 and -6"]), correctAnswer: 0 }
      ];
    } else if (t.includes('geometry') || t.includes('shape') || t.includes('polygon') || t.includes('quadrilateral')) {
      pool = [
        { text: "What is the sum of all interior angles of a quadrilateral?", options: JSON.stringify(["180°", "360°", "540°", "720°"]), correctAnswer: 1 },
        { text: "How many diagonals does a regular pentagon have?", options: JSON.stringify(["5", "4", "6", "10"]), correctAnswer: 0 },
        { text: "Which quadrilateral has all sides equal but angles not necessarily 90°?", options: JSON.stringify(["Rectangle", "Rhombus", "Trapezium", "Parallelogram"]), correctAnswer: 1 },
        { text: "What is the angle sum of an n-sided regular polygon?", options: JSON.stringify(["(n-2) * 180°", "(n-1) * 180°", "n * 180°", "(n-2) * 90°"]), correctAnswer: 0 },
        { text: "In a right-angled triangle, the square of the hypotenuse is equal to the:", options: JSON.stringify(["Sum of the other two sides", "Product of the other two sides", "Difference of the squares of the other sides", "Sum of the squares of the other two sides"]), correctAnswer: 3 },
        { text: "How many lines of symmetry does a regular hexagon have?", options: JSON.stringify(["3", "4", "6", "8"]), correctAnswer: 2 },
        { text: "What is the length of the longest chord of a circle of radius 7 cm?", options: JSON.stringify(["7 cm", "14 cm", "21 cm", "28 cm"]), correctAnswer: 1 }
      ];
    } else if (t.includes('mensuration') || t.includes('area') || t.includes('volume')) {
      pool = [
        { text: "What is the formula for the surface area of a cube of side 'a'?", options: JSON.stringify(["4a^2", "6a^2", "a^3", "12a"]), correctAnswer: 1 },
        { text: "Find the volume of a cylinder with radius 7 cm and height 10 cm. (use pi = 22/7)", options: JSON.stringify(["154 cm^3", "770 cm^3", "1540 cm^3", "3080 cm^3"]), correctAnswer: 2 },
        { text: "What is the area of a trapezium whose parallel sides are 8 cm and 12 cm, and height is 5 cm?", options: JSON.stringify(["50 cm^2", "100 cm^2", "48 cm^2", "20 cm^2"]), correctAnswer: 0 },
        { text: "How many faces does a rectangular cuboid have?", options: JSON.stringify(["4", "6", "8", "12"]), correctAnswer: 1 },
        { text: "What is the volume of a sphere of radius r?", options: JSON.stringify(["(4/3) * pi * r^3", "4 * pi * r^2", "2 * pi * r", "(1/3) * pi * r^2 * h"]), correctAnswer: 0 }
      ];
    } else if (t.includes('trigonometry')) {
      pool = [
        { text: "What is the value of sin(30°)?", options: JSON.stringify(["0", "1/2", "1/sqrt(2)", "1"]), correctAnswer: 1 },
        { text: "If tan(A) = 1, what is angle A?", options: JSON.stringify(["30°", "45°", "60°", "90°"]), correctAnswer: 1 },
        { text: "Which trigonometric identity is correct?", options: JSON.stringify(["sin^2 A - cos^2 A = 1", "sin^2 A + cos^2 A = 1", "1 + sin^2 A = cos^2 A", "tan^2 A + 1 = cosec^2 A"]), correctAnswer: 1 },
        { text: "What is the value of cos(90°)?", options: JSON.stringify(["1", "0", "-1", "Undefined"]), correctAnswer: 1 },
        { text: "If the height of a pole and its shadow length are equal, what is the angle of elevation of the sun?", options: JSON.stringify(["30°", "45°", "60°", "90°"]), correctAnswer: 1 }
      ];
    } else {
      pool = [
        { text: "What is the value of (-2) * (-2) * (-2)?", options: JSON.stringify(["8", "-8", "6", "-6"]), correctAnswer: 1 },
        { text: "If x = 2 and y = 3, evaluate 3x + 2y.", options: JSON.stringify(["12", "13", "11", "10"]), correctAnswer: 0 },
        { text: "Find the mean of the numbers: 4, 8, 12, 16.", options: JSON.stringify(["8", "10", "12", "14"]), correctAnswer: 1 },
        { text: "What is the perimeter of a rectangle with length 10 cm and width 5 cm?", options: JSON.stringify(["15 cm", "30 cm", "50 cm", "25 cm"]), correctAnswer: 1 },
        { text: "Which number is a factor of 36?", options: JSON.stringify(["5", "7", "8", "9"]), correctAnswer: 3 }
      ];
    }
  } else if (normalizedSubject.includes('science') || normalizedSubject.includes('physics') || normalizedSubject.includes('chemistry')) {
    if (t.includes('food') || t.includes('nutrition') || t.includes('life')) {
      pool = [
        { text: "Which nutrient is the primary source of energy for our body?", options: JSON.stringify(["Proteins", "Carbohydrates", "Vitamins", "Minerals"]), correctAnswer: 1 },
        { text: "Scurvy is caused by the deficiency of which vitamin?", options: JSON.stringify(["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"]), correctAnswer: 2 },
        { text: "What is the green pigment in plant leaves called?", options: JSON.stringify(["Chlorophyll", "Carotene", "Xanthophyll", "Stomata"]), correctAnswer: 0 },
        { text: "Which organelle is known as the powerhouse of the cell?", options: JSON.stringify(["Nucleus", "Ribosome", "Mitochondria", "Golgi body"]), correctAnswer: 2 },
        { text: "What is the process of water movement through a plant and its evaporation from leaves?", options: JSON.stringify(["Photosynthesis", "Respiration", "Transpiration", "Absorption"]), correctAnswer: 2 },
        { text: "How many chambers does the human heart have?", options: JSON.stringify(["2", "3", "4", "5"]), correctAnswer: 2 },
        { text: "Which chemical is used to test the presence of starch in food?", options: JSON.stringify(["Copper sulphate", "Iodine solution", "Caustic soda", "Nitric acid"]), correctAnswer: 1 }
      ];
    } else if (t.includes('force') || t.includes('pressure') || t.includes('motion') || t.includes('electricity') || t.includes('light') || t.includes('sound')) {
      pool = [
        { text: "What is the SI unit of force?", options: JSON.stringify(["Joule", "Pascal", "Newton", "Watt"]), correctAnswer: 2 },
        { text: "What type of friction is the smallest in magnitude?", options: JSON.stringify(["Static friction", "Sliding friction", "Rolling friction", "Fluid friction"]), correctAnswer: 2 },
        { text: "Which law states that pressure applied to an enclosed fluid is transmitted undiminished?", options: JSON.stringify(["Pascal's Law", "Newton's Law", "Boyle's Law", "Archimedes' Principle"]), correctAnswer: 0 },
        { text: "The angle of reflection is always ________ the angle of incidence.", options: JSON.stringify(["Greater than", "Less than", "Equal to", "Double of"]), correctAnswer: 2 },
        { text: "Sound cannot travel through which of the following?", options: JSON.stringify(["Solids", "Liquids", "Gases", "Vacuum"]), correctAnswer: 3 },
        { text: "What is the resistance of an electric circuit with a 12V battery and 3A of current? (V = IR)", options: JSON.stringify(["4 Ohms", "36 Ohms", "0.25 Ohms", "15 Ohms"]), correctAnswer: 0 },
        { text: "What phenomenon causes a straw in a glass of water to look bent?", options: JSON.stringify(["Reflection", "Refraction", "Dispersion", "Scattering"]), correctAnswer: 1 }
      ];
    } else if (t.includes('change') || t.includes('acid') || t.includes('base') || t.includes('chemical') || t.includes('reaction') || t.includes('matter')) {
      pool = [
        { text: "Which of the following is a chemical change?", options: JSON.stringify(["Melting of ice", "Cutting wood", "Rusting of iron", "Dissolving sugar"]), correctAnswer: 2 },
        { text: "What is the pH value of a neutral solution?", options: JSON.stringify(["0", "7", "14", "1"]), correctAnswer: 1 },
        { text: "Which gas is evolved when an acid reacts with a metal?", options: JSON.stringify(["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"]), correctAnswer: 2 },
        { text: "What is the process of electroplating based on?", options: JSON.stringify(["Heating effect of current", "Magnetic effect of current", "Chemical effect of current", "Physical effect of current"]), correctAnswer: 2 },
        { text: "Which state of matter has a definite volume but no definite shape?", options: JSON.stringify(["Solid", "Liquid", "Gas", "Plasma"]), correctAnswer: 1 },
        { text: "What is the common name of Sodium Hydrogen Carbonate?", options: JSON.stringify(["Baking soda", "Washing soda", "Bleaching powder", "Common salt"]), correctAnswer: 0 },
        { text: "Galvanization is the coating of which metal onto iron?", options: JSON.stringify(["Copper", "Zinc", "Tin", "Gold"]), correctAnswer: 1 }
      ];
    } else {
      pool = [
        { text: "What is the basic structural unit of living organisms?", options: JSON.stringify(["Tissue", "Organ", "Cell", "System"]), correctAnswer: 2 },
        { text: "Which planet is known as the Red Planet?", options: JSON.stringify(["Venus", "Mars", "Jupiter", "Saturn"]), correctAnswer: 1 },
        { text: "What is the chemical formula of water?", options: JSON.stringify(["CO2", "H2O", "NaCl", "O2"]), correctAnswer: 1 },
        { text: "Which instrument is used to measure temperature?", options: JSON.stringify(["Barometer", "Thermometer", "Speedometer", "Ammeter"]), correctAnswer: 1 },
        { text: "What resource is conventional and non-renewable?", options: JSON.stringify(["Solar energy", "Coal", "Wind power", "Hydroelectricity"]), correctAnswer: 1 }
      ];
    }
  } else if (normalizedSubject.includes('english')) {
    if (t.includes('grammar') || t.includes('voice') || t.includes('speech')) {
      pool = [
        { text: "Identify the passive voice of: 'She wrote a letter.'", options: JSON.stringify(["A letter is written by her.", "A letter was written by her.", "A letter was writing by her.", "A letter she had written."]), correctAnswer: 1 },
        { text: "Which modal verb represents a strong obligation?", options: JSON.stringify(["may", "might", "must", "can"]), correctAnswer: 2 },
        { text: "Identify the correct indirect speech of: He said, 'I am reading.'", options: JSON.stringify(["He said that he was reading.", "He said that I am reading.", "He said that he is reading.", "He said he read."]), correctAnswer: 0 },
        { text: "Which of the following is a conjunction?", options: JSON.stringify(["but", "slowly", "through", "under"]), correctAnswer: 0 },
        { text: "Choose the sentence with correct subject-verb agreement.", options: JSON.stringify(["The cats sleeps on the rug.", "The cat sleep on the rug.", "The cats sleep on the rug.", "The cat are sleeping on the rug."]), correctAnswer: 2 },
        { text: "What is the past participle of the verb 'sing'?", options: JSON.stringify(["singed", "sang", "sung", "song"]), correctAnswer: 2 },
        { text: "Which part of speech describes a verb, adjective, or another adverb?", options: JSON.stringify(["Noun", "Pronoun", "Preposition", "Adverb"]), correctAnswer: 3 }
      ];
    } else {
      pool = [
        { text: "What is the synonym of the word 'diligent'?", options: JSON.stringify(["Lazy", "Hardworking", "Careless", "Fast"]), correctAnswer: 1 },
        { text: "Choose the antonym of the word 'ancient'.", options: JSON.stringify(["Old", "Historic", "Modern", "Classic"]), correctAnswer: 2 },
        { text: "What is the main theme of the poem 'The Road Not Taken'?", options: JSON.stringify(["Making decisions in life", "Walking in the woods", "Loving nature", "Traveling around the world"]), correctAnswer: 0 },
        { text: "Complete the idiom: 'A blessing in _________.'", options: JSON.stringify(["disguise", "secret", "reality", "trouble"]), correctAnswer: 0 },
        { text: "Who wrote the poem 'The Ant and the Cricket'?", options: JSON.stringify(["Robert Frost", "William Wordsworth", "Aesop (adapted)", "John Keats"]), correctAnswer: 2 }
      ];
    }
  } else if (normalizedSubject.includes('history')) {
    pool = [
      { text: "Which famous emperor ruled the Mauryan Empire and spread Buddhism?", options: JSON.stringify(["Chandragupta", "Samudragupta", "Ashoka", "Harsha"]), correctAnswer: 2 },
      { text: "Who was the first emperor of the Mughal Dynasty in India?", options: JSON.stringify(["Akbar", "Babur", "Humayun", "Sher Shah"]), correctAnswer: 1 },
      { text: "In which year did the French Revolution begin?", options: JSON.stringify(["1776", "1789", "1815", "1917"]), correctAnswer: 1 },
      { text: "Who is known as the Father of the Indian Constitution?", options: JSON.stringify(["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"]), correctAnswer: 1 },
      { text: "What was the main cause of the Industrial Revolution in Britain?", options: JSON.stringify(["Invention of steam engines and textile machinery", "Discovery of gold mines", "Expansion of agriculture only", "Rise of royal family"]), correctAnswer: 0 },
      { text: "Which leader is associated with the Salt March (Dandi March)?", options: JSON.stringify(["Bhagat Singh", "Subhas Chandra Bose", "Mahatma Gandhi", "Lal Bahadur Shastri"]), correctAnswer: 2 },
      { text: "What was Harappa and Mohenjo-daro famous for?", options: JSON.stringify(["Cave paintings", "Large temples", "Town planning and drainage systems", "Iron factories"]), correctAnswer: 2 }
    ];
  } else if (normalizedSubject.includes('geography')) {
    pool = [
      { text: "What lines run horizontally around the Earth to measure distance north or south of the equator?", options: JSON.stringify(["Longitudes", "Latitudes", "Grid lines", "Altitudes"]), correctAnswer: 1 },
      { text: "What is the innermost layer of the Earth?", options: JSON.stringify(["Crust", "Mantle", "Core", "Lithosphere"]), correctAnswer: 2 },
      { text: "Which of the following is a non-conventional, renewable energy source?", options: JSON.stringify(["Coal", "Petroleum", "Solar energy", "Natural gas"]), correctAnswer: 2 },
      { text: "The Himalayan mountains are categorized as which type of mountains?", options: JSON.stringify(["Block mountains", "Fold mountains", "Volcanic mountains", "Residual mountains"]), correctAnswer: 1 },
      { text: "What is the main cause of the change in seasons on Earth?", options: JSON.stringify(["Rotation of Earth on its axis", "Tilt of the Earth's axis and its revolution", "Distance from the Moon", "Changes in ocean currents"]), correctAnswer: 1 },
      { text: "Which Indian river forms the largest delta in the world along with the Brahmaputra?", options: JSON.stringify(["Ganga", "Narmada", "Godavari", "Krishna"]), correctAnswer: 0 },
      { text: "Which forest type is also known as Monsoon Forest?", options: JSON.stringify(["Tropical Evergreen", "Tropical Deciduous", "Coniferous", "Mangrove"]), correctAnswer: 1 }
    ];
  } else if (normalizedSubject.includes('computer')) {
    pool = [
      { text: "What is the main operating system component that manages CPU, memory, and hardware resources?", options: JSON.stringify(["Compiler", "Kernel", "Word processor", "Spreadsheet"]), correctAnswer: 1 },
      { text: "Which HTML tag is used to create a hyperlink?", options: JSON.stringify(["<link>", "<a>", "<href>", "<url>"]), correctAnswer: 1 },
      { text: "In Python, which keyword is used to define a function?", options: JSON.stringify(["func", "define", "def", "function"]), correctAnswer: 2 },
      { text: "What is a unique key used to uniquely identify a record in a database table?", options: JSON.stringify(["Foreign key", "Candidate key", "Primary key", "Composite key"]), correctAnswer: 2 },
      { text: "Which of the following is a common security attack where users are tricked into giving sensitive details via fake emails?", options: JSON.stringify(["Phishing", "Spam", "Trojan horse", "DDoS"]), correctAnswer: 0 },
      { text: "Which data structure in Python is mutable and ordered?", options: JSON.stringify(["Tuple", "List", "Dictionary", "Set"]), correctAnswer: 1 },
      { text: "What protocol is used to securely fetch web pages?", options: JSON.stringify(["HTTP", "FTP", "HTTPS", "SMTP"]), correctAnswer: 2 }
    ];
  } else {
    // General fallback
    pool = [
      { text: "Which of the following is a prime number?", options: JSON.stringify(["12", "17", "21", "27"]), correctAnswer: 1 },
      { text: "What is the chemical symbol for Helium?", options: JSON.stringify(["H", "He", "Hl", "Hm"]), correctAnswer: 1 },
      { text: "Who wrote 'Romeo and Juliet'?", options: JSON.stringify(["Charles Dickens", "Leo Tolstoy", "William Shakespeare", "Mark Twain"]), correctAnswer: 2 },
      { text: "What is the capital of France?", options: JSON.stringify(["London", "Berlin", "Paris", "Rome"]), correctAnswer: 2 },
      { text: "How many continents are there on Earth?", options: JSON.stringify(["5", "6", "7", "8"]), correctAnswer: 2 }
    ];
  }

  // Shuffle the pool deterministically based on hash, and pick 5 questions
  const selected: Question[] = [];
  const indices = Array.from({ length: pool.length }, (_, i) => i);
  
  // Simple deterministic shuffle using LCG
  let seed = hash || 999;
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  // Take the first 5
  for (let idx = 0; idx < Math.min(5, pool.length); idx++) {
    const originalQuestion = pool[indices[idx]];
    selected.push({
      id: `${quizId}-q-${idx + 1}`,
      text: originalQuestion.text,
      options: originalQuestion.options,
      correctAnswer: originalQuestion.correctAnswer
    });
  }

  return selected;
}
