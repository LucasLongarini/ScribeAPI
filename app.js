const express = require('express');
const app = express();
const con = require('./api/db');

const postRoutes = require('./api/routes/user')
const commentRoutes = require('./api/routes/comment')
const userRoutes = require('./api/routes/user')
const courseRoutes = require('./api/routes/course')
const noteRoutes = require('./api/routes/note')


const port = 3000;
app.listen(port, ()=>{
    console.log("Server Listening on port "+port)
})

app.get('/', (req, res)=>{
    res.status(200).json({response:"Root"})
})

app.use('/post', postRoutes)
app.use('/comment',commentRoutes)
app.use('/user', userRoutes)
app.use('/course', courseRoutes)
app.use('/note', noteRoutes)

var insert = "INSERT INTO school (name) VALUES ('University Of Calgary')"
    con.query(insert, (err, result)=>{
        if(err)
            console.log(err)
        else{
            require('fs').readFileSync('./Courses/uofc_courses.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
                var courses = line.split(" ");
                var course = courses[0];
                for(var i=1; i<courses.length; i++){
                    if(courses[i] != ""){
                        var sql = "INSERT INTO course (school_id, name, number) VALUES ("+result.insertId+", '"+course+"', '"+courses[i]+"');"
                        con.query(sql, (err)=>{
                        if(err)
                            console.log(err)
                        })
                    }
                }
            })
        }
    })

var insert = "INSERT INTO school (name) VALUES ('Mount Royal University')"
con.query(insert, (err, result)=>{
    if(err)
        console.log(err)
    else{
        require('fs').readFileSync('./Courses/mru_courses.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
            var courses = line.split(" ");
            var course = courses[0];
            for(var i=1; i<courses.length; i++){
                if(courses[i] != ""){
                    var sql = "INSERT INTO course (school_id, name, number) VALUES ("+result.insertId+", '"+course+"', '"+courses[i]+"');"
                    con.query(sql, (err)=>{
                    if(err)
                        console.log(err)
                    })
                }
            }
        })
    }
})



//Errors 
app.use((req, res, next)=>{
    const error = new Error('Not Found')
    error.status(404)
    next(error)
})

app.use((error, req, res, next)=>{
    res.status(error.status || 500).json({error:error.message})
})