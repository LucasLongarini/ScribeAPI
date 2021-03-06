const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

router.get('/get_course', checkAuth,(req, res)=>{
    const id= req.query.id
    if(!id)
        return res.status(400).json({Error:"Bad Request"})
    // const sql="SELECT * FROM course WHERE id="+id
    // con.query(sql,(err,result)=>{
    //     if(err)
    //         return res.status(500).json({Error:"Server Error"})
    //     if(result.length<=0)
    //         return res.status(400).json({Error:"Not Found"})
    //     res.status(200).json(result[0])
    // })
    GetCourse(id,(err, result)=>{
        if(err)
            return res.status(500).json({Error:err})
        res.status(200).json(result)  
    })
})

const GetCourse = (id, callback)=>{
    const sql="SELECT * FROM course WHERE id="+id
    con.query(sql,(err,result)=>{
        if(err){
            callback("Error: Server Error",null)
            return
        }
        if(result.length<=0){
            callback("Error: Not Found",null)
            return
        }
        callback(null,result[0])
    })
}

router.get('/subscribed', checkAuth, (req,res)=>{
    const sql = "SELECT course.id, course.school_id, course.name, course.number, subscribed.date,"+
    " (SELECT COUNT(subscribed.user_id) FROM subscribed WHERE subscribed.course_id = course.id) AS number_enrolled"+
    " FROM course INNER JOIN subscribed ON course.id=subscribed.course_id WHERE subscribed.user_id = "+req.authData.id+
    " ORDER BY subscribed.date"
    con.query(sql, (err, result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({Error:"Server Error"})
        }
        
        res.status(200).json(result)
    })
})

router.post('/subscribe', checkAuth, (req,res)=>{
    const course = req.body.course.toUpperCase()
    const number = req.body.number
    const schoolID = req.body.schoolID
    if(!course || !number || !schoolID)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "INSERT INTO subscribed (course_id, user_id) "+
                "SELECT id, '"+req.authData.id+"' FROM course WHERE school_id = "+schoolID+" AND name = '"+course+"' AND number = "+number

    con.query(sql, (err, result)=>{
        if (err){
            console.log(err)
            return res.status(500).json({Error:"Server Error"})
        }
        
        else if (result.affectedRows < 1)
            return res.status(400).json({Error:"Not Found"})
        
        res.status(200).json({Result:"Success"})
    })
})

router.delete('/unsubscribe', checkAuth, (req, res)=>{
    const courseID = req.query.courseID
    if(!courseID)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "DELETE FROM subscribed WHERE course_id="+courseID+" AND user_id="+req.authData.id
    con.query(sql, (err,result)=>{
        if (err)
            return res.status(500).json({Error:"Server Error"})
        else if (result.affectedRows < 1)
            return res.status(400).json({Error:"Not Found"})

        res.status(200).json({Result:"Success"}) 
    })
})

module.exports = router;