const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tollgate_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

// Schemas
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const tollgateSchema = new mongoose.Schema({
    tollgate: { type: String, required: true, unique: true },
    fare: { type: Number, required: true },
});

const vehicleSchema = new mongoose.Schema({
    driverName: { type: String, required: true },
    vehicle: { type: String, required: true },
});

const paymentSchema = new mongoose.Schema({
    driverName: { type: String, required: true },
    tollgate: { type: String, required: true },
    fare: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

// Models
const Admin = mongoose.model('Admin', adminSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Tollgate = mongoose.model('Tollgate', tollgateSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Admin Functions
async function createAdmin(admin) {
    const existingAdmin = await Admin.findOne({ name: admin.name });
    if (existingAdmin) throw new Error('Admin already exists');
    await Admin.create(admin);
}

async function getAdmin(name, password) {
    return await Admin.findOne({ name, password });
}

async function addTollgate(adminName, adminPassword, tollgate) {
    const admin = await getAdmin(adminName, adminPassword);
    if (!admin) throw new Error('Invalid admin credentials');
    const existingTollgate = await Tollgate.findOne({ tollgate: tollgate.tollgate });
    if (existingTollgate) throw new Error('Tollgate already exists');
    await Tollgate.create(tollgate);
}

async function viewVehicles(adminName, adminPassword) {
    const admin = await getAdmin(adminName, adminPassword);
    if (!admin) throw new Error('Invalid admin credentials');
    return await Vehicle.find();
}

async function viewPaidMessages(adminName, adminPassword) {
    const admin = await getAdmin(adminName, adminPassword);
    if (!admin) throw new Error('Invalid admin credentials');
    return await Payment.find();
}

async function createQR(adminName, adminPassword) {
    const admin = await getAdmin(adminName, adminPassword);
    if (!admin) throw new Error('Invalid admin credentials');
    return { message: 'QR code created (mocked)' };
}

// Driver Functions
async function createDriver(driver) {
    const existingDriver = await Driver.findOne({ name: driver.name });
    if (existingDriver) throw new Error('Driver already exists');
    await Driver.create(driver);
}

async function getDriver(name, password) {
    return await Driver.findOne({ name, password });
}

async function searchTollgate(driverName, driverPassword) {
    const driver = await getDriver(driverName, driverPassword);
    if (!driver) throw new Error('Invalid driver credentials');
    return await Tollgate.find();
}

async function addVehicle(driverName, driverPassword, vehicle) {
    const driver = await getDriver(driverName, driverPassword);
    if (!driver) throw new Error('Invalid driver credentials');
    await Vehicle.create({ driverName, vehicle });
}

async function payFare(driverName, driverPassword, payment) {
    const driver = await getDriver(driverName, driverPassword);
    if (!driver) throw new Error('Invalid driver credentials');
    const tollgate = await Tollgate.findOne({ tollgate: payment.tollgate });
    if (!tollgate || tollgate.fare !== payment.fare) throw new Error('Invalid tollgate or fare');
    await Payment.create({ driverName, ...payment });
}

async function scanQR(driverName, driverPassword) {
    const driver = await getDriver(driverName, driverPassword);
    if (!driver) throw new Error('Invalid driver credentials');
    return { message: 'QR code scanned (mocked)' };
}

async function sendSMS(mobile, message) {
    console.log(`SMS to ${mobile}: ${message}`);
}

module.exports = {
    connectDB,
    createAdmin,
    getAdmin,
    addTollgate,
    viewVehicles,
    viewPaidMessages,
    createQR,
    createDriver,
    getDriver,
    searchTollgate,
    addVehicle,
    payFare,
    scanQR,
    sendSMS
};