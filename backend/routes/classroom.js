const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/checkAuth')
const tutorAuth = require('../middleware/tutorAuth')

const {
    getClassroom,
    createClassroom,
    updateClassroom,
    deleteClassroom
} = require('../controller/classroom')

router.route('/').get([checkAuth],getClassroom).post([tutorAuth],createClassroom)
router.route('/:id').put([tutorAuth],updateClassroom).delete([tutorAuth],deleteClassroom)

module.exports = router

