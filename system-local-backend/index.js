const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path'); // This line is added

// --- SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

// This part is updated to correctly find the file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const PORT = 3001;
// --- END SETUP ---


// --- API ENDPOINTS ---

// Endpoint for the utility to report data
app.post('/api/report', async (req, res) => {
  try {
    const { machine_id, os, system_info } = req.body;

    if (!machine_id || !os || !system_info) {
      return res.status(400).send("Missing required fields.");
    }

    const machineData = {
      os: os,
      last_seen: new Date().toISOString(),
      ...system_info,
    };

    await db.collection('machines').doc(machine_id).set(machineData, { merge: true });
    console.log(`Data received for machine: ${machine_id}`);
    res.status(200).send(`Data for ${machine_id} saved.`);
  } catch (error) {
    console.error("Error in /api/report:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint for the React frontend to get all machine data
app.get('/api/machines', async (req, res) => {
  try {
    const machinesRef = db.collection('machines');
    const snapshot = await machinesRef.orderBy('last_seen', 'desc').get();
    
    if (snapshot.empty) {
      return res.json([]);
    }

    const machines = [];
    snapshot.forEach(doc => {
      machines.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(machines);
  } catch (error) {
    console.error("Error in /api/machines:", error);
    res.status(500).send("Internal Server Error");
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Local server running on http://localhost:${PORT}`);
  console.log('Waiting for data from utilities...');
});