const express = require('express');
const app = express();
const { google } = require('googleapis');
const cors = require('cors');
const Replicate = require('replicate');
require('dotenv').config();
const path = require('path');
console.log('Current working directory:', process.cwd());
console.log('server.js path:', __filename);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const auth = new google.auth.GoogleAuth({
  keyFile: './cybernetics-psychetest-b34604286806.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'Sheet1!A:H';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/save-result', async (req, res) => {
  try {
    const {
      userName,
      resultDescription,
      imageUrl,
      perceptionScore,
      intellectScore,
      emotionScore,
      physicalScore,
      extrasensoryScore
    } = req.body;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          userName,
          resultDescription,
          imageUrl,
          perceptionScore,
          intellectScore,
          emotionScore,
          physicalScore,
          extrasensoryScore
        ]],
      },
    });

    res.status(200).json({ message: 'Data saved successfully', response: response.data });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

app.post('/api/generate-image', async (req, res) => {
  console.log('Received request to /api/generate-image');
  console.log('Request body:', req.body);
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const output = await replicate.run(
      "ostris/openflux.1:042cd79629af366fca1c414c17361d886d6f5be5967b367a4fddcfe6b6290293",
      {
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          guidance_scale: 3.5,
          output_quality: 80,
          num_inference_steps: 28
        }
      }
    );

    return res.status(200).json({ imageUrl: output[0] });
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});