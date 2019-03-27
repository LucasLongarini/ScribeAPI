const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

router.post('/:courseID', checkAuth, (req,res)=>{
    const courseID = req.params.courseID
    const file_paths = req.body.file_path
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

    const pageSize = 3
    var startRecord = pageSize*(page-1)

    const sql = "SELECT note.*, user.id AS user_id, user.name, user.picture_path, user.sex, user.user_type, user.fb_id, COALESCE(note_likes.value, 0) AS like_value FROM note "+
                " INNER JOIN user ON user.id=note.user_id LEFT JOIN note_likes ON note_likes.note_id=note.id AND note_likes.user_id="+req.authData.id+
                " WHERE note.course_id="+courseID+" ORDER BY note.id DESC LIMIT "+startRecord+", "+pageSize
    con.query(sql, (err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        else if(result.length == 0)
            return res.status(200).json([])

        for(i=0; i<result.length; i++){
            var user = {id:result[i].user_id, name:result[i].name, picture_path:result[i].picture_path, sex:result[i].sex, user_type:result[i].user_type, fb_id:result[i].fb_id}
            result[i].user = user
            delete result[i].user_id; delete result[i].name; delete result[i].picture_path; delete result[i].sex; delete result[i].fb_id;delete result[i].user_type
        }
        
        var fileSql = "SELECT * FROM file_path WHERE note_id="+result[0].id
        for(var i=1; i<result.length; i++)
            fileSql += " OR note_id="+result[i].id
        
        fileSql += " ORDER BY note_id DESC"

        con.query(fileSql, (err, fileResult)=>{
            if(err)
                return res.status(500).json({Error:"Server Error"})
            
                
                for(var i=0, j=0; i<result.length; i++){
                    result[i].file_path = []
                    while(j<fileResult.length){
                        if(fileResult[j].note_id===result[i].id){
                            result[i].file_path.push(fileResult[j])
                            j++
                        }
                        else
                            break;                        
                    }

                }
            
            res.status(200).json(result)
        })
    })

})

router.delete('/:noteID', checkAuth, (req,res)=>{
    const noteID = req.params.noteID
    if(!noteID)
        return res.status(400).json({Error:"Bad Request"})
    
    const sql = "DELETE FROM note WHERE id="+noteID+" AND user_id="+req.authData.id
    con.query(sql,(err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server error"})

        if(result.affectedRows < 1)
            return res.status(400).json({Error:"Not found"})

        res.status(200).json({Result:"Success"})

    })
})

router.post('/:noteID/vote', checkAuth, (req,res)=>{
    const value = req.query.value
    const noteID = req.params.noteID
    if(!value  || !noteID || isNaN(value))
        return res.status(400).json({Error:"Bad Request"})

    if(value != 1 && value != -1 && value !=2 && value != -2)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "UPDATE note SET votes = votes + "+value+" WHERE id="+noteID+";"+
    "INSERT INTO note_likes(user_id, note_id, value) VALUES ("+req.authData.id+","+noteID+","+value+") "+
    "ON DUPLICATE KEY UPDATE value=value +"+value

    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        res.status(200).json({Result:"Success"})

    })


})

module.exports = router;
