const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tollgate_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicles: [{ type: String }],
  payments: [{
    tollgate: String,
    fare: Number,
    timestamp: { type: Date, default: Date.now },
  }],
});

const tollgateSchema = new mongoose.Schema({
  tollgate: { type: String, required: true, unique: true },
  fare: { type: Number, required: true },
});

// Models
const Admin = mongoose.model('Admin', adminSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Tollgate = mongoose.model('Tollgate', tollgateSchema);

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index1.html'));
});

// Admin Routes
app.post('/api/admin/register', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }
  try {
    const existingAdmin = await Admin.findOne({ name });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new Admin({ name, password });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } /*catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: 'Server error during admin registration' });
  }*/
    catch (err) {
      console.error('Registration error:', err);
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate name. Use a different name.' });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: 'Server error during registration', details: err.message });
    }
    
});

app.post('/api/admin/login', async (req, res) => {
  const { name, password } = req.body;
  const admin = await Admin.findOne({ name, password });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Admin logged in successfully' });
});

app.post('/api/admin/add-tollgate', async (req, res) => {
  const { name, password, tollgate, fare } = req.body;
  try {
    const admin = await Admin.findOne({ name, password });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    const existingTollgate = await Tollgate.findOne({ tollgate });
    if (existingTollgate) return res.status(400).json({ message: 'Tollgate already exists' });
    const newTollgate = new Tollgate({ tollgate, fare });
    await newTollgate.save();
    res.json({ message: 'Tollgate added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/view-vehicles', async (req, res) => {
  const { name, password } = req.query;
  try {
    const admin = await Admin.findOne({ name, password });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    const drivers = await Driver.find({}, 'name vehicles');
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/view-paid-messages', async (req, res) => {
  const { name, password } = req.query;
  try {
    const admin = await Admin.findOne({ name, password });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    const drivers = await Driver.find({}, 'name payments');
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/qr-create', async (req, res) => {
  const { name, password } = req.body;
  try {
    const admin = await Admin.findOne({ name, password });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    res.json({ message: 'QR code created (mocked)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver Routes
app.post('/api/driver/register', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    const existingDriver = await Driver.findOne({ name });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    const driver = new Driver({ name, password, vehicles: [], payments: [] });
    await driver.save();
    res.status(201).json({ message: 'Driver registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate name. Use a different name.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Server error during registration', details: err.message });
  }
  /*catch (err) {
    console.error('Driver registration error:', err);
    res.status(500).json({ error: 'Server error during driver registration' });
  }*/
});

app.post('/api/driver/login', async (req, res) => {
  const { name, password } = req.body;
  const driver = await Driver.findOne({ name, password });
  if (!driver) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Driver logged in successfully', driver });
});

app.get('/api/driver/search-tollgate', async (req, res) => {
  const { name, password } = req.query;
  try {
    const driver = await Driver.findOne({ name, password });
    if (!driver) return res.status(401).json({ message: 'Invalid driver credentials' });
    const tollgates = await Tollgate.find();
    res.json({ tollgates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/driver/add-vehicle', async (req, res) => {
  const { name, password, vehicle } = req.body;
  try {
    const driver = await Driver.findOne({ name, password });
    if (!driver) return res.status(401).json({ message: 'Invalid driver credentials' });
    driver.vehicles.push(vehicle);
    await driver.save();
    res.json({ message: 'Vehicle added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/driver/pay-fare', async (req, res) => {
  const { name, password, tollgate, fare } = req.body;
  try {
    const driver = await Driver.findOne({ name, password });
    if (!driver) return res.status(401).json({ message: 'Invalid driver credentials' });
    const tollgateExists = await Tollgate.findOne({ tollgate, fare });
    if (!tollgateExists) return res.status(400).json({ message: 'Tollgate or fare invalid' });
    driver.payments.push({ tollgate, fare });
    await driver.save();
    res.json({ message: 'Fare paid successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/driver/qr-scan', async (req, res) => {
  const { name, password } = req.body;
  try {
    const driver = await Driver.findOne({ name, password });
    if (!driver) return res.status(401).json({ message: 'Invalid driver credentials' });
    res.json({ message: 'QR code scanned (mocked)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// View Database Endpoint
app.get('/api/view-database', async (req, res) => {
  try {
    const collections = ['admins', 'drivers', 'tollgates'];
    const dbInfo = {};
    for (const collection of collections) {
      dbInfo[collection] = await mongoose.model(collection.charAt(0).toUpperCase() + collection.slice(1)).find();
    }
    res.json({ database: dbInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});