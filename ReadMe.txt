The backend:
1. To run the backend you need Node.Js installed as well as NPM fisrt.
2. Once yoou have the project installed you need to run 'NPM install' in the directory of the project to install all the dependencies
3. Next in the .env file you must fill in your own database connections info to connect to a database
4. Next run the "Create Database Scripts.sql" file in your database to create the schema.
5. Next take the Schools.csv file in the Schools folder and initialize the schools.
6. Next take the Courses.csv file in the Courses folder and initialize the courses.
7. Finally run "Node app.js" to start the server
8. The documentation for all the endpoints of this API can be found here
"https://documenter.getpostman.com/view/5520176/S1EJYgmx"

The Frontend:
1. Since this frontend is an ios app you need to run it on a mac with xcode installed.
2. Open up the project with the Xcode IDE.
3. To make sure you are connecting to the right backend you can go to the file "Helpers/ApiHelper.swift" 
and change the domain to the domain of the server you are running (probably http://127.0.0.1:3000 if you are running it locally)
4. Run the project on the xcode simulator and enjoy