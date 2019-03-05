const express = require('express')
const router = express.Router()
const con = require('../db')
const checkAuth = require('../auth')

//TODO: increment comment to the post
router.post('/:postID', checkAuth, (req, res)=>{
    const content = req.body.content
    const postID = req.params.postID

    if(!content || !postID)
        return res.status(400).json({Error:"Bad Request"})
    const sql = "INSERT INTO comment (post_id, user_id, content) VALUES ("+postID+","+req.authData.id+", ?)"
    con.query(sql, [content], (err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})
        
        if(result.affectedRows == 0)
            return res.status.json({Error:"Could not add"})

        res.status(200).json({id:result.insertId,Result:"Success"})
    })
})

router.get('/:postID', checkAuth, (req,res)=>{
    const postID = req.params.postID
    const page = req.query.page

    if(!postID || !page || isNaN(page) || page < 1)
        return res.status(400).json({Error:"Bad Request"})

    const pageSize = 10
    var startRecord = pageSize*(page-1)

    const sql = "SELECT comment.*, user.name, user.picture_path, user.sex, user.fb_id, COALESCE(comment_likes.value, 0) AS like_value FROM comment INNER JOIN user ON user.id=comment.user_id"+
                " LEFT JOIN comment_likes ON comment_likes.user_id="+req.authData.id+" AND comment_likes.comment_id=comment.id"
                " WHERE comment.post_id="+postID+" ORDER BY comment.date DESC LIMIT "+startRecord+", "+pageSize 

    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({Error:"Server Error"})

        result.forEach((comment)=>{
            var user = {id:comment.user_id, name:comment.name, picture_path:comment.picture_path, sex:comment.sex, fb_id:comment.fb_id}
            comment.user = user
            delete comment.user_id; delete comment.name; delete comment.picture_path; delete comment.sex; delete comment.fb_id;
        })
        
        res.status(200).json(result)
    })
})

module.exports = router;