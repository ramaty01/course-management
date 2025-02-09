Clone the repository:  
git clone git@github.com:ramaty01/course-management.git  
    
Add a .env file with this content:  
MONGO_URI=mongodb+srv://<user>:<pwd>@coursesdb.ms9b6.mongodb.net/?retryWrites=true&w=majority&appName=coursesDB  
    
Install npm:  
npm init -y  
npm install express mongoose cors body-parser dotenv nodemailer
npm install --save-dev nodemon  
npm install bcryptjs jsonwebtoken  
    
Run the server:  
nodemon server.js  