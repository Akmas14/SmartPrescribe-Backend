require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
//const { logger } = require('./Middleware/logger');
//const errorHandler = require('./Middleware/ErrorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const bodyParser = require("body-parser");
const http = require('http'); // Import the http module
const Medication = require('./Models/medicationModel')
const conditions = require('./Models/conditionModel')
const Avoid = require('./Models/avoidModel')
const Caution = require('./Models/cautionModel')
const Interaction = require('./Models/interactionModel')
const Renal = require('./Models/renalModel')
const Syndrome = require('./Models/syndromeModel')
const Symptom = require('./Models/symptomModel')
const Updates = require('./Models/updatesModel')
const authRouter = require('./Routes/authRoutes')
const physicianRoutes = require('./Routes/physicianRoutes')
const authenticateJWT = require('./Middleware/authenticateJWT')
const patientRoutes = require('./Routes/patientRoutes')

const PORT = process.env.PORT
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(cors())
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use(authenticateJWT)
app.use('/physician',physicianRoutes)
app.use('/patient',patientRoutes)

router.get('/medications', async (req, res) => {
  try {
    const medications = await Medication.find(); // Fetch all medications
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const conds = [
  {"Name": "Diabetes with osteoporosis"},
  {"Name": "Chronic constipation"}
]

const fs = require("fs");
const cron = require("node-cron");
async function exportUpdatesToJSON() {
 // Fetch all documents from the collection
 const updates = await Updates.find({});

 // Write the documents to a JSON file
 const filePath = "./MachineLearningModel/updates.json"; // Path where the file will be saved
 fs.writeFileSync(filePath, JSON.stringify(updates, null, 4), "utf8");
 console.log(`Data exported to ${filePath}`);
}
async function exportMedsToJson(){
  const medications = await Medication.find({})

  // Extract unique medication names and encode them
  const medicationNames = medications.map((med) => med.Medication);
  const uniqueMedications = [...new Set(medicationNames)];
  const medicationMapping = uniqueMedications.reduce((acc, med, index) => {
      acc[med] = index;
      return acc;
  }, {});

  // Save the mapping to a JSON file
  fs.writeFileSync('./MachineLearningModel/medication_mapping.json', JSON.stringify(medicationMapping, null, 4), "utf8");
  console.log('Medication mapping saved to medication_mapping.json');
}
cron.schedule("0 0 * * 1", () => {
  console.log("Running weekly export...");
  exportUpdatesToJSON();
  exportMedsToJson()
});
const server = http.createServer(app); // Create the server


const connectDB = async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
    } catch (err) {
      console.log(err);
    }
  
  }
  
  
  connectDB();
  
  mongoose.connection.once('open', () => {
  
    console.log('Connected to MongoDB');
    //   backupMongoDB();
    //const caution = Caution.insertMany(caut)
    //const syndrome = Syndrome.insertMany(synd)
    // const inter = Interaction.insertMany(interactions)
    // const renal = Renal.insertMany(ren)
    // const avoid = updates.insertMany(update)
    //const tmp = conditions.insertMany(conds)
    // Symptom.init()
    // .then(() => {
    //     console.log('Avoid collection and indexes created!');
    // })
    // .catch(err => {
    //     console.error('Error initializing collection:', err);
    // });
    
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
  
  });
  
  
  mongoose.connection.on('error', err => {
    console.log(err);
    //logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
  
  });