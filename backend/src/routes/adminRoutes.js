const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getResumes,
  deleteResume,
  getInterviews,
  deleteInterview,
  getLogs,
  pruneLogs,
  getCompanies,
  createCompany,
  deleteCompany,
  getLearningResources,
  createLearningResource,
  deleteLearningResource
} = require('../controllers/adminController');

// Protect all routes and enforce Admin validation
router.use(protect);
router.use(admin);

router.get('/stats', getStats);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/resumes')
  .get(getResumes);

router.route('/resumes/:id')
  .delete(deleteResume);

router.route('/interviews')
  .get(getInterviews);

router.route('/interviews/:id')
  .delete(deleteInterview);

router.get('/logs', getLogs);
router.post('/logs/prune', pruneLogs);

router.route('/companies')
  .get(getCompanies)
  .post(createCompany);

router.route('/companies/:id')
  .delete(deleteCompany);

router.route('/learning')
  .get(getLearningResources)
  .post(createLearningResource);

router.route('/learning/:id')
  .delete(deleteLearningResource);

module.exports = router;

