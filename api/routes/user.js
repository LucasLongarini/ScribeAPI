const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const con = require('../db')
const jwt = require('jsonwebtoken')
const checkAuth = require('../auth')
const cloudinary = require('../cloudinary')
var FacebookTokenStrategy = require('passport-facebook-token');
var passport = require('passport');


passport.use(new FacebookTokenStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    fbGraphVersion: 'v3.0'
  }, function(accessToken, refreshToken, profile, done) {
    let user = {
        'name': profile.displayName,
        'fb_id': profile.id,
      }
      return done(null, user);
  }))

router.post('/login_facebook',passport.authenticate('facebook-token',{session: false}), (req,res)=>{
    const user = req.user
    if(!user)
        res.status(400).json({Error:"Auth Failed"})
    
    var sql = "INSERT INTO user (name, user_type, fb_id) VALUES (?, 'facebook', "+user.fb_id+")"

    con.query(sql,[user.name.toLowerCase()], (err,result)=>{
        if(err){
            if(err.errno==1062){
                sql = "SELECT user.* FROM user WHERE fb_id="+user.fb_id
                con.query(sql,(err,result)=>{
                    if(err)
                        return res.status(500).json({Error:"Server error"})
                    else if(result.lenght==0)
                        return res.status(500).json({Error:"Server error"})
                    else{
                        var token = jwt.sign({id:result[0].id, email:"fb"}, process.env.JWT_SECRET)
                        res.status(200).json({"user":result[0],"token":token})
                        return
                    }
                })
            }
            else
                return res.status(500).json({Error:"Server error"})
        }
        else if(result.affectedRows==0)
            return res.status(500).json({Error:"Server error"})
        
        else{
            user.id=result.insertId
            user.picture_path=null;
            user.sex = null
            user.user_type = "facebook"
            var token2 = jwt.sign({id:result.insertId, email:"fb"}, process.env.JWT_SECRET)
            res.status(200).json({"user":user,"token":token2})
        }
        
    })
    
})

router.post('/register_email', (req,res)=>{
    var email = req.body.email
    var password = req.body.password
    var name = req.body.name
    var sex = req.body.sex
    var picturePath = req.body.picture_path

    if(!email || !name || !password || !sex) 
        return res.status(400).json({"Error":"Bad Request"})

    if(!validateEmail(email))
        return res.status(400).json({"Error":"Not a valid email address"})

    bcrypt.hash(password, 10, (error, hash)=>{
        if(error)
            return res.status(500).json({"Error":"Server Error"})

        var sql = "INSERT INTO user (name, sex, user_type, picture_path) "+
                  "SELECT * FROM (SELECT '"+name.toLowerCase()+"','"+sex.toLowerCase()+"','email',?) AS temp "+
                  "WHERE NOT EXISTS (SELECT email FROM email_user WHERE email = '"+email.toLowerCase()+"') LIMIT 1"
        con.query(sql,[picturePath], (err, result)=>{
            if(err)
                return res.status(500).json({"Error":"Server Error"})
            
            if(result.affectedRows == 0)
                return res.status(409).json({Error:"Email is already in use"})
            
            sql = "INSERT INTO email_user (id, email, password) VALUES ('"+result.insertId+"','"+email.toLowerCase()+"','"+hash+"')"
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

    var sql = "SELECT email_user.*, user.* FROM email_user"+
              " INNER JOIN user ON user.id = email_user.id WHERE email_user.email="+"'"+email+"'"
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

                const user = {
                    id:result[0].id,
                    name:result[0].name,
                    picture_path:result[0].picture_path,
                    sex:result[0].sex,
                    user_type:result[0].user_type,
                    fb_id:result[0].fb_id
                }
                const token = jwt.sign({id: result[0].id, email: result[0].email},process.env.JWT_SECRET)
                res.status(200).json({user: user, token: token})
        })

        
    })

})

router.get('/:userId', checkAuth,(req, res)=>{
    const id = req.params.userId
    if(!id)
        return res.status(400).json({"Error":"Bad Request"})
    const sql = "SELECT * FROM user WHERE id = "+id
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

router.post('/picture', checkAuth,(req, res)=>{
    var data = new Buffer('');
    req.on('data', (chunk)=>{
        data = Buffer.concat([data, chunk]);
    });
    req.on('end', ()=>{
        var id = "user_"+req.authData.id
        cloudinary.v2.uploader.upload_stream({resource_type: 'image', public_id:id}, (error, result)=>{
            if(error)
                return res.status(500).json({Error:"Server Error"})
            
            var sql = "UPDATE user SET picture_path ='"+result.public_id+"'" +
                        " WHERE id = "+req.authData.id
                        // " WHERE id = 1"

            con.query(sql, (err)=>{
                if(err)return res.status(500).json({Error:"Server Error"})
                else return res.status(200).json({Response:"Successful"})
            })
            
        }).end(data);
    });
})

router.post('/authenticate', checkAuth, (req,res)=>{
    const sql = "SELECT * FROM user WHERE id="+req.authData.id
    con.query(sql, (err,result)=>{
        if(err)
            return res.status(500).json({Error:"Server error"})
        else if(result.lenght == 0)
            return res.status(400).json({Error:"Not found"})

        res.status(200).json(result[0])
    })
})

router.delete('/', checkAuth, (req, res)=>{
    const id = req.authData.id

    const sql = "DELETE FROM USER WHERE id="+id
    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({"Error":"Server Error"})
        
        if(result.affectedRows>=1)
            return res.status(200).json({Result:"Successfull"})
        
        res.status(400).json({Result:"Unsuccessfull"})
    })
})

router.patch('/name', checkAuth, (req,res)=>{
    var name = req.body.name
    if(!name) 
        return res.status(400).json({Error:"Bad Request"})
    const sql = "UPDATE user set name = '"+name+"' WHERE id="+req.authData.id
    con.query(sql, (err, result)=>{
        if(err)
            return res.status(500).json({"Error":"Server Error"})
        
        else if(result.affectedRows >= 1)
            return res.status(200).json({Result:"Success"})
        
        return res.status(400).json({Error:"Not Found"})
    })
})

router.patch('/email', checkAuth, (req, res)=>{
    var email = req.body.email
    if(!email)
        return res.status(400).json({Error:"Bad Request"})
    const sql = "UPDATE email_user SET email = '"+email.toLowerCase()+"' WHERE id="+req.authData.id
    con.query(sql, (err, result)=>{
        if(err){
            if(err.errno == 1062)
                return res.status(400).json({"Error":"Email already exists"})
            else
                return res.status(500).json({"Error":"Server Error"})
        }

        else if(result.affectedRows >= 1)
            return res.status(200).json({Result:"Success"})
        
        return res.status(400).json({Error:"Not Found"})

    })
})

router.patch('/password', checkAuth, (req, res)=>{
    var password = req.body.password
    if(!password)
        return res.status(400).json({Error:"Bad Request"})
    bcrypt.hash(password, 10,(error, hash)=>{
        if(error)
            return res.status(500).json({"Error":"Server Error"})
        
        const sql = "UPDATE email_user SET password ='"+hash+"' WHERE id="+req.authData.id
        con.query(sql, (err, result)=>{
            if(err)
                return res.status(500).json({Error:"Server Error"})
            else if(result.affectedRows <= 0)
                return res.status(400).json({Error:"Not found"})
            
            res.status(200).json({Result:"Success"})
        })

    })
})

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = router;