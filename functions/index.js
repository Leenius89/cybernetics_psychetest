const functions = require('firebase-functions');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

exports.saveResult = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

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

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:H',
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
    res.status(500).json({ error: 'Failed to save data' });
  }
});