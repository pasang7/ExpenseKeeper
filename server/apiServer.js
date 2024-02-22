const express = require('express');
var cors = require('cors')
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

// Global for general use
var currCollection;

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://12210663:12210663@cluster1.p7cpxfx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
currCollection = client.db("Assignment3").collection("Assignment3");
console.log('Database up!');

app.get('/', (req, res) => {
    res.send('Hello World!')
})

//uploading data to cloud
app.post('/uploadData', async (req, res) => {
    const dataToUpload = req.body;

    if (!dataToUpload || dataToUpload.length === 0) {
        console.log('No data to upload.');
        return res.status(400).send('No data to upload.');
    }

    const collection = client.db('Assignment3').collection('Assignment3');

    try {
        const result = await collection.insertMany(dataToUpload);
        console.log('Data Uploaded to cloud');
        res.send(result);
    } catch (error) {
        console.error('Error uploading data:', error);
        res.status(500).send('Error uploading data to cloud.');
    }
});

// Retrieve cloud data
app.get('/getCloudData', async (req, res) => {
    const collection = client.db('Assignment3').collection('Assignment3');
    try {
        const result = await collection.find({}).toArray();
        if (result.length > 0) {
            // If there is data to show
            console.log('Cloud data displayed.');
            res.send(result);
        } else {
            // If there is no data to show
            console.log('No cloud data to show.');
            res.send([]);
        }
    } catch (error) {
        console.error('Error retrieving cloud data:', error);
        res.status(500).send('Error retrieving cloud data.');
    }
});


//deleting cloud data 
app.get('/deleteCloudData', async (req, res) => {
    const collection = client.db('Assignment3').collection('Assignment3');
    try {
        const result = await collection.deleteMany(req.body);
        if (result.deletedCount > 0) {
            console.log('Data deleted from cloud.');
            res.send('Data deleted from cloud.');
        } else {
            console.log('No data found to delete.');
            res.send('No data found to delete.');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send('Error deleting data from cloud.');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});