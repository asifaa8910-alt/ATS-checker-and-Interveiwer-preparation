const fs = require('fs');
const path = require('path');
const { Resume, ResumeAnalysis } = require('../models/index');
const { parseResume } = require('../utils/parser');
const { analyzeResumeHybrids } = require('../utils/atsAnalyzer');

// @desc    Upload, Parse & Analyze Resume (Hybrid engine)
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const jobDescription = req.body.jobDescription || '';

    // 1. Extract plain text content
    let extractedText;
    try {
      extractedText = await parseResume(filePath);
    } catch (parseError) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ success: false, message: parseError.message });
    }

    if (!extractedText.trim()) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ success: false, message: 'Document is empty or could not be parsed' });
    }

    // 2. Perform hybrid analysis (Algorithmic + Gemini AI)
    const analysisResults = await analyzeResumeHybrids(extractedText, jobDescription);

    // 3. Create the Resume record
    const resumeRecord = await Resume.create({
      userId: req.user.id,
      fileName,
      filePath: path.relative(path.join(__dirname, '..'), filePath),
      extractedText,
      atsScore: analysisResults.atsScore,
    });

    // 4. Create the detailed ResumeAnalysis record linked to the resume
    const analysisRecord = await ResumeAnalysis.create({
      resumeId: resumeRecord.id,
      userId: req.user.id,
      ...analysisResults,
    });

    // 5. Update Resume record with the analysis reference
    resumeRecord.latestAnalysisId = analysisRecord.id;
    await resumeRecord.save();

    res.status(201).json({
      success: true,
      data: {
        _id: resumeRecord.id,
        id: resumeRecord.id,
        fileName: resumeRecord.fileName,
        filePath: resumeRecord.filePath,
        atsScore: resumeRecord.atsScore,
        createdAt: resumeRecord.createdAt,
        analysis: {
          ...analysisRecord.toJSON(),
          _id: analysisRecord.id,
          id: analysisRecord.id,
          skillsFound: analysisResults.skillsFound,
          skillsMissing: analysisResults.skillsMissing,
          recruiterSummary: analysisResults.recruiterSummary,
          strengths: analysisResults.strengths,
          weaknesses: analysisResults.weaknesses,
          industryRecommendations: analysisResults.industryRecommendations,
          sectionWiseScores: analysisResults.sectionWiseScores
        },
      },
    });
  } catch (error) {
    console.error('Error uploading/analyzing resume:', error);
    res.status(500).json({ success: false, message: 'Server error analyzing resume' });
  }
};

// @desc    Get user's upload history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    // Find resumes and populate their latest analysis data
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      include: [{ model: ResumeAnalysis, as: 'latestAnalysis' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes.map(r => {
        const analysis = r.latestAnalysis ? r.latestAnalysis.toJSON() : null;
        return {
          _id: r.id,
          id: r.id,
          fileName: r.fileName,
          filePath: r.filePath,
          atsScore: r.atsScore,
          createdAt: r.createdAt,
          analysis: analysis ? {
            ...analysis,
            _id: analysis.id,
            skillsFound: analysis.keywordMatches || [],
            skillsMissing: analysis.keywordGaps || [],
            recruiterSummary: analysis.summary || '',
            strengths: analysis.positives || [],
            weaknesses: analysis.negatives || [],
            industryRecommendations: analysis.suggestions || [],
            sectionWiseScores: {
              formatting: analysis.formattingScore || 0,
              skills: analysis.skillsScore || 0,
              experience: analysis.experienceScore || 0,
              projects: analysis.projectsScore || 0,
              education: analysis.educationScore || 0,
              keywords: analysis.keywordsScore || 0,
              verbs: analysis.verbsScore || 0,
              grammar: analysis.grammarScore || 0
            }
          } : null
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving upload logs' });
  }
};

// @desc    Delete custom resume scan
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found' });
    }

    // Check ownership
    if (resume.userId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this record' });
    }

    // Attempt to delete physical file from disk
    const absolutePath = path.join(__dirname, '..', resume.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (fileError) {
        console.error('Failed to delete physical file from storage:', fileError);
      }
    }

    // Delete associated analyses first
    await ResumeAnalysis.destroy({ where: { resumeId: resume.id } });

    // Delete the resume record
    await resume.destroy();

    res.status(200).json({
      success: true,
      message: 'Resume and analysis records deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ success: false, message: 'Server error deleting audit log' });
  }
};

module.exports = {
  uploadResume,
  getResumeHistory,
  deleteResume,
};
