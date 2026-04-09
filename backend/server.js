const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://med-ai-diagnosis-pi.vercel.app'
  ]
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('OK');
}); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diagnosis', require('./routes/diagnosis'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Symptom Diagnosis API is running' });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
