const express = require('express')
const router = express.Router()

const {
    getClassroomMembers,
    addClassroomMembers,
    deleteClassroomMember
} = require('../controller/classroomMembers')

router.route('/:classroomId/members' ).get(getClassroomMembers).post(addClassroomMembers)
router.route('/members/:id').delete(deleteClassroomMember)

module.exports = router

