const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

router.post('/:courseID', checkAuth, (req,res)=>{
    const courseID = req.params.courseID
    const file_paths = req.body.file_paths
    if(!courseID || !file_paths || file_paths.length == 0)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "INSERT INTO note (course_id, user_id) VALUES ("+courseID+","+req.authData.id+")"
    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        else if(result.affectedRows == 0)
            return res.status.json({Error:"Could not add"})

        const noteId = result.insertId
        var filePathSQl= "INSERT INTO file_path (note_id, file_path, ext) VALUES "

        for(var i = 0; i<file_paths.length; i++){
            var path = file_paths[i]
            var values = "("+noteId+",'"+path.path+"','"+path.ext+"')"
            if(i<(file_paths.length-1))
                values += ","
    
            filePathSQl += values
        }

        con.query(filePathSQl, (err2, result2)=>{
            if(err2)
                return res.status(500).json({Error:"Server Error"})

            res.status(200).json({Result:"Success"})
        })

    })
  
})


router.get('/:courseID', checkAuth, (req,res)=>{
    const courseID = req.params.courseID
    const page = req.query.page
    if(!courseID || !page || isNaN(page) || page < 1)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "SELECT note.*, file_path.* FROM note, file_path WHERE note.course_id="+courseID + " AND file_path.note_id=note.id"
    console.log(sql)
    con.query(sql, (err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        res.status(200).json(result)
    })

})


module.exports = router;