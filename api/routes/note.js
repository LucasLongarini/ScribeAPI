const express = require('express')
const router = express.Router()

router.get('/:courseId', (req, res)=>{
    let courseId = req.params.courseId
    let page = req.query.page
})

module.exports = router;