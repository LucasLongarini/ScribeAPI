const express = require('express')
const router = express.Router()

router.post('/register_email', (req,res)=>{
    console.log(req.body.email)
    res.status(200).json({yo:"yo"})
})

module.exports = router;