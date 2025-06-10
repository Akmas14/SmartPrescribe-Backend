 const updatesTable = require('../Models/updatesModel')
const fs = require("fs");

async function exportUpdatesToJSON() {
 // Fetch all documents from the collection
 const updates = await updatesTable.find({});

 // Write the documents to a JSON file
 const filePath = "./updates.json"; // Path where the file will be saved
 fs.writeFileSync(filePath, JSON.stringify(updates, null, 4), "utf8");
 console.log(`Data exported to ${filePath}`);
}

exportUpdatesToJSON()