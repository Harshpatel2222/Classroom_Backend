const express = require('express')
const router = express.Router()

const {
    getTutors,
    getStudents
} = require('../controller/users')

router.route('/tutors').get(getTutors)
router.route('/students').get(getStudents)

module.exports = router

