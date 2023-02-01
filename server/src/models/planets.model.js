const { parse } = require('csv-parse')
const fs = require('fs')

const planets = require('./planets.mongo')

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream('src/data/kepler_data.csv')
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                   await savePlanet(data)
                }
            })
            .on('error', (err) => {
                console.log(err, "err");
                reject(err)
            })
            .on('end', async () => {
                const countPlanetFound = (await getAllPlanets()).length
                console.log(`${countPlanetFound} Habitable planets found`);
                resolve()
            })
    })
}

async function getAllPlanets() {
    return await planets.find({}, {'__v': 0, '__id': 0})
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        },{
            upsert: true
        })
    } catch (err) {
        console.error(`Could note save planet ${err}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}
