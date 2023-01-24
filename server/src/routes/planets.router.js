const express = require('express')
const planetsController = require('./planets.contrlollers')


const planetsRouter = express.Router()

planetsRouter.get('/planets', planetsController.getAllPlanets)

module.exports = planetsRouter
