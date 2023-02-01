const mongoose = require('mongoose')

const MONGO_URL = 'mongodb+srv://admin_nasa:156728@cluster0.o3urt4v.mongodb.net/nasa?retryWrites=true&w=majority'

mongoose.set('strictQuery', false)

mongoose.connection.on('open', () => {
    console.log("MongoDB connection ready");
})

mongoose.connection.on('error', (err) => {
    console.error(err);
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}
