export interface LabAsset {
  id: string;
  title: string;
  subject: string;
  standard: string;
  color: string;
  prompt: string;
  description: string;
  svgPath: string; // kept for backward compat — can be empty if icon is used
  icon?: string;   // lucide icon name
}

// Subject colors — must match syllabus API
export const subjectColors: Record<string, string> = {
  Mathematics: '#0ea5e9',
  Science: '#00d4aa',
  English: '#a78bfa',
  History: '#f59e0b',
  Geography: '#f97066',
  'Computer Science': '#38bdf8',
};

// Curriculum data — same source as syllabus API
export const curriculumData: Record<string, Record<number, { title: string; topics: { title: string; icon: string; prompt?: string }[] }[]>> = {
  Mathematics: {
    6: [
      { title: 'Numbers & Operations', topics: [
        { title: 'Whole Numbers', icon: 'hash', prompt: 'Explain whole numbers — natural numbers, place values, and basic operations with large numbers.' },
        { title: 'Playing with Numbers', icon: 'dices', prompt: 'Teach me about factors, multiples, divisibility rules, HCF and LCM.' },
        { title: 'Negative Numbers & Integers', icon: 'minus-circle', prompt: 'Explain integers — positive, negative numbers, number line, and operations on integers.' },
        { title: 'HCF & LCM', icon: 'split', prompt: 'Explain Highest Common Factor and Lowest Common Multiple — methods and word problems.' },
        { title: 'Roman Numerals', icon: 'list-ordered', prompt: 'Teach me Roman numeral system — I, V, X, L, C, D, M — reading and writing.' },
      ]},
      { title: 'Fractions & Decimals', topics: [
        { title: 'Fractions', icon: 'divide', prompt: 'Explain fractions — types, comparing, adding, subtracting, and simplifying fractions.' },
        { title: 'Decimals', icon: 'percent', prompt: 'Teach me decimals — place values, conversion to fractions, and decimal operations.' },
        { title: 'Comparing Fractions', icon: 'scale', prompt: 'Teach me how to compare and order fractions using LCM and cross-multiplication.' },
        { title: 'Fraction Arithmetic', icon: 'calculator', prompt: 'Explain addition, subtraction, multiplication, and division of fractions with examples.' },
      ]},
      { title: 'Geometry & Shapes', topics: [
        { title: 'Basic Geometrical Ideas', icon: 'triangle', prompt: 'Teach me about points, lines, rays, line segments, angles, and polygons.' },
        { title: 'Symmetry', icon: 'flip-horizontal', prompt: 'Explain symmetry — line of symmetry, reflection, and rotational symmetry.' },
        { title: 'Practical Geometry', icon: 'ruler', prompt: 'Teach geometric constructions — drawing shapes with compass and ruler.' },
        { title: 'Understanding Shapes', icon: 'hexagon', prompt: 'Explain 2D shapes — triangles, quadrilaterals, circles — properties and classifications.' },
        { title: 'Angles & Types', icon: 'crosshair', prompt: 'Explain types of angles — acute, obtuse, right, reflex — and angle measurement.' },
      ]},
      { title: 'Ratio & Algebra Basics', topics: [
        { title: 'Ratio & Proportion', icon: 'bar-chart-3', prompt: 'Teach me ratios — simplification, equivalent ratios, and proportion.' },
        { title: 'Introduction to Algebra', icon: 'variable', prompt: 'Explain what algebra is — variables, constants, expressions, and simple substitution.' },
        { title: 'Perimeter & Area', icon: 'square', prompt: 'Teach me perimeter and area of rectangles, squares, and triangles.' },
      ]},
    ],
    7: [
      { title: 'Algebra & Equations', topics: [
        { title: 'Algebraic Expressions', icon: 'variable', prompt: 'Explain algebraic expressions — variables, constants, coefficients, and simplification.' },
        { title: 'Simple Equations', icon: 'equal', prompt: 'Teach me how to solve simple linear equations step by step.' },
        { title: 'Exponents & Powers', icon: 'superscript', prompt: 'Explain exponents — laws of exponents, powers, and scientific notation.' },
        { title: 'Forming & Solving Equations', icon: 'function-square', prompt: 'Teach me to form equations from word problems and solve them systematically.' },
      ]},
      { title: 'Ratio, Proportion & Percentages', topics: [
        { title: 'Ratios', icon: 'scale', prompt: 'Explain ratios, simplification, and direct/inverse proportion.' },
        { title: 'Comparing Quantities', icon: 'bar-chart-3', prompt: 'Teach me percentages, profit & loss, and simple interest.' },
        { title: 'Simple Interest', icon: 'trending-up', prompt: 'Explain simple interest formula — Principal, Rate, Time — with word problems.' },
        { title: 'Profit & Loss', icon: 'percent', prompt: 'Teach me to calculate profit, loss, and percentage profit/loss in transactions.' },
      ]},
      { title: 'Geometry', topics: [
        { title: 'Lines & Angles', icon: 'ruler', prompt: 'Explain parallel lines, transversals, alternate angles, and corresponding angles.' },
        { title: 'Triangle Properties', icon: 'triangle', prompt: 'Teach me triangle types — equilateral, isosceles, scalene — and angle sum property.' },
        { title: 'Congruence of Triangles', icon: 'flip-horizontal', prompt: 'Explain congruence criteria — SSS, SAS, ASA — with diagrams and proofs.' },
      ]},
      { title: 'Data & Probability', topics: [
        { title: 'Mean, Median & Mode', icon: 'pie-chart', prompt: 'Explain measures of central tendency — mean, median, mode, and range.' },
        { title: 'Probability Intro', icon: 'dices', prompt: 'Teach me basic probability — experiments, outcomes, and calculating probability.' },
        { title: 'Bar Graphs & Pictographs', icon: 'bar-chart-3', prompt: 'Explain how to read, draw, and interpret bar graphs and pictographs.' },
      ]},
      { title: 'Mensuration', topics: [
        { title: 'Area of Triangles & Parallelograms', icon: 'triangle', prompt: 'Teach me to calculate areas of triangles, parallelograms, and composite shapes.' },
        { title: 'Perimeter of Shapes', icon: 'square', prompt: 'Explain perimeter of squares, rectangles, and irregular polygons.' },
      ]},
    ],
    8: [
      { title: 'Linear Equations', topics: [
        { title: 'Linear Equations in One Variable', icon: 'trending-up', prompt: 'Explain how to solve linear equations in one variable step by step.' },
        { title: 'Graphing Linear Equations', icon: 'line-chart', prompt: 'Teach me to plot and graph linear equations on a coordinate plane.' },
        { title: 'Word Problems — Equations', icon: 'calculator', prompt: 'Teach me to translate word problems into linear equations and solve them.' },
      ]},
      { title: 'Quadrilaterals & Polygons', topics: [
        { title: 'Understanding Quadrilaterals', icon: 'square', prompt: 'Explain types of quadrilaterals — parallelograms, rectangles, rhombus, trapezium.' },
        { title: 'Polygons & Angle Sums', icon: 'hexagon', prompt: 'Teach the angle sum property of polygons and exterior angles.' },
        { title: 'Properties of Parallelogram', icon: 'split', prompt: 'Explain diagonals, opposite sides and angles of a parallelogram.' },
      ]},
      { title: 'Mensuration', topics: [
        { title: 'Surface Area & Volume', icon: 'box', prompt: 'Explain surface area and volume of cubes, cuboids, and cylinders.' },
        { title: 'Area of Trapezium & Polygon', icon: 'pentagon', prompt: 'Teach me how to calculate areas of trapezium and general polygons.' },
        { title: 'Volume of Cylinders & Cones', icon: 'circle', prompt: 'Explain formulas for volume and surface area of cylinders and cones.' },
      ]},
      { title: 'Algebra II', topics: [
        { title: 'Factorisation', icon: 'split', prompt: 'Explain factorisation of algebraic expressions using common factors and identities.' },
        { title: 'Algebraic Identities', icon: 'braces', prompt: 'Teach me standard algebraic identities and how to apply them.' },
        { title: 'Division of Algebraic Expressions', icon: 'divide', prompt: 'Teach me to divide polynomials and simplify algebraic fractions.' },
        { title: 'Rational Numbers', icon: 'percent', prompt: 'Explain rational numbers — representation, ordering, and operations on number line.' },
      ]},
      { title: 'Data & Statistics', topics: [
        { title: 'Pie Charts & Bar Graphs', icon: 'pie-chart', prompt: 'Teach me to draw and interpret pie charts and bar graphs from data.' },
        { title: 'Probability', icon: 'dices', prompt: 'Explain chance and probability — events, sample space, and calculations.' },
      ]},
      { title: 'Number Theory', topics: [
        { title: 'Cubes & Cube Roots', icon: 'box', prompt: 'Explain perfect cubes, cube roots, and methods to find them.' },
        { title: 'Squares & Square Roots', icon: 'sigma', prompt: 'Teach me perfect squares, square roots, and the long division method.' },
        { title: 'Exponents & Powers', icon: 'superscript', prompt: 'Explain integer exponents, laws of exponents, and scientific notation.' },
      ]},
    ],
    9: [
      { title: 'Number Systems', topics: [
        { title: 'Real Numbers', icon: 'infinity', prompt: 'Explain real numbers — rational, irrational, and their properties.' },
        { title: 'Irrational Numbers', icon: 'sigma', prompt: 'Teach me about irrational numbers, surds, and rationalising denominators.' },
        { title: 'Representing Reals on Number Line', icon: 'ruler', prompt: 'Explain how to represent real numbers including surds on the number line.' },
        { title: 'Laws of Exponents for Reals', icon: 'superscript', prompt: 'Teach me exponent rules applied to real numbers, including fractional exponents.' },
      ]},
      { title: 'Polynomials', topics: [
        { title: 'Polynomials & Zeroes', icon: 'function-square', prompt: 'Explain polynomials — degree, zeroes, and remainder theorem.' },
        { title: 'Remainder Theorem', icon: 'calculator', prompt: 'Teach me the remainder theorem and factor theorem with examples.' },
        { title: 'Factorising Polynomials', icon: 'split', prompt: 'Teach me to factorise polynomials using splitting the middle term and identities.' },
        { title: 'Algebraic Identities', icon: 'braces', prompt: 'Explain advanced algebraic identities — (a+b)³, a³+b³, and their applications.' },
      ]},
      { title: 'Coordinate Geometry', topics: [
        { title: 'Cartesian Plane', icon: 'crosshair', prompt: 'Explain the Cartesian coordinate system — axes, quadrants, and plotting.' },
        { title: 'Plotting Points', icon: 'circle', prompt: 'Teach me to plot ordered pairs and read coordinates from graphs.' },
        { title: 'Distance Between Points', icon: 'ruler', prompt: 'Explain the distance formula between two points on a Cartesian plane.' },
      ]},
      { title: 'Geometry & Proofs', topics: [
        { title: 'Lines & Angles', icon: 'triangle', prompt: 'Teach me angle pairs — complementary, supplementary, vertically opposite, and transversal angles.' },
        { title: 'Triangles & Congruence', icon: 'triangle', prompt: 'Explain triangle congruence — SSS, SAS, ASA, RHS criteria and proofs.' },
        { title: 'Circle Theorems', icon: 'circle', prompt: 'Teach me circle theorems — tangent, chord, and arc properties.' },
        { title: 'Quadrilaterals', icon: 'square', prompt: 'Explain properties of parallelograms, rectangles, squares, and the mid-point theorem.' },
        { title: 'Heron\'s Formula', icon: 'calculator', prompt: 'Teach me Heron\'s formula to find area of a triangle given three sides.' },
      ]},
      { title: 'Statistics & Probability', topics: [
        { title: 'Statistics — Frequency', icon: 'bar-chart-3', prompt: 'Explain frequency distribution tables, histograms, and frequency polygons.' },
        { title: 'Mean of Grouped Data', icon: 'pie-chart', prompt: 'Teach me to calculate mean from grouped data using direct and assumed mean methods.' },
        { title: 'Probability Basics', icon: 'dices', prompt: 'Explain probability of simple events, sample space, and coin/dice problems.' },
      ]},
      { title: 'Surface Areas & Volumes', topics: [
        { title: 'Surface Area of Solids', icon: 'box', prompt: 'Teach me surface areas of cuboids, cylinders, cones, and spheres.' },
        { title: 'Volume of Solids', icon: 'pentagon', prompt: 'Explain volumes of cuboids, cylinders, cones, and spheres with formulas.' },
      ]},
    ],
    10: [
      { title: 'Number Theory', topics: [
        { title: 'Real Numbers & Euclid\'s Algorithm', icon: 'infinity', prompt: 'Explain Euclid\'s division lemma and algorithm for finding HCF.' },
        { title: 'Fundamental Theorem of Arithmetic', icon: 'sigma', prompt: 'Teach me unique prime factorisation, HCF, LCM, and irrationality proofs.' },
      ]},
      { title: 'Algebra III', topics: [
        { title: 'Quadratic Equations', icon: 'function-square', prompt: 'Explain quadratic equations — factoring, completing the square, and the quadratic formula.' },
        { title: 'Arithmetic Progressions', icon: 'list-ordered', prompt: 'Teach me AP — nth term, sum of n terms, and word problems.' },
        { title: 'Pair of Linear Equations', icon: 'equal', prompt: 'Teach me systems of linear equations — graphical, substitution, elimination, and cross-multiplication methods.' },
        { title: 'Nature of Roots', icon: 'calculator', prompt: 'Explain the discriminant — how to determine the nature of roots of a quadratic equation.' },
      ]},
      { title: 'Trigonometry', topics: [
        { title: 'Trigonometric Ratios', icon: 'triangle', prompt: 'Explain sin, cos, tan and their use in right-angled triangles.' },
        { title: 'Heights & Distances', icon: 'mountain', prompt: 'Teach me to solve heights and distances problems using trigonometry.' },
        { title: 'Trigonometric Identities', icon: 'braces', prompt: 'Explain sin²θ + cos²θ = 1 and other fundamental identities with proofs.' },
        { title: 'Complementary Angles', icon: 'flip-horizontal', prompt: 'Teach me trigonometric ratios of complementary angles and their applications.' },
      ]},
      { title: 'Geometry', topics: [
        { title: 'Similar Triangles', icon: 'triangle', prompt: 'Explain similarity criteria — AA, SSS, SAS — and the Basic Proportionality Theorem.' },
        { title: 'Circles & Tangents', icon: 'circle', prompt: 'Teach me tangents to a circle — length of tangent, angle in alternate segment.' },
        { title: 'Constructions', icon: 'ruler', prompt: 'Explain geometric constructions — dividing a line segment, tangents to circles.' },
      ]},
      { title: 'Statistics & Probability', topics: [
        { title: 'Statistics — Mean, Median, Mode', icon: 'bar-chart-3', prompt: 'Explain grouped data — mean, median, mode, and ogive.' },
        { title: 'Probability', icon: 'dices', prompt: 'Teach probability of events, complementary events, and problems.' },
        { title: 'Cumulative Frequency', icon: 'trending-up', prompt: 'Teach me to draw ogive curves and find median from cumulative frequency.' },
      ]},
      { title: 'Mensuration', topics: [
        { title: 'Areas of Circles & Sectors', icon: 'pie-chart', prompt: 'Explain area of circle, sector, segment, and combinations with other shapes.' },
        { title: 'Surface Areas of Combined Solids', icon: 'box', prompt: 'Teach me surface area and volume of combined solids — cone on cylinder, etc.' },
        { title: 'Distance & Section Formula', icon: 'crosshair', prompt: 'Explain distance formula, section formula, and midpoint in coordinate geometry.' },
        { title: 'Area of Triangle (Coordinate)', icon: 'triangle', prompt: 'Teach me to find area of a triangle using coordinate geometry formula.' },
      ]},
    ],
  },
  Science: {
    6: [
      { title: 'Food & Nutrition', topics: [
        { title: 'Components of Food', icon: 'apple', prompt: 'Teach me about nutrients — carbohydrates, proteins, fats, vitamins, and minerals.' },
        { title: 'Sources of Food', icon: 'wheat', prompt: 'Explain plant and animal sources of food and food chains.' },
      ]},
      { title: 'Living World', topics: [
        { title: 'Living & Non-Living Things', icon: 'leaf', prompt: 'Explain the characteristics of living things — growth, respiration, reproduction.' },
        { title: 'The Plant Kingdom', icon: 'flower-2', prompt: 'Teach me about parts of a plant, photosynthesis, and plant classification.' },
        { title: 'Body Movements', icon: 'activity', prompt: 'Explain the skeletal system, joints, and how our body moves.' },
      ]},
      { title: 'Materials & Things', topics: [
        { title: 'Sorting Materials', icon: 'layers', prompt: 'Teach me to classify materials by appearance, hardness, solubility, and transparency.' },
        { title: 'Separation of Substances', icon: 'filter', prompt: 'Explain filtration, evaporation, sedimentation, and other separation methods.' },
      ]},
    ],
    7: [
      { title: 'Physical & Chemical Changes', topics: [
        { title: 'Physical vs Chemical Changes', icon: 'flask-conical', prompt: 'Explain the difference between physical and chemical changes with examples.' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes', prompt: 'Teach me about acids, bases, indicators, pH scale, and neutralization.' },
      ]},
      { title: 'Heat & Temperature', topics: [
        { title: 'Heat Transfer', icon: 'thermometer', prompt: 'Explain conduction, convection, radiation, and insulators.' },
        { title: 'Temperature Measurement', icon: 'gauge', prompt: 'Teach me temperature scales — Celsius, Fahrenheit, and Kelvin.' },
      ]},
      { title: 'Life Processes', topics: [
        { title: 'Nutrition in Plants', icon: 'sprout', prompt: 'Explain photosynthesis, autotrophic nutrition, and parasitic plants.' },
        { title: 'Respiration in Organisms', icon: 'wind', prompt: 'Teach me aerobic and anaerobic respiration and breathing mechanisms.' },
        { title: 'Transportation in Animals', icon: 'heart-pulse', prompt: 'Explain the circulatory system — heart, blood, arteries, and veins.' },
      ]},
    ],
    8: [
      { title: 'Force & Pressure', topics: [
        { title: 'Force & Friction', icon: 'move', prompt: 'Explain force, friction, types of friction, and how to reduce friction.' },
        { title: 'Pressure in Fluids', icon: 'droplets', prompt: 'Teach me about atmospheric pressure, liquid pressure, and Pascal\'s law.' },
      ]},
      { title: 'Light & Sound', topics: [
        { title: 'Reflection of Light', icon: 'sun', prompt: 'Explain laws of reflection, mirrors, and image formation.' },
        { title: 'Human Eye & Vision', icon: 'eye', prompt: 'Teach me how the human eye works, defects of vision, and lenses.' },
        { title: 'Sound & Vibrations', icon: 'audio-lines', prompt: 'Explain sound production, propagation, frequency, and pitch.' },
      ]},
      { title: 'Chemical Effects', topics: [
        { title: 'Chemical Effects of Current', icon: 'zap', prompt: 'Teach me about electrolysis, electroplating, and chemical cells.' },
        { title: 'Combustion & Flame', icon: 'flame', prompt: 'Explain combustion, types of flames, and fire safety.' },
      ]},
      { title: 'Reproduction', topics: [
        { title: 'Cell Structure & Functions', icon: 'microscope', prompt: 'Explain the cell — organelles, plant vs animal cells, and cell division.' },
        { title: 'Reproduction in Animals', icon: 'baby', prompt: 'Teach me about reproduction — sexual, asexual, and stages of development.' },
      ]},
    ],
    9: [
      { title: 'Matter & Its Properties', topics: [
        { title: 'Matter in Our Surroundings', icon: 'atom', prompt: 'Explain states of matter, change of state, and particle theory.' },
        { title: 'Is Matter Around Us Pure?', icon: 'beaker', prompt: 'Teach me mixtures, solutions, colloids, suspensions, and separation.' },
      ]},
      { title: 'Motion & Force', topics: [
        { title: 'Motion & Speed', icon: 'gauge', prompt: 'Explain distance, displacement, speed, velocity, and acceleration.' },
        { title: 'Force & Laws of Motion', icon: 'arrow-right-circle', prompt: 'Teach me Newton\'s three laws of motion with examples.' },
        { title: 'Gravitation', icon: 'orbit', prompt: 'Explain gravity, free fall, mass vs weight, and Kepler\'s laws.' },
      ]},
      { title: 'Biology', topics: [
        { title: 'The Fundamental Unit of Life', icon: 'microscope', prompt: 'Explain cell theory, cell organelles, and differences between cells.' },
        { title: 'Tissues', icon: 'grid-3x3', prompt: 'Teach me about plant and animal tissues — types and functions.' },
        { title: 'Diversity in Living Organisms', icon: 'trees', prompt: 'Explain biological classification — kingdoms, phyla, and species.' },
      ]},
    ],
    10: [
      { title: 'Chemical Reactions', topics: [
        { title: 'Chemical Reactions & Equations', icon: 'flask-conical', prompt: 'Explain types of chemical reactions and how to balance equations.' },
        { title: 'Acids, Bases & Salts', icon: 'test-tubes', prompt: 'Teach me pH scale, indicators, neutralization, and salt preparation.' },
        { title: 'Metals & Non-Metals', icon: 'gem', prompt: 'Explain properties, reactivity series, extraction, and corrosion.' },
      ]},
      { title: 'Physics', topics: [
        { title: 'Electricity', icon: 'zap', prompt: 'Teach me electric current, voltage, resistance, Ohm\'s law, and circuits.' },
        { title: 'Magnetic Effects of Current', icon: 'magnet', prompt: 'Explain electromagnets, solenoids, electric motors, and generators.' },
        { title: 'Light — Reflection & Refraction', icon: 'sun', prompt: 'Teach me mirrors, lenses, refraction, and image formation rules.' },
      ]},
      { title: 'Life Processes', topics: [
        { title: 'Life Processes', icon: 'heart-pulse', prompt: 'Explain nutrition, respiration, transportation, and excretion in organisms.' },
        { title: 'Heredity & Evolution', icon: 'dna', prompt: 'Teach me genetics, Mendel\'s laws, DNA, evolution, and speciation.' },
      ]},
    ],
  },
  English: {
    6: [
      { title: 'Grammar Fundamentals', topics: [
        { title: 'Parts of Speech', icon: 'a-large-small', prompt: 'Explain the 8 parts of speech with examples — noun, pronoun, verb, etc.' },
        { title: 'Nouns & Pronouns', icon: 'type', prompt: 'Teach me about types of nouns and pronouns with exercises.' },
        { title: 'Tenses — Present & Past', icon: 'clock', prompt: 'Explain present and past tenses — simple, continuous, and perfect.' },
      ]},
      { title: 'Reading & Comprehension', topics: [
        { title: 'Short Stories', icon: 'book-open', prompt: 'Help me read and understand short stories — character, plot, theme.' },
        { title: 'Poem Appreciation', icon: 'feather', prompt: 'Teach me how to appreciate poetry — rhyme, rhythm, imagery.' },
      ]},
    ],
    7: [
      { title: 'Writing Skills', topics: [
        { title: 'Letter Writing', icon: 'mail', prompt: 'Teach me formal and informal letter writing with format and examples.' },
        { title: 'Essay Writing', icon: 'file-text', prompt: 'Explain essay writing — introduction, body, conclusion, and coherence.' },
        { title: 'Diary Entry', icon: 'notebook-pen', prompt: 'Teach me how to write diary entries — format, tone, and expression.' },
      ]},
      { title: 'Literature', topics: [
        { title: 'Prose — A Gift of Chappals', icon: 'book-open', prompt: 'Help me understand the story, characters, themes, and moral lessons.' },
        { title: 'Poetry — The Shed', icon: 'feather', prompt: 'Explain the poem — meaning, literary devices, and hidden messages.' },
      ]},
    ],
    8: [
      { title: 'Advanced Grammar', topics: [
        { title: 'Active & Passive Voice', icon: 'repeat', prompt: 'Teach me to convert between active and passive voice across tenses.' },
        { title: 'Direct & Indirect Speech', icon: 'message-square', prompt: 'Explain reporting speech — rules for changing tenses and pronouns.' },
        { title: 'Clauses & Phrases', icon: 'braces', prompt: 'Teach me independent/dependent clauses, phrases, and sentence types.' },
      ]},
      { title: 'Literature & Composition', topics: [
        { title: 'Short Story Analysis', icon: 'book-open', prompt: 'Help me analyse short stories — plot structure, characters, and themes.' },
        { title: 'Poem — The Ant and the Cricket', icon: 'feather', prompt: 'Explain the poem — moral, literary devices, and comprehension.' },
        { title: 'Comprehension Passages', icon: 'scan-text', prompt: 'Teach me reading comprehension strategies and answering techniques.' },
      ]},
    ],
    9: [
      { title: 'Grammar & Usage', topics: [
        { title: 'Modals & Determiners', icon: 'settings', prompt: 'Explain modals (can, could, may, might, must) and determiners.' },
        { title: 'Subject-Verb Agreement', icon: 'check-circle', prompt: 'Teach me rules of subject-verb agreement with tricky cases.' },
      ]},
      { title: 'Literature', topics: [
        { title: 'The Fun They Had', icon: 'book-open', prompt: 'Explain the story — themes of technology vs traditional education.' },
        { title: 'The Road Not Taken', icon: 'git-branch', prompt: 'Teach me the poem — metaphor, choices, and Robert Frost\'s style.' },
        { title: 'The Sound of Music', icon: 'music', prompt: 'Help me understand the chapter — perseverance and passion.' },
      ]},
    ],
    10: [
      { title: 'Grammar Mastery', topics: [
        { title: 'Tenses — All Forms', icon: 'clock', prompt: 'Review all 12 tenses with formulas, examples, and exercises.' },
        { title: 'Reported Speech & Clauses', icon: 'message-square', prompt: 'Teach me advanced reported speech and clause transformation.' },
      ]},
      { title: 'Literature', topics: [
        { title: 'A Letter to God', icon: 'mail', prompt: 'Explain the story — faith, irony, and character analysis.' },
        { title: 'Dust of Snow', icon: 'snowflake', prompt: 'Teach me the poem — nature, mood change, and Robert Frost.' },
        { title: 'The Midnight Visitor', icon: 'moon', prompt: 'Help me understand the suspense story — plot, twists, and characters.' },
      ]},
    ],
  },
  History: {
    6: [
      { title: 'Ancient Civilizations', topics: [
        { title: 'Early Humans & Hunter-Gatherers', icon: 'footprints', prompt: 'Teach me about prehistoric humans — tools, fire, cave paintings.' },
        { title: 'Indus Valley Civilization', icon: 'landmark', prompt: 'Explain Harappa and Mohenjo-daro — town planning, trade, and decline.' },
        { title: 'Vedic Period', icon: 'scroll', prompt: 'Teach me about the Vedic age — Vedas, society, and culture.' },
      ]},
      { title: 'Kingdoms & Empires', topics: [
        { title: 'Mahajanapadas', icon: 'castle', prompt: 'Explain the sixteen Mahajanapadas, republics, and monarchies.' },
        { title: 'Ashoka & the Mauryan Empire', icon: 'crown', prompt: 'Teach me about Chandragupta, Ashoka, and the spread of Buddhism.' },
      ]},
    ],
    7: [
      { title: 'Medieval India', topics: [
        { title: 'Delhi Sultanate', icon: 'castle', prompt: 'Explain the Delhi Sultanate — rulers, administration, and architecture.' },
        { title: 'Mughal Empire', icon: 'crown', prompt: 'Teach me about Mughal emperors — Akbar, Shah Jahan, and their legacy.' },
        { title: 'Bhakti & Sufi Movements', icon: 'hand-heart', prompt: 'Explain the Bhakti and Sufi movements — saints, teachings, and impact.' },
      ]},
      { title: 'World Developments', topics: [
        { title: 'Medieval Europe', icon: 'church', prompt: 'Teach me about feudalism, the Crusades, and the Renaissance.' },
        { title: 'Trade Routes & Exploration', icon: 'ship', prompt: 'Explain the Silk Road, spice routes, and Age of Exploration.' },
      ]},
    ],
    8: [
      { title: 'Modern India', topics: [
        { title: 'British Raj & Colonialism', icon: 'flag', prompt: 'Explain the East India Company, colonialism, and its impact on India.' },
        { title: 'Indian National Movement', icon: 'megaphone', prompt: 'Teach me about the freedom struggle — Gandhi, Nehru, and key events.' },
        { title: 'Making of the Constitution', icon: 'scroll-text', prompt: 'Explain how the Indian Constitution was drafted and its key features.' },
      ]},
      { title: 'World History', topics: [
        { title: 'French Revolution', icon: 'swords', prompt: 'Teach me about the French Revolution — causes, events, and impact.' },
        { title: 'Industrial Revolution', icon: 'factory', prompt: 'Explain the Industrial Revolution — inventions, factories, and social change.' },
      ]},
    ],
    9: [
      { title: 'India & the Contemporary World', topics: [
        { title: 'French Revolution', icon: 'swords', prompt: 'Explain the French Revolution in depth — Estates, Reign of Terror, Napoleon.' },
        { title: 'Russian Revolution', icon: 'flag', prompt: 'Teach me about the Russian Revolution — causes, Lenin, and communism.' },
        { title: 'Nazism & Rise of Hitler', icon: 'shield-alert', prompt: 'Explain the rise of Nazism — ideology, propaganda, and World War II.' },
      ]},
      { title: 'Livelihoods & Economy', topics: [
        { title: 'Forest Society & Colonialism', icon: 'trees', prompt: 'Teach me about colonial forest policies and their impact on communities.' },
        { title: 'Pastoralists in the Modern World', icon: 'tractor', prompt: 'Explain pastoral communities, migration patterns, and modern challenges.' },
      ]},
    ],
    10: [
      { title: 'Nationalism', topics: [
        { title: 'Rise of Nationalism in Europe', icon: 'flag', prompt: 'Explain European nationalism — unification of Italy, Germany.' },
        { title: 'Nationalism in India', icon: 'megaphone', prompt: 'Teach me the Indian national movement — Salt March, Quit India.' },
      ]},
      { title: 'Economy & Globalization', topics: [
        { title: 'The Age of Industrialisation', icon: 'factory', prompt: 'Explain industrialization in Britain and India — impact on artisans.' },
        { title: 'Globalisation & the Indian Economy', icon: 'globe', prompt: 'Teach me globalisation — MNCs, trade, WTO, and impact on India.' },
      ]},
    ],
  },
  Geography: {
    6: [
      { title: 'The Earth', topics: [
        { title: 'Planet Earth', icon: 'globe', prompt: 'Teach me about Earth — shape, size, rotation, revolution, and seasons.' },
        { title: 'Globe — Latitudes & Longitudes', icon: 'compass', prompt: 'Explain latitudes, longitudes, time zones, and the grid system.' },
        { title: 'Motions of the Earth', icon: 'rotate-3d', prompt: 'Teach me about rotation, revolution, equinox, and solstice.' },
      ]},
      { title: 'Environment', topics: [
        { title: 'Major Landforms', icon: 'mountain', prompt: 'Explain mountains, plateaus, plains — formation and features.' },
        { title: 'India — Climate & Vegetation', icon: 'cloud-sun', prompt: 'Teach me about India\'s climate zones, monsoon, and vegetation types.' },
      ]},
    ],
    7: [
      { title: 'Our Environment', topics: [
        { title: 'Inside Our Earth', icon: 'layers', prompt: 'Explain Earth\'s layers — crust, mantle, core, and rock types.' },
        { title: 'Our Changing Earth', icon: 'mountain-snow', prompt: 'Teach me about earthquakes, volcanoes, erosion, and weathering.' },
        { title: 'Air & Atmosphere', icon: 'wind', prompt: 'Explain the atmosphere — layers, composition, weather, and climate.' },
      ]},
      { title: 'Human-Environment', topics: [
        { title: 'Life in Deserts', icon: 'sun', prompt: 'Teach me about hot and cold deserts — climate, plants, animals, people.' },
        { title: 'Life in Tropical Regions', icon: 'palm-tree', prompt: 'Explain tropical rainforests — biodiversity, climate, and indigenous people.' },
      ]},
    ],
    8: [
      { title: 'Resources & Development', topics: [
        { title: 'Land, Soil & Water Resources', icon: 'droplets', prompt: 'Explain land use, soil types, conservation, and water resources.' },
        { title: 'Mineral & Power Resources', icon: 'gem', prompt: 'Teach me about minerals, ores, conventional and non-conventional energy.' },
        { title: 'Agriculture', icon: 'wheat', prompt: 'Explain types of farming, crops, and agricultural practices in India.' },
      ]},
      { title: 'India & the World', topics: [
        { title: 'Industries', icon: 'factory', prompt: 'Teach me about major industries — iron & steel, textiles, IT sector.' },
        { title: 'Human Resources', icon: 'users', prompt: 'Explain population, demography, literacy, and human development.' },
      ]},
    ],
    9: [
      { title: 'Physical Features of India', topics: [
        { title: 'The Himalayan Mountains', icon: 'mountain', prompt: 'Explain the Himalayas — formation, divisions, and importance.' },
        { title: 'The Northern Plains', icon: 'map', prompt: 'Teach me about the Indo-Gangetic plain — formation and features.' },
        { title: 'Drainage Systems', icon: 'waves', prompt: 'Explain Indian rivers — Himalayan and Peninsular river systems.' },
      ]},
      { title: 'Climate & Vegetation', topics: [
        { title: 'Climate of India', icon: 'cloud-sun', prompt: 'Teach me India\'s climate — monsoon mechanism and seasons.' },
        { title: 'Natural Vegetation & Wildlife', icon: 'trees', prompt: 'Explain forest types, wildlife sanctuaries, and conservation.' },
      ]},
    ],
    10: [
      { title: 'Resources & Development', topics: [
        { title: 'Resource Planning', icon: 'layout-dashboard', prompt: 'Explain resource planning, sustainable development, and conservation.' },
        { title: 'Forest & Wildlife Resources', icon: 'trees', prompt: 'Teach me about deforestation, conservation, and community projects.' },
        { title: 'Water Resources', icon: 'droplets', prompt: 'Explain water scarcity, dams, rainwater harvesting, and watershed.' },
      ]},
      { title: 'Economy & Infrastructure', topics: [
        { title: 'Manufacturing Industries', icon: 'factory', prompt: 'Teach me about agro-based and mineral-based industries in India.' },
        { title: 'Lifelines of National Economy', icon: 'train-front', prompt: 'Explain transport — roadways, railways, waterways, airways, and pipelines.' },
      ]},
    ],
  },
  'Computer Science': {
    8: [
      { title: 'Introduction to Computers', topics: [
        { title: 'Computer Hardware & Software', icon: 'monitor', prompt: 'Explain CPU, RAM, storage, input/output devices, and software types.' },
        { title: 'Operating Systems', icon: 'settings', prompt: 'Teach me about OS — Windows, Linux, file management, and multitasking.' },
        { title: 'Internet & Networking', icon: 'wifi', prompt: 'Explain the internet, protocols, IP addresses, and networking basics.' },
      ]},
      { title: 'Programming Basics', topics: [
        { title: 'Introduction to Coding', icon: 'code', prompt: 'Teach me programming fundamentals — variables, loops, and conditions.' },
        { title: 'HTML & Web Pages', icon: 'globe', prompt: 'Explain HTML tags, attributes, forms, and creating a basic webpage.' },
      ]},
    ],
    9: [
      { title: 'IT Fundamentals', topics: [
        { title: 'IT Applications', icon: 'smartphone', prompt: 'Teach me about IT in daily life — e-governance, e-commerce, and apps.' },
        { title: 'Electronic Spreadsheet', icon: 'table', prompt: 'Explain spreadsheets — formulas, functions, charts, and data analysis.' },
        { title: 'DBMS Concepts', icon: 'database', prompt: 'Teach me databases — tables, queries, primary keys, and SQL basics.' },
      ]},
      { title: 'Web Technology', topics: [
        { title: 'HTML Advanced', icon: 'code', prompt: 'Explain advanced HTML — tables, multimedia, iframes, and semantic tags.' },
        { title: 'Cascading Style Sheets', icon: 'palette', prompt: 'Teach me CSS — selectors, properties, layouts, and responsive design.' },
      ]},
    ],
    10: [
      { title: 'Cyber Safety', topics: [
        { title: 'Cyber Ethics', icon: 'shield', prompt: 'Explain cyber ethics — netiquette, intellectual property, and digital citizenship.' },
        { title: 'Internet Safety', icon: 'lock', prompt: 'Teach me internet safety — phishing, malware, passwords, and privacy.' },
      ]},
      { title: 'Programming with Python', topics: [
        { title: 'Python Basics', icon: 'terminal', prompt: 'Explain Python — syntax, variables, data types, and basic programs.' },
        { title: 'Data Structures in Python', icon: 'brackets', prompt: 'Teach me lists, tuples, dictionaries, and sets in Python.' },
        { title: 'Functions & Modules', icon: 'package', prompt: 'Explain functions, arguments, return values, and importing modules.' },
      ]},
    ],
  },
};

// Generate labAssets from curriculum data
const makeId = (std: string, subj: string, name: string) =>
  `${std}-${subj.toLowerCase().replace(/[^a-z0-9]/g, '')}-${name.toLowerCase().replace(/\s+/g, '-')}`;

function generateLabAssets(): LabAsset[] {
  const assets: LabAsset[] = [];

  for (const [subject, standards] of Object.entries(curriculumData)) {
    const color = subjectColors[subject] || '#0ea5e9';
    for (const [std, modules] of Object.entries(standards)) {
      for (const mod of modules) {
        for (const topic of mod.topics) {
          assets.push({
            id: makeId(std.toString(), subject, topic.title),
            title: topic.title,
            subject,
            standard: std.toString(),
            color,
            prompt: topic.prompt || '',
            description: `Learn about ${topic.title}`,
            svgPath: '', // Using icon instead
            icon: topic.icon,
          });
        }
      }
    }
  }

  return assets;
}

export const labAssets: LabAsset[] = generateLabAssets();

// Helper to get assets by standard
export const getAssetsByStandard = (standard: string): LabAsset[] =>
  labAssets.filter(a => a.standard === standard);

// Helper to get all unique standards
export const getLabStandards = (): string[] =>
  Array.from(new Set(labAssets.map(a => a.standard))).sort((a, b) => b.localeCompare(a));

// Helper to group assets by subject
export const groupAssetsBySubject = (assets: LabAsset[]): Record<string, LabAsset[]> =>
  assets.reduce((acc, asset) => {
    if (!acc[asset.subject]) acc[asset.subject] = [];
    acc[asset.subject].push(asset);
    return acc;
  }, {} as Record<string, LabAsset[]>);

// AI response generator for lab assets
export const getLabAIResponse = (asset: LabAsset): string => {
  return `Let's dive into **"${asset.title}"** from ${asset.subject}! 🎓\n\n${asset.prompt}\n\nI'll break this down step by step for you. What aspect would you like to explore first?\n\n1. Core concepts and definitions\n2. Key formulas and rules\n3. Practice problems`;
};
