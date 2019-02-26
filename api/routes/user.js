const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const con = require('../db')
const jwt = require('jsonwebtoken')
// const checkAuth = require('../auth')
const cloudinary = require('../cloudinary')

//Need to add a check for unique email
router.post('/register_email', (req,res)=>{
    var email = req.body.email
    var password = req.body.password
    var name = req.body.name
    var sex = req.body.sex

    if(!email || !name || !password || !sex || sex != "male" || sex != "female") 
        return res.status(400).json({"Error":"Bad Request"})

    bcrypt.hash(password, 10, (error, hash)=>{
        if(error)
            return res.status(500).json({"Error":"Server Error"})

        var sql = "INSERT INTO user (name, sex, user_type) VALUES('"+name+"','"+sex+"','email')"
        con.query(sql, (err, result)=>{
            if(err)
                return res.status(500).json({"Error":"Server Error"})
            sql = "INSERT INTO email_user (id, email, password) VALUES ('"+result.insertId+"','"+email+"','"+hash+"')"
            con.query(sql, (err, finalResult)=>{
                if(err)
                    return res.status(500).json({"Error":"Server Error"})

                const token = jwt.sign({id:result.insertId, email:email}, process.env.JWT_SECRET)
                res.status(200).json({"id":result.insertId,"token":token})
            })
        })
    })
    
})

router.post('/login_email', (req,res)=>{
    const email = req.body.email
    const password = req.body.password

    if(!email || !password) 
        return res.status(400).json({"Error":"Bad Request"})

    var sql = "SELECT * FROM email_user WHERE email="+"'"+email+"'"
    con.query(sql, (err, result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({"Error":"Server Error"})
        }
        else if (result.length < 1)
            return res.status(400).json({"Error":"Auth Failed"})
      
        var hashedPass = result[0].password
        bcrypt.compare(password, hashedPass,(err, good)=>{
            if(err)
                return res.status(500).json({"Error":"Server Error"})
            
            else if(!good)
                return res.status(400).json({"Error":"Auth Failed"})
            
                const token = jwt.sign({id: result[0].id, email: result[0].email},process.env.JWT_SECRET)
                res.status(200).json({id: result[0].id, token: token})
        })

        
    })

})

router.get('/:userId', (req, res)=>{
    const id = req.params.userId
    if(!id)
        return res.status(400).json({"Error":"Bad Request"})
    const sql = "SELECT user.*, fb_user.fb_id FROM user LEFT JOIN fb_user ON user.id = fb_user.id WHERE user.id = "+id
    con.query(sql, (err, result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({"Error":"Server Error"})
        }
        else if (result.length <= 0)
            return res.status(400).json({"Error":"Not Found"})

        res.status(200).json(result[0])
    })
 
})

router.post('/picture', (req, res)=>{
    var data = new Buffer('');
    req.on('data', (chunk)=>{
        data = Buffer.concat([data, chunk]);
    });
    req.on('end', ()=>{
        // var id = "user_"+req.authData.id
        var id = "user_1"
        cloudinary.v2.uploader.upload_stream({resource_type: 'image', public_id:id}, (error, result)=>{
            if(error)
                return res.status(500).json({Error:"Server Error"})
            
            var sql = "UPDATE user SET picture_path ='"+result.public_id+"'" +
                        // " WHERE user_id = "+req.authData.id
                        " WHERE id = 1"

            con.query(sql, (err)=>{
                if(err)return res.status(500).json({Error:"Server Error"})
                else return res.status(200).json({Response:"Successful"})
            })
            
        }).end(data);
    });
})

router.get('/authenticate',(req,res)=>{
    
})

module.exports = router;