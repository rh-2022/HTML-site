const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const url = process.env.MONGODB_URI;
const dbName = 'copilotDB';
let db;

app.use(bodyParser.json());

async function connectToMongoDB() {
    console.log('Attempting to connect to MongoDB...');
    try {
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

connectToMongoDB();

app.post('/capture-input', async (req, res) => {
    console.log('Received a POST request to /capture-input');
    console.log('Request body:', req.body);

    if (!db) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }

    const userInput = req.body.input;
    console.log('User input received:', userInput);

    try {
        const result = await db.collection('inputs').insertOne({ input: userInput });
        console.log('Input saved to database:', result);
        res.status(200).send('Input received successfully');
    } catch (err) {
        console.error('Failed to save input to database:', err);
        res.status(500).send('Failed to save input to database');
    }
});

app.get('/get-inputs', async (req, res) => {
    console.log('Received a GET request to /get-inputs');

    if (!db) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }

    try {
        const results = await db.collection('inputs').find({}).toArray();
        console.log('Retrieved inputs from database:', results);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to retrieve inputs from database:', err);
        res.status(500).send('Failed to retrieve inputs from database');
    }
});

console.log('server.js end reached');