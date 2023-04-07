const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const odooConnection = require('./odoo');
const quickbooksConnection = require('./qb');
const {connect} = require("mongoose");
const Configuration = require('./Configuration');
const morgan = require("morgan");

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));


connect('mongodb://localhost:27017/blocktea?replicaSet=rs0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));


const url = '172.20.73.31:8069';
const db = 'demo';
const username = 'fyl155165@gmail.com';
const password = 'fyl200165';

app.post('/accounts/:vendor', async (req, res) => {
    try {
        if (req.params.vendor === 'odoo') {
            const connection = odooConnection(url, db, username, password);
            const accounts = await connection.fetchAccounts();
            res.json(accounts);
        } else if (req.params.vendor === 'quickbooks') {
            const connection = quickbooksConnection();
            const accounts = await connection.fetchAccounts();
            res.json(accounts);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Error fetching accounts' });
    }
});

// Get configurations
app.get('/configurations', async (req, res) => {
    try {
        const configurations = await Configuration.find();
        res.json(configurations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching configurations', error });
    }
});

// Create configuration
app.post('/configurations', async (req, res) => {
    try {
        const configuration = new Configuration(req.body);
        await configuration.save();
        res.status(201).json(configuration);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating configuration', error });
    }
});

// Update configuration
app.put('/configurations/:id', async (req, res) => {
    try {
        const configuration = await Configuration.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!configuration) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.status(200).json(configuration);
    } catch (error) {
        res.status(500).json({ message: 'Error updating configuration', error });
    }
});

// Delete configuration
app.delete('/configurations/:id', async (req, res) => {
    try {
        const configuration = await Configuration.findByIdAndDelete(req.params.id);
        if (!configuration) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.status(204).json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting configuration', error });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
