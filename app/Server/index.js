import express from "express";
import pg from "pg"
import nodemailer from "nodemailer";
import session from "express-session";
import env from "dotenv";
import csv from "csv-parser";
import multer from "multer";
import bcrypt from "bcryptjs";
import cors from "cors";
import {PassThrough} from "stream";
import {v4 as uuidv4} from 'uuid';
import QRCode from 'qrcode';
env.config();

const app = express();
//Port server will be running 
const  serverport = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setting up session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 100* 60 * 60, //1 hour
        secure: false
    }
}));

app.use(cors ({
    origin: 'http://localhost:3000',
    credentials: true
}))

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
    next();
}

// Multer setup: store file in memory (not disk)
const upload = multer({ storage: multer.memoryStorage() });

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
                    id: user.user_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                }
                console.log('User logged in:', user);
                //Sending a success response with user details
                return res.status(200).json({
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
    const {eventName, eventDate, eventLocation, startTime, endTime} = req.body;
    const organizer_id = req.session.user.id;
    if(!req.body || !eventName || !eventDate || !eventLocation || !startTime || !endTime){
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
        //console.log("Session data in /api/events:", req.session);
        //console.log("User in session:", req.session.user);
        const event = await db.query('INSERT INTO events (organizer_id, event_name, event_date, location, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [organizer_id, eventName, eventDate, eventLocation, startTime, endTime]);
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

//Route to handle CSV file uploads by organizers
app.post('/api/upload-csv/:eventId', requireLogin, requireOrganizer, upload.single('file'), async (req,res) => {
    const eventId = req.params.eventId;
    const uploader_id = req.session.user.id;
    if(!req.file){
        //If no file is uploaded, return an error
        return res.status(400).json({
            error: 'CSV file is required'
        })
    }
    //Check if the event exists and belongs to the current organizer
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, uploader_id]);
    if(eventCheck.rows.length === 0){
        //If the event does not exist or does not belong to the organizer, return an error
        return res.status(403).json({
            error: 'Event not found or you are not authorized to upload CSV for this event'
        })
    }
    const results = [];//Array to store valid rows
    const failedRows = [];//Array to store rows with missing fields
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);
    
    bufferStream.pipe(csv())
        .on('data', (row) => {
            const {first_name, last_name, email_address, category} = row;
            //Validating the fields
            if(first_name && last_name && email_address && category){
                //If all fields are present, push the row to results array
                results.push([uploader_id, eventId, first_name, last_name, email_address, category])
            }else{
                //If any field is missing, push the row to failedRows array
                failedRows.push(row);
            }
        })
        .on('end', async () => {
            try{
                for(const row of results){
                    await db.query('INSERT INTO csv_uploads (uploader_id, event_id, first_name, last_name, email_address, category) VALUES ($1, $2, $3, $4, $5, $6)', row);
                }
                res.status(200).json({
                    message: 'CSV file uploaded successfully',
                    totalInserted: results.length,
                    failedRows: failedRows.length > 0 ? failedRows : undefined
                });
            }catch(err){
                console.error('Error inserting CSV rows: ', err);
                res.status(500).json({
                    error: 'Failed to insert CSV data'
                })
            }
        })
        .on('error', (err) => {
            console.error('Error parsing CSV file:', err);
            res.status(500).json({
                error: 'Failed to parse CSV file'
            })
        })
})

//Route to send email invitations to users uploaded via CSV file
app.post('/api/send_invites/:eventId', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const organizerId = req.session.user.id;
    try{
        const organizerResult = await db.query('SELECT * from users WHERE user_id = $1', [organizerId]);
        if(organizerResult.rows.length === 0){
            return res.status(404).json({
                error: 'Organizer not found'
            })
        }
        //Obtaining the full name of the event organizer from the database
        const organizer = organizerResult.rows[0];
        const organizerName = `${organizer.first_name} ${organizer.last_name}`;

        //Check if the event exists and belongs to the current organizer
        const eventCheck = await db.query('SELECT * from events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exist or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to send invites for this event'
            })
        }
        //Obtaining the event name from the database
        const eventName = eventCheck.rows[0].event_name;

        //Get the guest list for the event from csv_uploads table
        const guestListResult = await db.query('SELECT * from csv_uploads WHERE event_id = $1 AND uploader_id = $2', [eventId, organizerId]);
        if(guestListResult.rows.length === 0){
            return res.status(404).json({
                error: 'No guests found for this event'
            })
        }

        //Setting up nodemailer transporter for the application
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, //Planna email address used by event organizers to send invites
                pass: process.env.EMAIL_PASSWORD
            }
        })
        for(const guest of guestListResult.rows){
            //Sending email invitations to each guest in the guest list
        const {first_name, last_name, email_address, category} = guest;
        //Creating RSVP link for each guest
        const rsvplink = `http://localhost:3000/rsvp?email=${encodeURIComponent(email_address)}&eventId=${eventId}`;
        const mailOptions = {
            from: `"${organizerName} via Planna" <${process.env.EMAIL_USER}>`,
            to: email_address,
            subject: `Invitation to ${eventName}`,
            html:`
            <p>Dear ${first_name} ${last_name},</p>
            <p>You have been invited to <strong>${eventName}</strong>.</p>   
            <p>You're assigned category is: ${category}.</p>
            <p>Please RSVP using the link below: </p>
            <p><a href="${rsvplink}">Click here to RSVP</a></p>
            <p>Thanks, <br>${organizerName}</br></p>         
            <p><em>This email was sent via Planna</em></p>
            `,
            };
            //Sending the email
            await transporter.sendMail(mailOptions);
        }
        res.status(200).json({
            message: `Invitations sent successfully to ${guestListResult.rows.length} guests for event: ${eventName}`
        })
    }catch(err){
        console.error('Error sending invitations:', err);
        res.status(500).json({
            error: 'Failed to send invitations'
        })
    }
})

//Route to get the list of events created by the organizer
app.get('/api/events', requireLogin, requireOrganizer, async (req,res) => {
    const organizerId = req.session.user.id;
    try{
        //Querying the database to get the list of events created by the organizer
        const events = await db.query('SELECT * FROM events WHERE organizer_id = $1', [organizerId]);
        if(events.rows.length === 0){
            return res.status(404).json({
                message: 'No events found for this organizer'
            })
        }
        //Sending the list of events as a response
        res.status(200).json({
            message: 'Events retrieved successfully',
            events: events.rows
        })
    }catch(err){
        console.error('Error retrieving events:', err);
        res.status(500).json({
            error: 'Failed to retrieve events'
        })
    }
})

//Route to allow the event organizers to delete an event
app.delete('/api/events/:eventId', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const organizerId = req.session.user.id;
    try{
        //Check if the event exists and belongs to the current organizer
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exists or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to delete this event or event not found'
            })        
        }
        //Delete the event from the database
        await db.query('DELETE FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        res.status(200).json({
            message: `Event ${eventName} deleted successfully!`
        })
    }catch(err){
        console.error('Error deleting event:', err);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})

//Route to get all the events that have been created in the application
app.get('/api/all-events', async (req,res) => {
    try{
        //Querying the database to get all the events
        const allEvents = await db.query('SELECT * FROM events');
        if(allEvents.rows.length === 0){
            return res.status(404).json({
                message: 'No events found'
            })
        }
        //Send all the events as a response
        res.status(200).json({
            message: 'All events retrieved successfully',
            events: allEvents.rows
        })
    }catch(err){
        console.error('Error retrieving all events:', err);
        res.status(500).json({
            error: 'Failed to retrieve all events'
        })
    }
})

//Route to allow guests to RSVP for an event
app.post('/api/rsvp', async (req,res) => {
    const {eventId, email, rsvp_status} = req.body;
    if(!req.body || !eventId || !email || !rsvp_status){
        //If any field is missing, return an error
        return res.status(400).json({
            error: 'Missing required fields'
        }) 
    }
    try{
        //Check if the user has already RSVP'd for the event
        const existingRSVP = await db.query('SELECT * FROM guests WHERE email_address = $1 AND event_id = $2', [email, eventId]);
        if(existingRSVP.rows.length > 0){
            return res.status(409).json({
                error: 'Guest has already RSVP\'d for this event'
            })
        }
        //Check if the guest is in the invited guest list
        const guestResult = await db.query('SELECT first_name, last_name, category FROM csv_uploads WHERE event_id = $1 AND email_address = $2', [eventId, email]);
        if(guestResult.rows.length === 0){
            return res.status(404).json({
                error: 'Guest not found in the invited guest list'
            })
        }
        const {first_name: firstName, last_name: lastName, category} = guestResult.rows[0];

        //Get event date and time
        const eventResult = await db.query('SELECT event_name, event_date, end_time FROM events WHERE event_id = $1', [eventId]);
        if(eventResult.rows.length === 0){
            return res.status(404).json({
                error: 'Event not found'
            })
        } 
        const {event_name, event_date, end_time} = eventResult.rows[0];
        
        //Generate the UUID and QR code
        const uniqueCode = uuidv4();
        const qrCodeURL = await QRCode.toDataURL(uniqueCode);
        
        //Set QR Code expiration (24 hours after the event)
        
        const expires = new Date(event_date);
        const qrExpiresAt = new Date(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours after the event end time

        //Insert RSVP details
        await db.query('INSERT INTO guests (event_id, first_name, last_name, email_address, category, rsvp_status, access_code, qr_code, qr_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [eventId, firstName, lastName, email, category, rsvp_status, uniqueCode, qrCodeURL, qrExpiresAt]
        );
        //Send confirmation email to the guest
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, //Planna email address used by event organizers to send invites
                pass: process.env.EMAIL_PASSWORD
            },
        });
        const mailOptions = {
            from: `"Planna" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `RSVP Confrimation for ${event_name}`,
            html: `
            <p>Dear ${firstName} ${lastName}</p>  
            <p>Thank you for RSVPing to <strong>${event_name}</strong></p>  
            <p>Your access code is: <strong>${uniqueCode}</strong></p> 
            <p>This code will allow you to view your RSVP and event updates through the website</p>    
            <p><strong></strong></p>  
            <p>See you there</p>
            <p>Thanks, <br>Planna Team</br></p>           
            `,
        };
        await transporter.sendMail(mailOptions);
        return res.status(201).json({
            message: 'RSVP recorded successfully and confirmation email sent'
        });
    }catch(err){
        console.error('Error handling RSVP:', err);
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
})

app.listen(serverport, () => {
    console.log(`Server is running on port http://localhost:${serverport}`);
})