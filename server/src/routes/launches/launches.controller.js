const {getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById} = require('../../models/launches.model')
const {getPagination} = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    const {skip, limit} = getPagination(req.params)
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches)
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body
    if (!launch.mission || !launch.launchDate || !launch.rocket || !launch.target) {
        return res.status(400).json({error: `Missing required launch property`})
    }

    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid Launch Date'
        })
    }
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch)
}

async function httpAbortLaunch(req, res) {
    const launchID = +req.params.id
    const existLaunch = await existsLaunchWithId(launchID)
    if (!existLaunch) {
        return res.status(400).json({error: 'Launch not found'})
    }
    const aborted = await abortLaunchById(launchID)
    if (!aborted) {
        return res.status(400).json({error: 'Launch not aborted'})
    }
    return res.status(200).json(aborted)

}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}
