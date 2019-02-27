const express = require('express')
const router = express.Router()
const con = require('../db')

router.get('/:schoolID/all', (req, res)=>{
    if(!req.query.page || !req.params.schoolID || req.query.page < 1)
        return res.status(400).json({Error:"Bad Request"})
    
    const pageSize = 10
    var startRecord = pageSize*(req.query.page-1)
    const sql = "SELECT * FROM course WHERE school_id="+req.params.schoolID+
    " LIMIT "+startRecord+", "+pageSize
    console.log(sql)
    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Database Error"})
        return res.status(200).json(result)
    })
})
router.get('/:courseId', checkAuth,(req, res)=>{
    const id= req.params.courseId
    if(!id)
        return res.status(400).json({Error:"Bad Request"})
    const sql="SELECT * FROM course WHERE id="+id
    con.query(sql,(err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        if(result.length<=0)
            return res.status(400).json({Error:"Not Found"})
        res.status(200).json(result)
    })
})

module.exports = router;