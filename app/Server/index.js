import express from "express";
import pg from "pg"
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import session from "express-session";
import env from "dotenv";
env.config();

const app = express();
//Port server will be running 
const  serverport = 5000;
app.use(express.json());

//Setting up session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 100* 60 * 60 //1 hour
    }
}));

//Creating a database connection to the PostgreSQL database
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

//Creating a middleware for protected routes

//Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if(!req.session.user){
        //If user is not logged in, return an error
        return res.status(401).json({
            error: 'Unauthorized access, please login first'
        })
    }
    next();
}

//Middlware to verify the role of a user
const requireOrganizer = (req,res,next) => {
    if(req.session.user.role != 'organizer'){
        //If the user is not an organizer, return an error
        return res.status(403).json({
            error: req.session.user.role + ' is not authorized to perform this action'
        })
    }
}

//Post request to register a new user
app.post('/api/register', async (req,res) => {
    // Extracting user details from the request body
    const { fName, lName, email, password, role } = req.body;
    if (!req.body || !fName || !lName || !email || !password || !role) {
        // If any field is missing, return a 400 error
        return res.status(400).json(
            { 
                error: "All fields are required" 
            }
        );
    }
    //Validating email format using regex, ensure that the correct email format is used
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        //If email format is invalid, return an error
        return res.status(400).json({
            error: 'Invalid email format'
        })
    }
    try{
        //Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if(existingUser.rows.length > 0){
            return res.status(400).json({
                error: 'User already exists with this email address'
            });
        }
        //Hashing the entered password
        const hashedPassword = await bcrypt.hash(password, 10);
        //Inserting the new user into the database
        const newUser = await db.query('INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fName, lName, email, hashedPassword, role]
        )
        console.log('New user registered:', newUser.rows[0]);
        //Sending a success response
        res.status(201).json({
            message: 'User registered successfully',
        }) 
    }catch(error){
        console.error('Error registering user:', error);
        res.status(500).json({
            error: 'Failed to register user'
        })
    }
});

//Post request to login a user into the system
app.post('/api/login', async (req,res) => {
    //Extracting the email and password from the request body
    const {email, password} = req.body;
    //Validation to ensure that email and password are provided
    if(!req.body || !email || !password){
        //If email or password are not present in the request body, return an error
        return res.status(400).json({
            error: 'Email and password are required'
        })
    }
    try{
        //Querying the database to find the user with the provided email address
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userResult.rows.length > 0){
            const user = userResult.rows[0];
            //Comparing the provided password with the hashed password stored in the database
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if(isPasswordValid){
                //If password is valid, create a session for the user
                req.session.user = {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                }
                console.log('User logged in:', user);
                //Sending a success response with user details
                res.status(200).json({
                    message: 'Login successful',
                    // User details excluding password
                    user: {
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                        role: user.role
                    }   
                })
            } else {
                //If password is invalid, return error
                return res.status(401).json({
                    error: 'Invalid password'
                })
            }  
        }else{
            //If no user is found with the provided email, return error
            return res.status(404).json({
                error: 'User with provided email does not exist'
            })
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            error: 'Failed to login user'
        })
    }
})

//Adding a route to logout the user
app.get('/api/logout', (req,res) => {
    //Clear the session data from memory
    req.session.destroy((err) => {
        if(err){
            console.error('Logout error:', err);
            return res.status(500).json({
                error: 'Logout failed'
            })
        }
        res.clearCookie('connect.sid'); // Remove the sessionid from the client browser
        res.status(200).json({
            message: 'Logout successful !'
        })
    })
})

//Route to create a new event
app.post('/api/events', requireLogin, requireOrganizer, async (req,res) => {
    const {eventName, eventDate, eventLocation} = req.body;
    const organizer_id = req.session.user.id;
    if(!req.body || !eventName || !eventDate || !eventLocation){
        //If any field is missing, return an error
        return res.status(400).json({
            error: 'All fields are required'
        })
    }
    //Validate the event date to ensure it is in the future
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    const inputDate = new Date(eventDate);
    if(inputDate < currentDate){
        //If the event date is in the past, return an error
        return res.status(400).json({
            error: 'Event date cannot be in the past'
        })
    }
    
    try{
        const event = await db.query('INSERT INTO events (organizer_id, event_name, event_date, location) VALUES ($1, $2, $3, $4) RETURNING *', [organizer_id, eventName, eventDate, eventLocation]);
        console.log('New event created:', event.rows[0]);
        return res.status(201).json({
            message: 'Event created successfully',
            event: event.rows[0]
        });
    }catch(err){
        console.error('Error creating the event:', err);
        return res.status(500).json({
            error: 'Failed to create event'
        })
    }
})

app.listen(serverport, () => {
    console.log(`Server is running on port http://localhost:${serverport}`);
})