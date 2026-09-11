/**
 * AgriSurvey - Backend REST API Server
 * Built with Express.js for full-stack deployment (Render, Railway, Heroku, or Localhost)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

// Data storage directories
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');

// Ensure data folder and seed files exist
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: 'usr-001',
        name: 'Ramesh Patel',
        email: 'farmer@agrisurvey.org',
        mobile: '9876543210',
        password: 'demo',
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }

  if (!fs.existsSync(SURVEYS_FILE)) {
    fs.writeFileSync(SURVEYS_FILE, JSON.stringify([], null, 2));
  }
}

initDatabase();

// Helper functions for reading & writing JSON
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AgriSurvey Backend API',
    version: '1.0.0'
  });
});

// 2. User Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = readJSON(USERS_FILE);
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: 'usr-' + Date.now().toString().slice(-6),
    name,
    email: email.toLowerCase(),
    mobile,
    password, // For production use bcrypt
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.status(201).json({
    message: 'Registration successful',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, mobile: newUser.mobile }
  });
});

// 3. User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readJSON(USERS_FILE);
  const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!matched) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    user: { id: matched.id, name: matched.name, email: matched.email, mobile: matched.mobile }
  });
});

// 4. Submit Survey
app.post('/api/surveys', (req, res) => {
  const surveyData = req.body;

  if (!surveyData || !surveyData.data) {
    return res.status(400).json({ error: 'Invalid survey submission data' });
  }

  const surveys = readJSON(SURVEYS_FILE);
  const submissionId = 'AGRI-' + Date.now().toString().slice(-6);

  const newSubmission = {
    id: submissionId,
    submittedAt: new Date().toISOString(),
    user: surveyData.user || { name: surveyData.data.farmer_name || 'Farmer' },
    data: surveyData.data
  };

  surveys.unshift(newSubmission);
  writeJSON(SURVEYS_FILE, surveys);

  console.log(`[AgriSurvey API] New survey submitted: ${submissionId} by ${newSubmission.user.name}`);

  res.status(201).json({
    message: 'Survey submitted successfully',
    submissionId: submissionId,
    submission: newSubmission
  });
});

// 5. Get All Surveys
app.get('/api/surveys', (req, res) => {
  const surveys = readJSON(SURVEYS_FILE);
  res.json({
    total: surveys.length,
    surveys: surveys
  });
});

// 6. Get Specific Survey by ID
app.get('/api/surveys/:id', (req, res) => {
  const surveys = readJSON(SURVEYS_FILE);
  const found = surveys.find(s => s.id === req.params.id);

  if (!found) {
    return res.status(404).json({ error: 'Survey record not found' });
  }

  res.json(found);
});

// 7. Get Aggregated Statistics
app.get('/api/stats', (req, res) => {
  const surveys = readJSON(SURVEYS_FILE);
  
  let cropCounts = {};
  let totalRating = 0;
  let ratedCount = 0;

  surveys.forEach(s => {
    const d = s.data || {};
    const crop = d.q4_crop || 'Other';
    cropCounts[crop] = (cropCounts[crop] || 0) + 1;

    if (d.q49_satisfaction) {
      totalRating += parseInt(d.q49_satisfaction);
      ratedCount++;
    }
  });

  const avgSatisfaction = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 4.5;

  res.json({
    totalSubmissions: surveys.length,
    cropDistribution: cropCounts,
    averageSatisfaction: avgSatisfaction
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log('=====================================================');
  console.log(`🌾 AgriSurvey Full-Stack Server Running on Port ${PORT}`);
  console.log(`   Local URL:    http://localhost:${PORT}`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api/health`);
  console.log('=====================================================');
});
