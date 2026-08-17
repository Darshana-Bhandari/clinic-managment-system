import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Clinic Management API is running',
  });
});

router.get('/health', (req, res) => {
  return res.json({
    success: true,
    message: 'Clinic management system',
  });
});

export default router;