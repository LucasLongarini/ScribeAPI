const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

router.post('/:courseID', checkAuth, (req, res)=>{
    const content = req.body.content
    const courseID = req.params.courseID

    if(!content || !courseID)
        return res.status(400).json({Error:"Bad Request"})
    const sql = "INSERT INTO post (course_id, user_id, content) VALUES ("+courseID+","+req.authData.id+",'"+content+"')"
    con.query(sql, (err,result)=>{
        if(err)
        {
            console.log(err)
            return res.status(500).json({Error:"Server Error"})
        }
        if(result.affectedRows == 0)
            return res.status.json({Error:"Could not add"})

        res.status(200).json({Result:"Success"})
    })
})

module.exports = router;