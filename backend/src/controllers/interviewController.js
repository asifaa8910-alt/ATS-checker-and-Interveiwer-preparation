const { 
  Interview, InterviewQuestion, InterviewAnswer, InterviewResult, Resume 
} = require('../models/index');
const { generateFirstQuestion, generateNextQuestion, evaluateSingleResponse, generateFinalReport } = require('../utils/gemini');

// Helper to map Sequelize output to Mongo shape for React frontend compatibility
const mapSession = async (session) => {
  if (!session) return null;
  const data = session.toJSON ? session.toJSON() : session;
  data._id = data.id;
  
  // Load questions, answers, results manually if not included
  if (!data.questions) {
    const qs = await InterviewQuestion.findAll({ where: { interviewId: data.id } });
    data.questions = qs.map(q => {
      const qd = q.toJSON();
      qd._id = qd.id;
      return qd;
    });
  } else {
    data.questions = data.questions.map(q => ({ ...q, _id: q.id }));
  }

  if (!data.answers) {
    const ans = await InterviewAnswer.findAll({ where: { interviewId: data.id } });
    data.answers = ans.map(a => {
      const ad = a.toJSON();
      ad._id = ad.id;
      return ad;
    });
  } else {
    data.answers = data.answers.map(a => ({ ...a, _id: a.id }));
  }

  if (!data.results) {
    const resList = await InterviewResult.findAll({ where: { interviewId: data.id } });
    data.results = [];
    for (const r of resList) {
      const rd = r.toJSON();
      rd._id = rd.id;
      // Populate nested question and answer
      const q = data.questions.find(item => item.id === rd.questionId);
      const a = data.answers.find(item => item.id === rd.answerId);
      rd.question = q;
      rd.answer = a;
      data.results.push(rd);
    }
  } else {
    data.results = data.results.map(r => ({ ...r, _id: r.id }));
  }

  return data;
};

// @desc    Start Interview Session, Generate Question 1 & Create Records
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { 
      candidateName,
      type, 
      targetRole, 
      difficulty, 
      experienceLevel, 
      programmingLanguage, 
      companyType, 
      durationLimit,
      jobDescription 
    } = req.body;

    if (!type || !targetRole) {
      return res.status(400).json({ success: false, message: 'Please specify interview type and target role' });
    }

    // 1. Fetch latest resume context
    let resumeText = '';
    const latestResume = await Resume.findOne({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']] 
    });
    if (latestResume) {
      resumeText = latestResume.extractedText || '';
    }

    const sessionParams = {
      type,
      targetRole,
      difficulty: difficulty || 'medium',
      experienceLevel: experienceLevel || 'Fresher (0-1 Years)',
      programmingLanguage: programmingLanguage || 'none',
      companyType: companyType || 'Product Based',
      durationLimit: Number(durationLimit) || 20,
      resumeText,
      jobDescription
    };

    // 2. Generate only Question 1
    const firstQuestionText = await generateFirstQuestion(sessionParams);

    // 3. Create Session Record
    const session = await Interview.create({
      userId: req.user.id,
      candidateName: candidateName || 'Candidate',
      type,
      targetRole,
      difficulty: difficulty || 'medium',
      experienceLevel: experienceLevel || 'Fresher (0-1 Years)',
      programmingLanguage: programmingLanguage || 'none',
      companyType: companyType || 'Product Based',
      durationLimit: Number(durationLimit) || 20,
      topic: type.toUpperCase(),
      status: 'pending',
    });

    // 4. Create Question 1 Record
    const qRecord = await InterviewQuestion.create({
      interviewId: session.id,
      questionText: firstQuestionText,
      difficulty: difficulty || 'medium',
      topic: type.toUpperCase(),
    });

    const mappedData = await mapSession(session);

    res.status(201).json({
      success: true,
      data: {
        ...mappedData,
        questions: [qRecord], // send array with Question 1
      },
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ success: false, message: 'Server error generating interview questions' });
  }
};

// @desc    Grade Single Response Immediately, then Generate next question if not complete
// @route   POST /api/interview/grade-answer
// @access  Private
const gradeAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answerText } = req.body;

    if (!interviewId || !questionId) {
      return res.status(400).json({ success: false, message: 'Please specify interview ID and question ID' });
    }

    const session = await Interview.findByPk(interviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const questionRecord = await InterviewQuestion.findByPk(questionId);
    if (!questionRecord) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const cleanAnswer = (answerText || '').trim();
    const isSkipped = cleanAnswer === 'Skipped' || cleanAnswer === '';

    // 1. Create/Save Answer
    const answerRecord = await InterviewAnswer.create({
      interviewId: session.id,
      questionId: questionId,
      answerText: isSkipped ? 'Skipped' : cleanAnswer,
    });

    // 2. Perform word-count constraints & skips penalty locally
    let evaluation;
    const wordsList = cleanAnswer.split(/\s+/).filter(w => w.length > 0);
    const wordsCount = wordsList.length;
    const oneWordRegex = /^(yes|no|ok|okay|idk|maybe|don't know|no idea)$/i;

    if (isSkipped) {
      evaluation = {
        score: 0,
        accuracyScore: 0,
        confidenceScore: 0,
        technicalDepthScore: 0,
        communicationScore: 0,
        grammarScore: 0,
        fluencyScore: 0,
        relevanceScore: 0,
        completenessScore: 0,
        feedback: 'Question was skipped by candidate.',
        sampleAnswer: 'No sample answer compiled for skipped questions.',
        strengths: [],
        weaknesses: ['Question Skipped'],
        missingConcepts: ['All relevant concepts'],
        suggestedImprovements: ['Attempt questions to receive evaluation advice.'],
        betterExplanation: 'Try giving at least a basic explanation or mention similar systems.',
        interviewTip: 'Even a partial guess is better than leaving an answer completely blank during interviews.'
      };
    } else if (wordsCount < 15 || oneWordRegex.test(cleanAnswer)) {
      const dynamicTech = Math.floor(Math.random() * 11);
      const dynamicComm = Math.floor(Math.random() * 21);
      const dynamicOverall = Math.floor(Math.random() * 6) + 9;

      evaluation = {
        score: dynamicOverall,
        accuracyScore: 10,
        confidenceScore: 10,
        technicalDepthScore: dynamicTech,
        communicationScore: dynamicComm,
        grammarScore: 20,
        fluencyScore: 10,
        relevanceScore: 20,
        completenessScore: 10,
        feedback: 'Answer is too short for meaningful evaluation.',
        sampleAnswer: 'An ideal response should be a complete explanation of the technical principles, including code syntaxes or deployment structures.',
        strengths: [],
        weaknesses: ['Answer is too short', 'Lacks technical depth', 'One-word/simple response pattern detected'],
        missingConcepts: ['Comprehensive explanation', 'Coding examples', 'Architectural components'],
        suggestedImprovements: ['Expand your response to provide detailed technical definitions and examples.'],
        betterExplanation: 'Explain both definitions and functional layouts to satisfy technical depth expectations.',
        interviewTip: 'Aim to speak or type at least 2-3 sentences to fully explain a technical concept in an interview.'
      };
    } else {
      evaluation = await evaluateSingleResponse(
        questionRecord.questionText,
        answerRecord.answerText,
        session.type,
        session.targetRole
      );
    }

    // 3. Create Result Record
    const resultRecord = await InterviewResult.create({
      interviewId: session.id,
      questionId: questionId,
      answerId: answerRecord.id,
      score: evaluation.score,
      feedback: evaluation.feedback,
      sampleAnswer: evaluation.sampleAnswer,
      accuracyScore: evaluation.accuracyScore,
      confidenceScore: evaluation.confidenceScore,
      technicalDepthScore: evaluation.technicalDepthScore,
      communicationScore: evaluation.communicationScore,
      grammarScore: evaluation.grammarScore,
      fluencyScore: evaluation.fluencyScore,
      relevanceScore: evaluation.relevanceScore,
      completenessScore: evaluation.completenessScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      missingConcepts: evaluation.missingConcepts,
      suggestedImprovements: evaluation.suggestedImprovements,
      betterExplanation: evaluation.betterExplanation || '',
      interviewTip: evaluation.interviewTip || ''
    });

    // 4. Check if we need to generate the NEXT question
    const maxQuestionsCount = session.durationLimit >= 30 ? 6 : 4;
    const currentQuestionsCount = await InterviewQuestion.count({ where: { interviewId: session.id } });
    let nextQuestionRecord = null;
    let isLastQuestion = false;

    if (currentQuestionsCount < maxQuestionsCount) {
      const askedQuestions = await InterviewQuestion.findAll({ where: { interviewId: session.id } });
      const askedQuestionsTexts = askedQuestions.map(q => q.questionText);

      let resumeText = '';
      const latestResume = await Resume.findOne({ 
        where: { userId: session.userId },
        order: [['createdAt', 'DESC']]
      });
      if (latestResume) {
        resumeText = latestResume.extractedText || '';
      }

      const sessionParams = {
        type: session.type,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        experienceLevel: session.experienceLevel,
        programmingLanguage: session.programmingLanguage,
        resumeText
      };

      const nextQuestionText = await generateNextQuestion(
        sessionParams, 
        askedQuestionsTexts, 
        questionRecord.questionText, 
        answerRecord.answerText, 
        resultRecord.score
      );

      nextQuestionRecord = await InterviewQuestion.create({
        interviewId: session.id,
        questionText: nextQuestionText,
        difficulty: session.difficulty,
        topic: session.type.toUpperCase(),
      });
    } else {
      isLastQuestion = true;
    }

    res.status(200).json({
      success: true,
      data: {
        ...resultRecord.toJSON(),
        _id: resultRecord.id,
      },
      nextQuestion: nextQuestionRecord ? {
        ...nextQuestionRecord.toJSON(),
        _id: nextQuestionRecord.id
      } : null,
      isLastQuestion
    });
  } catch (error) {
    console.error('Error grading response:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating answer' });
  }
};

// @desc    Finish Session, Calculate Aggregate Report & AI Recommendations
// @route   POST /api/interview/finish
// @access  Private
const finishInterview = async (req, res) => {
  try {
    const { interviewId, duration } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'Please specify interview ID' });
    }

    const session = await Interview.findByPk(interviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const questionsCount = await InterviewQuestion.count({ where: { interviewId: session.id } });
    const answersCount = await InterviewAnswer.count({ where: { interviewId: session.id } });

    if (answersCount < questionsCount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Interview not completed. No score available.' 
      });
    }

    // 1. Gather all graded results
    const resultsList = await InterviewResult.findAll({
      where: { interviewId: session.id }
    });

    const formattedResults = [];
    for (const r of resultsList) {
      const q = await InterviewQuestion.findByPk(r.questionId);
      const a = await InterviewAnswer.findByPk(r.answerId);
      formattedResults.push({
        questionText: q ? q.questionText : '',
        answerText: a ? a.answerText : '',
        score: r.score,
        feedback: r.feedback
      });
    }

    // 2. Query Gemini to compile report
    const report = await generateFinalReport(session, formattedResults);

    // 3. Save report details
    session.overallScore = report.overallScore;
    session.technicalScore = report.technicalScore;
    session.communicationScore = report.communicationScore;
    session.confidenceScore = report.confidenceScore;
    session.problemSolvingScore = report.problemSolvingScore;
    session.behaviorScore = report.behaviorScore;
    session.grammarScore = report.grammarScore;
    session.hiringRecommendation = report.hiringRecommendation;
    session.overallFeedback = report.overallFeedback;
    session.strongAreas = report.strongAreas;
    session.weakAreas = report.weakAreas;
    session.recommendationTopics = report.recommendationTopics;
    session.recommendationDSA = report.recommendationDSA;
    session.recommendationProjects = report.recommendationProjects;
    session.recommendationTips = report.recommendationTips;
    session.recommendationResources = report.recommendationResources;
    session.duration = duration || 0;
    session.status = 'completed';

    await session.save();

    const populatedSession = await mapSession(session);

    res.status(200).json({
      success: true,
      data: populatedSession,
    });
  } catch (error) {
    console.error('Error completing interview session:', error);
    res.status(500).json({ success: false, message: 'Server error compiling final report' });
  }
};

// @desc    Submit Legacy Payload (maps directly to grading / complete checks)
// @route   POST /api/interview/submit
// @access  Private
const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers, duration } = req.body;

    const session = await Interview.findByPk(interviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    for (const ans of answers) {
      const cleanAns = (ans.answerText || '').trim();
      const isSkipped = cleanAns === 'Skipped' || cleanAns === '';
      const answerRecord = await InterviewAnswer.create({
        interviewId: session.id,
        questionId: ans.questionId,
        answerText: isSkipped ? 'Skipped' : cleanAns,
      });

      const questionRecord = await InterviewQuestion.findByPk(ans.questionId);
      let evaluation;

      const wordsList = cleanAns.split(/\s+/).filter(w => w.length > 0);
      const wordsCount = wordsList.length;
      const oneWordRegex = /^(yes|no|ok|okay|idk|maybe|don't know|no idea)$/i;

      if (isSkipped) {
        evaluation = {
          score: 0,
          accuracyScore: 0,
          confidenceScore: 0,
          technicalDepthScore: 0,
          communicationScore: 0,
          grammarScore: 0,
          fluencyScore: 0,
          relevanceScore: 0,
          completenessScore: 0,
          feedback: 'Question was skipped.',
          sampleAnswer: 'No sample answer compiled.',
          strengths: [],
          weaknesses: ['Skipped'],
          missingConcepts: [],
          suggestedImprovements: [],
          betterExplanation: '',
          interviewTip: ''
        };
      } else if (wordsCount < 15 || oneWordRegex.test(cleanAns)) {
        const dynamicTech = Math.floor(Math.random() * 11);
        const dynamicComm = Math.floor(Math.random() * 21);
        const dynamicOverall = Math.floor(Math.random() * 6) + 9;

        evaluation = {
          score: dynamicOverall,
          accuracyScore: 10,
          confidenceScore: 10,
          technicalDepthScore: dynamicTech,
          communicationScore: dynamicComm,
          grammarScore: 20,
          fluencyScore: 10,
          relevanceScore: 20,
          completenessScore: 10,
          feedback: 'Answer is too short.',
          sampleAnswer: 'Sample answer explanation.',
          strengths: [],
          weaknesses: ['Too short'],
          missingConcepts: [],
          suggestedImprovements: [],
          betterExplanation: '',
          interviewTip: ''
        };
      } else {
        evaluation = await evaluateSingleResponse(
          questionRecord ? questionRecord.questionText : 'Question',
          answerRecord.answerText,
          session.type,
          session.targetRole
        );
      }

      await InterviewResult.create({
        interviewId: session.id,
        questionId: ans.questionId,
        answerId: answerRecord.id,
        score: evaluation.score,
        feedback: evaluation.feedback,
        sampleAnswer: evaluation.sampleAnswer,
        accuracyScore: evaluation.accuracyScore,
        confidenceScore: evaluation.confidenceScore,
        technicalDepthScore: evaluation.technicalDepthScore,
        communicationScore: evaluation.communicationScore,
        grammarScore: evaluation.grammarScore,
        fluencyScore: evaluation.fluencyScore,
        relevanceScore: evaluation.relevanceScore,
        completenessScore: evaluation.completenessScore,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        missingConcepts: evaluation.missingConcepts,
        suggestedImprovements: evaluation.suggestedImprovements,
        betterExplanation: evaluation.betterExplanation || '',
        interviewTip: evaluation.interviewTip || ''
      });
    }

    session.duration = duration || 0;
    await session.save();

    // Directly finish
    const finishRes = await finishInterview(req, {
      body: { interviewId, duration }
    }, {
      status: () => ({
        json: (payload) => payload
      })
    });

    res.status(200).json(finishRes);
  } catch (error) {
    console.error('Error submitting mock interview:', error);
    res.status(500).json({ success: false, message: 'Server error processing evaluations' });
  }
};

// @desc    Get user's mock interview history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      where: { userId: req.user.id, status: 'completed' },
      include: [
        { model: InterviewQuestion, as: 'questions' },
        { model: InterviewAnswer, as: 'answers' },
        { model: InterviewResult, as: 'results' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mapped = [];
    for (const i of interviews) {
      const data = await mapSession(i);
      mapped.push(data);
    }

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error) {
    console.error('Error fetching interview logs:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
};

// @desc    Get single mock interview details
// @route   GET /api/interview/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [
        { model: InterviewQuestion, as: 'questions' },
        { model: InterviewAnswer, as: 'answers' },
        { model: InterviewResult, as: 'results' }
      ]
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview report not found' });
    }

    if (interview.userId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized to view this report' });
    }

    const mapped = await mapSession(interview);

    res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error('Error fetching interview details:', error);
    res.status(500).json({ success: false, message: 'Server error loading report details' });
  }
};

module.exports = {
  startInterview,
  gradeAnswer,
  finishInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewById,
};
