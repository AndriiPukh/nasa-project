const express = require('express')
const {httpGetAllPlanets} = require('./planets.contrlollers')


const planetsRouter = express.Router()

planetsRouter.get('/', httpGetAllPlanets)

module.exports = planetsRouter
