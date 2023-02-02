const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')

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

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function loadLaunchData() {
    console.log("Downloading launch data...")
   const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })
    if (firstLaunch) {
        console.log("Already exist");
    } else {
        await populateLaunches()
    }
}

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ],
        }
    })

    if (response.status !== 200) {
        console.log("Problem downloading");
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        await saveLaunch(launch)
    }
}

async function findLaunch(filter) {
    return launchesDB.findOne(filter)
}

async function getAllLaunches(skip, limit) {
    return launchesDB.find({}, {'__v': 0, '_id': 0}).sort({ flightNumber: 1}).skip(skip).limit(limit);
}

async function saveLaunch(launch) {


    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })
    if(!planet) {
        throw new Error('No matching planets found')
    }
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
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}
