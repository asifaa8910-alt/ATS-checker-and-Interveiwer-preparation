const TfIdf = require('natural/lib/natural/tfidf/tfidf');
const WordTokenizer = require('natural/lib/natural/tokenizers/regexp_tokenizer').WordTokenizer;
const nlp = require('compromise');
const stringSimilarity = require('string-similarity');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Whitelisted Standard Headings for Category 1
const WHITELIST_HEADINGS = [
  "work experience", "professional experience", "employment history",
  "education", "skills", "technical skills", "core competencies",
  "certifications", "summary", "professional summary", "projects"
];

// Common Industry Skills for Keyword Match fallback
const FALLBACK_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring boot',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'sqlite',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'linux',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'graphql', 'rest api', 'microservices',
  'machine learning', 'data science', 'ai', 'devops', 'testing', 'jest', 'agile', 'scrum'
];

// Common Action Verbs for Category 5
const ACTION_VERBS = [
  'led', 'developed', 'built', 'designed', 'implemented', 'optimized', 'managed', 'created',
  'architected', 'scaled', 'increased', 'reduced', 'improved', 'delivered', 'launched',
  'coordinated', 'automated', 'streamlined', 'mentored', 'engineered', 'formulated'
];

// Acronym Expansion Map for Keyword Match normalization
const ACRONYMS = {
  'seo': 'search engine optimization',
  'ats': 'applicant tracking system',
  'aws': 'amazon web services',
  'api': 'application programming interface',
  'sql': 'structured query language',
  'dsa': 'data structures and algorithms',
  'oop': 'object oriented programming',
  'dbms': 'database management system',
  'ci': 'continuous integration',
  'cd': 'continuous deployment'
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const containsKeyword = (text, term) => {
  const escaped = escapeRegExp(term);
  const pattern = /^[a-zA-Z0-9_]+$/.test(term)
    ? `\\b${escaped}\\b`
    : `(?:^|\\s|[.,;:\\/()\\-\\[\\]])${escaped}(?:$|\\s|[.,;:\\/()\\-\\[\\]])`;
  const regex = new RegExp(pattern, 'i');
  return regex.test(text);
};

/**
 * Strict 6-category ATS scoring engine
 */
const performAlgorithmicATSAnalysis = (text, jobDescription = '') => {
  const cleanText = text.toLowerCase();
  const cleanJD = jobDescription.toLowerCase();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanLines = lines.map(l => l.toLowerCase());

  const flags = [];
  const positivesList = [];
  const negativesList = [];
  const suggestionsList = [];

  // ==========================================
  // CATEGORY 1: Parseability (20%)
  // ==========================================
  let parseabilityScore = 100;
  
  // 1. Single Column Check (Simulate detection via wide spacing or vertical delimiters)
  const hasMultiColumnIndicator = lines.some(line => /\w{2,}\s{6,}\w{2,}/.test(line) || line.includes('|') || line.includes('¦'));
  if (hasMultiColumnIndicator) {
    parseabilityScore -= 15;
    flags.push("PARSE_MULTI_COLUMN");
    negativesList.push("Potential multi-column structure or vertical layout delimiters detected, which can jumble parsed text order.");
    suggestionsList.push("Use a clean, single-column text flow to ensure parsing readability.");
  } else {
    positivesList.push("Document appears to follow a clean, single-column format.");
  }

  // 2. Section Headings whitelists
  let matchedHeadingsCount = 0;
  let nonStandardHeadingsCount = 0;
  lines.forEach(line => {
    // Check if line looks like a header (short, title-case or uppercase)
    if (line.length < 35 && line.split(/\s+/).length <= 4) {
      const lowerLine = line.toLowerCase().replace(/[:#]/g, '').trim();
      const isHeading = WHITELIST_HEADINGS.some(wh => lowerLine.includes(wh));
      if (isHeading) {
        matchedHeadingsCount++;
      } else if (/(experience|education|skills|projects|summary|profile|competencies|history)/i.test(lowerLine)) {
        nonStandardHeadingsCount++;
      }
    }
  });
  if (nonStandardHeadingsCount > 0) {
    parseabilityScore -= Math.min(20, nonStandardHeadingsCount * 5);
    flags.push("NON_STANDARD_HEADINGS");
    negativesList.push("Non-standard section headings detected. Standard ATS parsers match specific whitelisted keywords.");
    suggestionsList.push("Rename sections to standard headings like 'Professional Experience', 'Education', 'Projects', and 'Skills'.");
  } else if (matchedHeadingsCount > 0) {
    positivesList.push("Uses standard, whitelisted section headers.");
  }

  // 3. Contact Info body text
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const hasEmail = emailRegex.test(cleanText);
  const hasPhone = phoneRegex.test(cleanText);
  if (!hasEmail || !hasPhone) {
    parseabilityScore -= 20;
    flags.push("MISSING_CONTACT_INFO");
    negativesList.push("Missing core contact details (email address or phone number) in parseable body text.");
    suggestionsList.push("Make sure your email address and phone number are explicitly written in the body text (avoid headers/footers).");
  } else {
    positivesList.push("Contact information (email and phone) is properly parsed.");
  }

  // 4. Dates formatting consistency (MM/YYYY)
  const dateRegex = /\b\d{1,2}\/\d{4}\b/g;
  const yearOnlyRegex = /\b\d{4}\b/g;
  const totalDateMatches = cleanText.match(dateRegex) || [];
  const totalYearMatches = cleanText.match(yearOnlyRegex) || [];
  if (totalDateMatches.length === 0 && totalYearMatches.length > 0) {
    parseabilityScore -= 10;
    flags.push("INCONSISTENT_DATES");
    negativesList.push("Dates appear as years only. A consistent MM/YYYY format is preferred for experience parsers.");
    suggestionsList.push("Use a consistent month/year format (e.g. 05/2022 - 08/2024) instead of year-only indicators.");
  }

  // 5. Evidence of text boxes, tables, non-standard bullets
  const hasTableArtifacts = cleanText.includes('+---') || cleanText.includes('---') && lines.some(l => l.startsWith('|')) || cleanText.includes('\t');
  if (hasTableArtifacts) {
    parseabilityScore -= 10;
    flags.push("TABLE_OR_TEXT_BOX_DETECTED");
    negativesList.push("Potential use of tables, text boxes, or tabulations detected, which can lead to field misassignment.");
    suggestionsList.push("Avoid using tables or text boxes; use standard bulleted lists and margins instead.");
  }

  parseabilityScore = Math.max(10, parseabilityScore);

  // ==========================================
  // CATEGORY 2: Keyword Match Rate (35%)
  // ==========================================
  let keywordMatchScore = 0;
  let targetKeywords = [];
  const keywordMatches = [];
  const keywordGaps = [];

  // Extract keywords
  if (cleanJD.trim()) {
    const jdDoc = nlp(cleanJD);
    const jdNouns = jdDoc.nouns().out('array');
    targetKeywords = [...new Set(jdNouns)]
      .map(n => n.toLowerCase())
      .filter(n => n.length > 3 && !['requirements', 'skills', 'experience', 'duties', 'responsibilities', 'candidate', 'qualification'].includes(n));
  } else {
    targetKeywords = FALLBACK_SKILLS;
  }

  // Normalization including Acronym expansion
  const normalize = (word) => {
    let w = word.toLowerCase().trim();
    if (ACRONYMS[w]) w = w + " " + ACRONYMS[w];
    return w;
  };

  const normalizedText = cleanText.split(/\s+/).map(normalize).join(' ');

  let matchedWeightSum = 0;
  let totalWeightPossible = targetKeywords.length;

  targetKeywords.forEach(kw => {
    const normKw = normalize(kw);
    let matched = false;

    // Weight keyword matches by location
    // Find Skills section and Experience section boundaries
    let inSkillsSection = false;
    let inExperienceSection = false;
    let inSummarySection = false;

    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      if (line.includes('skills') || line.includes('technologies') || line.includes('expertise')) {
        inSkillsSection = true;
        inExperienceSection = false;
        inSummarySection = false;
      } else if (line.includes('experience') || line.includes('employment') || line.includes('work history')) {
        inSkillsSection = false;
        inExperienceSection = true;
        inSummarySection = false;
      } else if (line.includes('summary') || line.includes('profile')) {
        inSkillsSection = false;
        inExperienceSection = false;
        inSummarySection = true;
      }

      if (line.includes(normKw) || containsKeyword(line, kw)) {
        matched = true;
        if (inSkillsSection || inExperienceSection) {
          matchedWeightSum += 1.0;
        } else if (inSummarySection) {
          matchedWeightSum += 0.5;
        } else {
          matchedWeightSum += 0.7; // default location
        }
        break;
      }
    }

    if (matched) {
      keywordMatches.push(kw);
    } else {
      keywordGaps.push(kw);
    }
  });

  if (targetKeywords.length > 0) {
    const rawRate = (matchedWeightSum / totalWeightPossible) * 100;
    keywordMatchScore = Math.min(100, Math.round(rawRate));
  } else {
    keywordMatchScore = 70; // baseline fallback
  }

  if (keywordGaps.length > 3) {
    flags.push("CRITICAL_MISSING_KEYWORDS");
    negativesList.push(`Missing critical job description keywords: ${keywordGaps.slice(0, 4).join(', ')}.`);
    suggestionsList.push(`Integrate these missing skills naturally in your Experience or Skills sections: ${keywordGaps.slice(0, 3).join(', ')}.`);
  }

  // ==========================================
  // CATEGORY 3: Job Title & Role Alignment (10%)
  // ==========================================
  let jobTitleScore = 30; // default for no matching title
  let targetTitle = '';
  
  if (cleanJD.trim()) {
    // Simple target title extraction from first few lines of JD
    const jdLines = cleanJD.split('\n').map(l => l.trim()).filter(Boolean);
    targetTitle = jdLines[0] || '';
  }

  if (targetTitle) {
    const cleanTargetTitle = targetTitle.toLowerCase();
    const hasExactTitle = cleanLines.some(l => l.includes(cleanTargetTitle));
    if (hasExactTitle) {
      jobTitleScore = 100;
      positivesList.push(`Found exact match for target job title: '${targetTitle}'.`);
    } else {
      // Partial/seniority match
      const titleWords = cleanTargetTitle.split(/\s+/).filter(w => w.length > 3 && !['senior', 'junior', 'lead', 'principal', 'staff', 'role', 'job'].includes(w));
      const hasPartialTitle = titleWords.length > 0 && titleWords.every(word => cleanText.includes(word));
      if (hasPartialTitle) {
        jobTitleScore = 70;
        flags.push("TITLE_SENIORITY_MISMATCH");
        negativesList.push(`Target role keyword matched, but exact job title seniority mismatch detected.`);
        suggestionsList.push(`Align your resume headline or experience titles to reflect the targeted seniority level.`);
      } else {
        jobTitleScore = 40;
        flags.push("JOB_TITLE_MISMATCH");
        negativesList.push(`No relevant title matches for '${targetTitle}' found in your work history.`);
        suggestionsList.push(`Update your resume title or experience headers to match targeted role keywords.`);
      }
    }
  } else {
    // Baseline title match using common developer terms
    const devTerms = ['developer', 'engineer', 'analyst', 'manager', 'architect'];
    const hasAnyTitle = devTerms.some(term => cleanText.includes(term));
    jobTitleScore = hasAnyTitle ? 80 : 40;
  }

  // ==========================================
  // CATEGORY 4: Structure & Completeness (15%)
  // ==========================================
  let structureScore = 100;
  
  // 1. Expected sections present
  const expectedSections = [
    { name: 'Contact Info', pattern: /(email|phone|address|contact|linkedin)/i },
    { name: 'Experience', pattern: /(experience|history|employment|work)/i },
    { name: 'Education', pattern: /(education|academic|university|college)/i },
    { name: 'Skills', pattern: /(skills|technologies|expertise|tools)/i }
  ];
  expectedSections.forEach(sec => {
    if (!sec.pattern.test(cleanText)) {
      structureScore -= 20;
      flags.push(`MISSING_SECTION_${sec.name.toUpperCase().replace(' ', '_')}`);
      negativesList.push(`Missing core section: ${sec.name}.`);
    }
  });

  // 2. Reverse chronological order
  const years = cleanText.match(/\b(20\d{2}|19\d{2})\b/g) || [];
  if (years.length >= 2) {
    const parsedYears = years.map(Number);
    // Check if years are generally listed descending (newest first)
    let ascendingOrderViolations = 0;
    for (let i = 0; i < parsedYears.length - 1; i++) {
      if (parsedYears[i] < parsedYears[i + 1]) {
        ascendingOrderViolations++;
      }
    }
    if (ascendingOrderViolations > parsedYears.length / 3) {
      structureScore -= 10;
      flags.push("CHRONOLOGY_VIOLATION");
      negativesList.push("Timeline chronology order appears ascending or inconsistent. Standard is reverse-chronological.");
      suggestionsList.push("List your work experience starting with the most recent job first.");
    }
  }

  // 3. Spelled out degrees + acronym
  const hasDegreeForm = /bachelor\b.*\(b\.?[sa]\.?\)|master\b.*\(m\.?[bsa]\.?\)|doctor\b.*\(ph\.?d\.?\)/gi.test(cleanText);
  if (!hasDegreeForm && ['bachelor', 'master', 'phd'].some(deg => cleanText.includes(deg))) {
    structureScore -= 5;
    suggestionsList.push("Spell out academic degrees in full alongside acronyms (e.g. 'Bachelor of Science (BS)').");
  }

  structureScore = Math.max(10, structureScore);

  // ==========================================
  // CATEGORY 5: Quantification & Achievement Signal (10%)
  // ==========================================
  let quantificationScore = 0;
  
  // Count experience/projects bullet points
  const bullets = lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));
  const totalBullets = bullets.length || 10; // default total to prevent division by zero
  let quantifiedBullets = 0;
  
  bullets.forEach(b => {
    const hasMetric = /\b\d+%\b|\b\$\d+|\b\d+\s*(?:%|percent|million|billion|k|hours|years|days|months)\b/i.test(b);
    if (hasMetric) quantifiedBullets++;
  });

  const metricRatio = quantifiedBullets / totalBullets;
  const metricScore = Math.min(100, Math.round(metricRatio * 100));

  // Action verbs check
  const foundActionVerbs = [];
  ACTION_VERBS.forEach(v => {
    if (containsKeyword(cleanText, v)) foundActionVerbs.push(v);
  });
  const actionVerbScore = Math.min(100, foundActionVerbs.length * 15);

  quantificationScore = Math.round((metricScore * 0.6) + (actionVerbScore * 0.4));
  if (metricRatio < 0.25) {
    flags.push("LOW_QUANTIFICATION");
    negativesList.push("Low utilization of quantifiable achievements (percentages, revenue, time metrics) in experience descriptions.");
    suggestionsList.push("Quantify your impact in your bullet points (e.g. 'Reduced load times by 20%' or 'Managed a budget of $50k').");
  } else {
    positivesList.push("Good quantification of accomplishments in projects/jobs.");
  }

  // ==========================================
  // CATEGORY 6: Compliance / Red Flags (10%, penalty-only)
  // ==========================================
  let complianceScore = 100;
  
  // 1. Excessive keyword stuffing
  const stuffedSkills = [];
  FALLBACK_SKILLS.forEach(skill => {
    const occurrences = (cleanText.match(new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'gi')) || []).length;
    if (occurrences > 5) {
      stuffedSkills.push(skill);
    }
  });
  if (stuffedSkills.length > 0) {
    complianceScore -= Math.min(40, stuffedSkills.length * 10);
    flags.push("KEYWORD_STUFFING");
    negativesList.push(`Potential keyword stuffing detected for terms: [${stuffedSkills.slice(0, 3).join(', ')}].`);
    suggestionsList.push("Avoid repeating keywords artificially. Integrate them in descriptive context blocks.");
  }

  // 2. Disconnected keyword lists
  const isDisconnectedList = cleanLines.some(line => line.includes(',') && line.split(',').length > 8);
  if (isDisconnectedList) {
    complianceScore -= 20;
    flags.push("DISCONNECTED_KEYWORD_LIST");
    negativesList.push("Found raw skill lists disconnected from project descriptions or employment histories.");
  }

  complianceScore = Math.max(10, complianceScore);

  // ==========================================
  // FINAL AGGREGATE ATS SCORE
  // ==========================================
  const overallATSScore = Math.round(
    (parseabilityScore * 0.20) +
    (keywordMatchScore * 0.35) +
    (jobTitleScore * 0.10) +
    (structureScore * 0.15) +
    (quantificationScore * 0.10) +
    (complianceScore * 0.10)
  );

  const finalATSScore = Math.min(100, Math.max(10, overallATSScore));

  return {
    atsScore: finalATSScore,
    formattingScore: parseabilityScore,
    skillsScore: keywordMatchScore,
    experienceScore: jobTitleScore,
    educationScore: structureScore,
    keywordsScore: quantificationScore,
    grammarScore: complianceScore,
    achievementsScore: quantificationScore,
    impactScore: quantificationScore,
    techReadinessScore: Math.round((keywordMatchScore * 0.6) + (jobTitleScore * 0.4)),
    keywordMatches: [...new Set(keywordMatches)].slice(0, 15),
    keywordGaps: [...new Set(keywordGaps)].slice(0, 10),
    foundActionVerbs,
    missingActionVerbs: ACTION_VERBS.filter(v => !foundActionVerbs.includes(v)).slice(0, 6),
    foundWeakPhrases: [],
    stuffedSkills,
    wordCount: lines.join(' ').split(/\s+/).length,
    foundEdu: [],
    matchedCerts: [],
    flags,
    positives: positivesList,
    negatives: negativesList,
    suggestions: suggestionsList
  };
};

/**
 * Generate hybrid analysis combining weighted algorithm stats with Gemini AI reviews
 */
const analyzeResumeHybrids = async (resumeText, jobDescription = '') => {
  const algo = performAlgorithmicATSAnalysis(resumeText, jobDescription);
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

  const fallbackAI = {
    summary: `Based on a rigorous industry parsing, your resume scores an ATS match of ${algo.atsScore}%. It has strong keyword references but needs more action-oriented descriptions of work experience.`,
    positives: algo.positives.length > 0 ? algo.positives : [
      `Skills coverage is well-referenced.`,
      `Academic records are clear.`
    ],
    negatives: algo.negatives.length > 0 ? algo.negatives : [
      `Lack of quantifiable metrics on projects.`,
      `Missing some keywords from the job description.`
    ],
    suggestions: algo.suggestions.length > 0 ? algo.suggestions : [
      'Incorporate concrete metrics to statements.',
      'Align job titles with target job descriptions.'
    ]
  };

  if (!apiKey) {
    return {
      atsScore: algo.atsScore,
      formattingScore: algo.formattingScore,
      skillsScore: algo.skillsScore,
      experienceScore: algo.experienceScore,
      projectsScore: algo.keywordsScore, // mapped to quantification
      educationScore: algo.educationScore,
      keywordsScore: algo.keywordsScore,
      grammarScore: algo.grammarScore,
      verbsScore: 80,
      techReadinessScore: algo.techReadinessScore,
      keywordMatches: algo.keywordMatches,
      keywordGaps: algo.keywordGaps,
      actionVerbsList: algo.foundActionVerbs,
      missingActionVerbs: algo.missingActionVerbs,
      educationMatches: algo.foundEdu,
      certificationMatches: algo.matchedCerts,
      
      skillsFound: algo.keywordMatches,
      skillsMissing: algo.keywordGaps,
      recruiterSummary: fallbackAI.summary,
      strengths: fallbackAI.positives,
      weaknesses: fallbackAI.negatives,
      industryRecommendations: fallbackAI.suggestions,
      sectionWiseScores: {
        formatting: algo.formattingScore,
        skills: algo.skillsScore,
        experience: algo.experienceScore,
        projects: algo.keywordsScore,
        education: algo.educationScore,
        keywords: algo.keywordsScore,
        verbs: 80,
        grammar: algo.grammarScore
      },
      summary: fallbackAI.summary,
      positives: fallbackAI.positives,
      negatives: fallbackAI.negatives,
      suggestions: fallbackAI.suggestions
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert Applicant Tracking System (ATS) auditor.
      An algorithmic scanner has run on a candidate's resume and job description.
      
      Algorithmic metrics:
      - ATS Match Score: ${algo.atsScore}/100
      - Parseability (Formatting): ${algo.formattingScore}/100
      - Keyword Match Rate: ${algo.skillsScore}/100
      - Job Title Alignment: ${algo.experienceScore}/100
      - Structure & Completeness: ${algo.educationScore}/100
      - Quantification Signal: ${algo.keywordsScore}/100
      - Compliance / Red Flags: ${algo.grammarScore}/100
      - Extracted Skills Matches: ${JSON.stringify(algo.keywordMatches)}
      - Missing Skill Gaps: ${JSON.stringify(algo.keywordGaps)}
      - Extracted Action Verbs: ${JSON.stringify(algo.foundActionVerbs)}
      - Detected Stuffed Keywords: ${JSON.stringify(algo.stuffedSkills)}
      - System Flags Raised: ${JSON.stringify(algo.flags)}
      
      Resume text:
      "${resumeText}"
      
      Job Description:
      "${jobDescription}"
      
      Provide a qualitative expert assessment in JSON format. Do not use markdown tags, comments, or header text. The JSON object must match this schema exactly:
      {
        "summary": "Recruiter's executive summary string detailing job fitness and calculated score details.",
        "positives": ["Clear list of positive elements or strengths on the resume"],
        "negatives": ["Issues, weaknesses, or formatting errors that need fixing"],
        "suggestions": ["Actionable rewrite suggestions for bullet points, grammar fixes, or achievements addition"]
      }
    `;

    const result = await model.generateContent(prompt);
    let cleanJson = result.response.text().trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const parsedJson = JSON.parse(cleanJson);

    return {
      atsScore: algo.atsScore,
      formattingScore: algo.formattingScore,
      skillsScore: algo.skillsScore,
      experienceScore: algo.experienceScore,
      projectsScore: algo.keywordsScore,
      educationScore: algo.educationScore,
      keywordsScore: algo.keywordsScore,
      grammarScore: algo.grammarScore,
      verbsScore: 80,
      techReadinessScore: algo.techReadinessScore,
      keywordMatches: algo.keywordMatches,
      keywordGaps: algo.keywordGaps,
      actionVerbsList: algo.foundActionVerbs,
      missingActionVerbs: algo.missingActionVerbs,
      educationMatches: algo.foundEdu,
      certificationMatches: algo.matchedCerts,
      
      skillsFound: algo.keywordMatches,
      skillsMissing: algo.keywordGaps,
      recruiterSummary: parsedJson.summary || fallbackAI.summary,
      strengths: parsedJson.positives || fallbackAI.positives,
      weaknesses: [...(parsedJson.negatives || fallbackAI.negatives), ...algo.negatives],
      industryRecommendations: parsedJson.suggestions || fallbackAI.suggestions,
      sectionWiseScores: {
        formatting: algo.formattingScore,
        skills: algo.skillsScore,
        experience: algo.experienceScore,
        projects: algo.keywordsScore,
        education: algo.educationScore,
        keywords: algo.keywordsScore,
        verbs: 80,
        grammar: algo.grammarScore
      },
      summary: parsedJson.summary || fallbackAI.summary,
      positives: parsedJson.positives || fallbackAI.positives,
      negatives: [...(parsedJson.negatives || fallbackAI.negatives), ...algo.negatives],
      suggestions: parsedJson.suggestions || fallbackAI.suggestions
    };
  } catch (error) {
    console.error('Error combining algorithmic analysis with Gemini AI:', error);
    return {
      atsScore: algo.atsScore,
      formattingScore: algo.formattingScore,
      skillsScore: algo.skillsScore,
      experienceScore: algo.experienceScore,
      projectsScore: algo.keywordsScore,
      educationScore: algo.educationScore,
      keywordsScore: algo.keywordsScore,
      grammarScore: algo.grammarScore,
      verbsScore: 80,
      techReadinessScore: algo.techReadinessScore,
      keywordMatches: algo.keywordMatches,
      keywordGaps: algo.keywordGaps,
      actionVerbsList: algo.foundActionVerbs,
      missingActionVerbs: algo.missingActionVerbs,
      educationMatches: algo.foundEdu,
      certificationMatches: algo.matchedCerts,
      
      skillsFound: algo.keywordMatches,
      skillsMissing: algo.keywordGaps,
      recruiterSummary: fallbackAI.summary,
      strengths: fallbackAI.positives,
      weaknesses: fallbackAI.negatives,
      industryRecommendations: fallbackAI.suggestions,
      sectionWiseScores: {
        formatting: algo.formattingScore,
        skills: algo.skillsScore,
        experience: algo.experienceScore,
        projects: algo.keywordsScore,
        education: algo.educationScore,
        keywords: algo.keywordsScore,
        verbs: 80,
        grammar: algo.grammarScore
      },
      summary: fallbackAI.summary,
      positives: fallbackAI.positives,
      negatives: fallbackAI.negatives,
      suggestions: fallbackAI.suggestions
    };
  }
};

module.exports = {
  analyzeResumeHybrids
};
