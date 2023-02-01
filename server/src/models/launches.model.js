const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100

async function existsLaunchWithId(launchId) {
    return launchesDB.findOne({flightNumber: launchId})
}

async function getLatestFightNumber() {
    const latestLaunch = await launchesDB.findOne({}).sort('-flightNumber')

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber
}

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-296 A f',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true
}

saveLaunch(launch)

async function getAllLaunches() {
    return launchesDB.find({}, {'__v': 0, '_id': 0});
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if(!planet) {
        throw new Error('No matching planets found')
    }

    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) {
    const latestFlightNumber = await getLatestFightNumber() + 1
    const newLaunch = Object.assign(launch,{
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: latestFlightNumber
    })

    await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDB.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    })

    return aborted.modifiedCount === 1
}
module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}
