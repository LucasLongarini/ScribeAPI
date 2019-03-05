const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

router.post('/:courseID', checkAuth, (req, res)=>{
    const content = req.body.content
    const courseID = req.params.courseID

    if(!content || !courseID)
        return res.status(400).json({Error:"Bad Request"})
    const sql = "INSERT INTO post (course_id, user_id, content) VALUES ("+courseID+","+req.authData.id+", ?)"
    con.query(sql, [content], (err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        if(result.affectedRows == 0)
            return res.status.json({Error:"Could not add"})

        res.status(200).json({id:result.insertId,Result:"Success"})
    })
})

router.get('/recent/:courseID',checkAuth, (req,res)=>{
    const courseID = req.params.courseID
    const page = req.query.page

    if(!courseID || !page || isNaN(page) || page < 1)
        return res.status(400).json({Error:"Bad Request"})

    const pageSize = 10
    var startRecord = pageSize*(page-1)

    const sql = "SELECT post.*, user.name, user.picture_path, user.sex, user.fb_id, COALESCE(post_likes.value, 0) AS like_value FROM post INNER JOIN user ON user.id=post.user_id"+
    " LEFT JOIN post_likes ON post_likes.user_id="+req.authData.id+" AND post_likes.post_id=post.id"
    " WHERE post.course_id="+courseID+" ORDER BY post.date DESC LIMIT "+startRecord+", "+pageSize 

    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        

        result.forEach((post)=>{
            var user = {id:post.user_id, name:post.name, picture_path:post.picture_path, sex:post.sex, fb_id:post.fb_id}
            post.user = user
            delete post.user_id; delete post.name; delete post.picture_path; delete post.sex; delete post.fb_id;
        })

        res.status(200).json(result)
    })
})

router.get('/top_rated/:courseID',checkAuth, (req,res)=>{
    const courseID = req.params.courseID
    const page = req.query.page

    if(!courseID || !page || isNaN(page) || page < 1)
        return res.status(400).json({Error:"Bad Request"})

    const pageSize = 10
    var startRecord = pageSize*(page-1)

    const sql = "SELECT post.*, user.name, user.picture_path, user.sex, user.fb_id, COALESCE(post_likes.value, 0) AS like_value FROM post INNER JOIN user ON user.id=post.user_id"+
    " LEFT JOIN post_likes ON post_likes.user_id="+req.authData.id+" AND post_likes.post_id=post.id"
    " WHERE post.course_id="+courseID+" ORDER BY post.votes, post.date DESC LIMIT "+startRecord+", "+pageSize 
    
    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        

        result.forEach((post)=>{
            var user = {id:post.user_id, name:post.name, picture_path:post.picture_path, sex:post.sex, user_type:post.fb_id}
            post.user = user
            delete post.user_id; delete post.name; delete post.picture_path; delete post.sex; delete post.fb_id;
        })

        res.status(200).json(result)
    })
})

router.post('/:postID/vote', checkAuth, (req,res)=>{
    const value = req.query.value
    const postID = req.params.postID
    if(!value  || !postID || isNaN(value))
        return res.status(400).json({Error:"Bad Request"})

    if(value != 1 && value != -1 && value !=2 && value != -2)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "UPDATE post SET votes = votes + "+value+" WHERE id="+postID+";"+
    "INSERT INTO post_likes (user_id, post_id, value) VALUES ("+req.authData.id+","+postID+","+value+") "+
    "ON DUPLICATE KEY UPDATE value=value +"+value

    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        res.status(200).json({Result:"Success"})

    })


})

router.delete('/:postID', checkAuth, (req, res)=>{
    const id = req.params.postID
    if(!id)
        return res.status(400).json({Error:"Bad Request"})
    
    const sql = "DELETE FROM post WHERE id = "+id+" AND user_id ="+req.authData.id

    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        else if(result.affectedRows < 1)
            return res.status(400).json({Error:"Not found"})

        res.status(200).json({Result:"Success"})
    })
})

router.patch('/:postID', checkAuth, (req,res)=>{
    const id = req.params.postID
    const content = req.body.content
    if(!id || !content)
        return res.status(400).json({Error:"Bad Request"})

    const sql = "UPDATE post SET content = ? WHERE id="+id+" AND user_id="+req.authData.id
    con.query(sql, [content], (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        else if(result.affectedRows < 1)
            return res.status(400).json({Error:"Not found"})
        
        res.status(200).json({Result:"Success"})

    })
})

module.exports = router;