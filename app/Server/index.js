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
        maxAge: 100* 60 * 1000, //Session will expire after one hour 
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

//Middleware to verify the role of a user
const requireOrganizer = (req,res,next) => {
    if(req.session.user.role != 'organizer'){
        //If the user is not an organizer, return an error
        return res.status(403).json({
            error: req.session.user.role + ' is not authorized to perform this action'
        })
    }
    next();
}
//Middleware to ensure that a user is an admin
const requireAdmin = (req,res,next) => {
    if(req.session.user.role !== 'admin'){
        //If the user is not an admin, return an error
        return res.status(403).json({
            error: 'Access denied, admin privileges required'
        })
    }
    next();
};


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

// Post request to login a user into the system
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const emailLower = email.toLowerCase();

  if (!req.body || !email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User with provided email does not exist'
      });
    }

    const user = userResult.rows[0];

    // Check if the account is deactivated
    if (user.status === 'deactivated') {
      return res.status(403).json({
        error: 'Your account has been deactivated by the admin. Please contact support for assistance.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    // Create session for valid and active user
    req.session.user = {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role
    };

    console.log('User logged in:', user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      error: 'Failed to login user'
    });
  }
});

//Route to verify the session of a user
app.get('/api/me', (req,res) => {
    if(!req.session.user){
        //If user is not logged in, return an error
        return res.status(401).json({
            error: 'Unauthorized access, please login first'
        })
    }
    res.status(200).json({
        user: req.session.user
    })
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
  const { eventName, eventDate, eventLocation, startTime, endTime } = req.body;
  const organizer_id = req.session.user.id;

  if (!eventName || !eventDate || !eventLocation || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate event date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  if (eventDay < today) {
    return res.status(400).json({ error: 'Event date cannot be in the past' });
  }

  // Validate time logic (handle overnight events)
  const startDateTime = new Date(`${eventDate}T${startTime}`);
  let endDateTime = new Date(`${eventDate}T${endTime}`);
  if (endDateTime <= startDateTime) {
    // If end time is before or equal to start time, assume it passes midnight
    endDateTime.setDate(endDateTime.getDate() + 1);
  }

  try {
    const result = await db.query(
      `INSERT INTO events (organizer_id, event_name, event_date, location, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [organizer_id, eventName, eventDate, eventLocation, startTime, endTime]
    );

    console.log('New event created:', result.rows[0]);

    return res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });

  } catch (err) {
    console.error('Error creating the event:', err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});


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

// Route to manually add a guest to the csv_uploads table for a specific event
app.post('/api/organizer/manual-guest-upload/:eventId', requireLogin, requireOrganizer, async (req, res) => {
    const organizerId = req.session.user.id;
    const event_id = req.params.eventId;
    const { first_name, last_name, email_address, category } = req.body;

    // Validate inputs
    if (!first_name || !last_name || !email_address || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const validCategories = ['VIP', 'Regular'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category. Must be either VIP or Regular' });
    }

    try {
        // Ensure the event belongs to the current organizer
        const eventCheck = await db.query(
            'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
            [event_id, organizerId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You do not have permission to modify this event' });
        }

        // Insert guest into csv_uploads
        await db.query(
            `INSERT INTO csv_uploads (uploader_id, event_id, first_name, last_name, email_address, category)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [organizerId, event_id, first_name.trim(), last_name.trim(), email_address.trim(), category]
        );

        res.status(201).json({ message: 'Guest manually added to CSV uploads' });
    } catch (err) {
        console.error('Error adding guest manually:', err);
        res.status(500).json({ error: 'Failed to add guest' });
    }
});

//Route to delete a guest from the csv_uploads table
app.delete('/api/organizer/delete-guest/:eventId/:email', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const email = req.params.email;
    const organizerId = req.session.user.id;
    try{
        //Check if the event exists and belongs to the current organizer
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exist or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to delete guest for this event'
            })
        }
        //Check if the guest exists in the csv_uploads table
        const guestCheck = await db.query('SELECT * FROM csv_uploads WHERE event_id = $1 AND email_address = $2', [eventId, email]);
        if(guestCheck.rows.length === 0){
            //If the guest does not exist in the csv_uploads table, return an error
            return res.status(404).json({
                error: 'Guest not found in the invited guest list for this event'
            })
        }
        //Delete the guest from the csv_uploads table
        await db.query('DELETE FROM csv_uploads WHERE event_id = $1 AND email_address = $2', [eventId, email]);
        res.status(200).json({
            message: `Guest with email ${email} deleted successfully from the event`
        })
    }catch(err){
        console.error('Error deleting guest from csv_uploads:', err);
        res.status(500).json({
            error: 'Failed to delete guest from the event'
        })
    }
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

// Route: Get RSVP responses for a specific event (organizer-only)
app.get('/api/organizer/event-rsvps/:eventId', requireLogin, requireOrganizer, async (req, res) => {
    const organizerId = req.session.user.id;
    const eventId = req.params.eventId;

    try {
        // 1. Verify the event belongs to this organizer
        const eventCheck = await db.query(
            'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
            [eventId, organizerId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized access to event data' });
        }

        // 2. Fetch RSVP responses from guests table
        const guestRSVPs = await db.query(
            `SELECT guest_id, first_name, last_name, email_address, category, rsvp_status, check_in_status, seat_number
             FROM guests
             WHERE event_id = $1`,
            [eventId]
        );

        if (guestRSVPs.rows.length === 0) {
            return res.status(404).json({ message: 'No guests found for this event' });
        }

        res.status(200).json({ rsvps: guestRSVPs.rows });

    } catch (err) {
        console.error('Error retrieving RSVPs:', err);
        res.status(500).json({ error: 'Failed to retrieve RSVP responses' });
    }
});


//Route to retrieve the guest list for an event from csv_uploads table
app.get('/api/guest-list/:eventId', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const organizerId = req.session.user.id;
    try{
        //Check if the event exists and belongs to the current organizer
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exist or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to view guest list for this event'
            })
        }
        //Querying the database to get the guest list for the event
        const guestList = await db.query('SELECT * FROM csv_uploads WHERE event_id = $1 AND uploader_id = $2', [eventId, organizerId]);
        if(guestList.rows.length === 0){
            return res.status(404).json({
                message: 'No guests found for this event'
            })
        }
        //Sending the guest list as a response
        res.status(200).json({
            message: 'Guest list retrieved successfully',
            guests: guestList.rows
        })
    }catch(err){
        console.error('Error retrieving guest list:', err);
        res.status(500).json({
            error: 'Failed to retrieve guest list'
        })
    }
})

//Route to allow an organizer to add a guest manually to the csv_uploads table
app.post('/api/add-guest/:eventId', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const organizerId = req.session.user.id;
    const {firstName, lastName, email, category} = req.body;

    if(!firstName || !lastName || !email || !category){
        //If any field is missing return an error
        return res.status(400).json({
            error: 'All fields are required'
        })
    }
    //Validate category
    if(!['VIP', 'Regular'].includes(category)){
        return res.status(400).json({
            error: 'Invalid category. Must be VIP or Regular'
        })
    }
    try{
        //Ensure the event belongs to this organizer
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exist or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to add guest for this event'
            })
        }
        //Check if the guest already exists in the csv_uploads table
        const existingGuest = await db.query('SELECT * FROM csv_uploads WHERE event_id = $1 AND email_address = $2', [eventId, email]);
        if(existingGuest.rows.length > 0){
            return res.status(409).json({
                error: 'Guest with this email already exists for this event'
            })
        }
        //Insert the new guest into the csv_uploads table
        const insertResult = await db.query(`INSERT INTO csv_uploads (uploader_id, event_id, first_name, last_name, email_address, category) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [organizerId, eventId, firstName, lastName, email, category]);

            res.status(201).json({
                message: 'Guest added successfully',
                guest: insertResult.rows[0]
            });
    }catch(err){
        console.error('Error adding guest to csv_uploads:', err);
        res.status(500).json({
            error: 'Failed to add guest'
        })
    }
})

//Route to retrieve guest responses for an event by an organizer
app.get('/api/guest-responses/:eventId', requireLogin, requireOrganizer, async (req,res) => {
    const eventId = req.params.eventId;
    const organizerId = req.session.user.id;
    try{
        //Check if the event exists and belongs to the current organizer
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
        if(eventCheck.rows.length === 0){
            //If the event does not exist or does not belong to the organizer, return an error
            return res.status(403).json({
                error: 'Unauthorized to view guest responses for this event'
            })
        }
        //Querying the database to get the guest responses for the event
        const responses = await db.query('SELECT * FROM guests WHERE event_id = $1', [eventId]);
        if(responses.rows.length === 0){
            return res.status(404).json({
                message: 'No guest responses found for this event'
            })
        }
        //Sending the guest responses as a response
        res.status(200).json({
            message: 'Guest responses retrieved successfully',
            guests: responses.rows
        })
    }catch(err){
        console.error('Error retrieving guest responses:', err);
        return res.status(500).json({
            error: 'Failed to retrieve guest responses'
        })
    }
})

//Route to allow the organizer to create a new seating configuration for an event
// app.post('/api/seating/guest/:eventId', requireLogin, requireOrganizer, async (req, res) => {
//   const eventId = req.params.eventId;
//   const organizerId = req.session.user.id;
//   const {
//     table_count,
//     seats_per_table,
//     number_of_rows,
//     seats_per_row
//   } = req.body;

//   try {
//     const eventCheck = await db.query(
//       'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
//       [eventId, organizerId]
//     );
//     if (eventCheck.rows.length === 0) {
//       return res.status(403).json({ error: 'Unauthorized to create configuration for this event' });
//     }

//     const existing = await db.query(
//       'SELECT * FROM seating_configurations WHERE event_id = $1',
//       [eventId]
//     );
//     if (existing.rows.length > 0) {
//       return res.status(409).json({ error: 'Configuration already exists for this event' });
//     }

//     if (table_count && seats_per_table) {
//       const result = await db.query(`
//         INSERT INTO seating_configurations (event_id, table_count, seats_per_table)
//         VALUES ($1, $2, $3) RETURNING *`,
//         [eventId, table_count, seats_per_table]
//       );
//       return res.status(201).json({
//         message: 'Seating configuration (table layout) created',
//         seating_configuration: result.rows[0]
//       });
//     }

//     if (number_of_rows && seats_per_row) {
//       const result = await db.query(`
//         INSERT INTO seating_configurations (event_id, number_of_rows, seats_per_row)
//         VALUES ($1, $2, $3) RETURNING *`,
//         [eventId, number_of_rows, seats_per_row]
//       );
//       return res.status(201).json({
//         message: 'Seating configuration (row layout) created',
//         seating_configuration: result.rows[0]
//       });
//     }

//     return res.status(400).json({ error: 'Invalid configuration input' });
//   } catch (err) {
//     console.error('Create seating config error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
app.post('/api/seating/guest/:eventId', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const organizerId = req.session.user.id;
  const { table_count, seats_per_table, number_of_rows, seats_per_row } = req.body;

  console.log(`[POST] Create seating config for event ${eventId} by organizer ${organizerId}`);
  console.log('Request body:', req.body);

  try {
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2', [eventId, organizerId]);
    if (eventCheck.rows.length === 0) {
      console.warn('Unauthorized: Organizer does not own this event.');
      return res.status(403).json({ error: 'Unauthorized to create configuration for this event' });
    }

    const existing = await db.query('SELECT * FROM seating_configurations WHERE event_id = $1', [eventId]);
    if (existing.rows.length > 0) {
      console.warn('Conflict: Configuration already exists.');
      return res.status(409).json({ error: 'Configuration already exists for this event' });
    }

    if (table_count && seats_per_table) {
      const result = await db.query(`INSERT INTO seating_configurations (event_id, table_count, seats_per_table) VALUES ($1, $2, $3) RETURNING *`, [eventId, table_count, seats_per_table]);
      console.log('Table layout created:', result.rows[0]);
      return res.status(201).json({ message: 'Seating configuration (table layout) created', seating_configuration: result.rows[0] });
    }

    if (number_of_rows && seats_per_row) {
      const result = await db.query(`INSERT INTO seating_configurations (event_id, number_of_rows, seats_per_row) VALUES ($1, $2, $3) RETURNING *`, [eventId, number_of_rows, seats_per_row]);
      console.log('Row layout created:', result.rows[0]);
      return res.status(201).json({ message: 'Seating configuration (row layout) created', seating_configuration: result.rows[0] });
    }

    console.warn('Bad Request: Invalid configuration input.');
    return res.status(400).json({ error: 'Invalid configuration input' });

  } catch (err) {
    console.error('Create seating config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

        

//Route to allow the organizer to update an existing seating configuration for an event
app.put('/api/seating/:eventId', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const organizerId = req.session.user.id;
  const {
    table_count,
    seats_per_table,
    number_of_rows,
    seats_per_row
  } = req.body;

  try {
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to update configuration' });
    }

    const configCheck = await db.query(
      'SELECT * FROM seating_configurations WHERE event_id = $1',
      [eventId]
    );
    if (configCheck.rows.length === 0) {
      return res.status(404).json({ error: 'No configuration exists to update' });
    }

    if (table_count && seats_per_table) {
      const result = await db.query(`
        UPDATE seating_configurations
        SET table_count = $1, seats_per_table = $2, number_of_rows = NULL, seats_per_row = NULL
        WHERE event_id = $3 RETURNING *`,
        [table_count, seats_per_table, eventId]
      );
      return res.status(200).json({
        message: 'Updated to table layout',
        seating_configuration: result.rows[0]
      });
    }

    if (number_of_rows && seats_per_row) {
      const result = await db.query(`
        UPDATE seating_configurations
        SET number_of_rows = $1, seats_per_row = $2, table_count = NULL, seats_per_table = NULL
        WHERE event_id = $3 RETURNING *`,
        [number_of_rows, seats_per_row, eventId]
      );
      return res.status(200).json({
        message: 'Updated to row layout',
        seating_configuration: result.rows[0]
      });
    }

    return res.status(400).json({ error: 'Invalid update input' });
  } catch (err) {
    console.error('Update seating config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Route to retrieve the current seating configuration and assigned guests for an event
app.get('/api/seating/:eventId', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const organizerId = req.session.user.id;

  try {
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const seatingConfig = await db.query(
      'SELECT * FROM seating_configurations WHERE event_id = $1',
      [eventId]
    );

    if (seatingConfig.rows.length === 0) {
      return res.status(200).json({
        hasConfiguration: false,
        seating_configuration: null,
        assigned_guests: []
      });
    }

    const assignedGuests = await db.query(`
      SELECT g.guest_id, g.first_name, g.last_name, g.email_address, g.category, g.seat_number
      FROM guests g
      WHERE g.event_id = $1`,
      [eventId]
    );

    res.status(200).json({
      hasConfiguration: true,
      seating_configuration: seatingConfig.rows[0],
      assigned_guests: assignedGuests.rows
    });
  } catch (err) {
    console.error('Get seating config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Route to update a guest's seat number (after dragging them to a new spot)
app.put('/api/seating/:eventId/guest/:guestId', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const guestId = req.params.guestId;
  const organizerId = req.session.user.id;
  const { newSeatNumber } = req.body;

  if (!newSeatNumber) {
    return res.status(400).json({ error: 'New seat number is required' });
  }

  try {
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to update guest for this event' });
    }

    const guestCheck = await db.query(
      'SELECT * FROM guests WHERE guest_id = $1 AND event_id = $2',
      [guestId, eventId]
    );
    if (guestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found for this event' });
    }

    const update = await db.query(
      'UPDATE guests SET seat_number = $1 WHERE guest_id = $2 AND event_id = $3 RETURNING *',
      [newSeatNumber, guestId, eventId]
    );

    res.status(200).json({
      message: `Guest ${guestId} seat updated`,
      guest: update.rows[0]
    });
  } catch (err) {
    console.error('Error updating seat:', err);
    res.status(500).json({ error: 'Failed to update seat number' });
  }
});


//Route to automatically assign seats to guests who dont yet have one
app.post('/api/seating/:eventId/auto-assign', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const organizerId = req.session.user.id;

  try {
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to auto-assign seats' });
    }

    const configResult = await db.query(
      'SELECT * FROM seating_configurations WHERE event_id = $1',
      [eventId]
    );
    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'No seating configuration found' });
    }

    const config = configResult.rows[0];
    const { table_count, seats_per_table, number_of_rows, seats_per_row } = config;

    // Generate seat labels
    let allSeats = [];

    if (table_count && seats_per_table) {
      for (let t = 1; t <= table_count; t++) {
        for (let s = 1; s <= seats_per_table; s++) {
          allSeats.push(`Table ${t} - Seat ${s}`);
        }
      }
    } else if (number_of_rows && seats_per_row) {
      for (let r = 1; r <= number_of_rows; r++) {
        for (let s = 1; s <= seats_per_row; s++) {
          allSeats.push(`Row ${r} - Seat ${s}`);
        }
      }
    } else {
      return res.status(400).json({ error: 'Invalid seating configuration' });
    }

    // Fetch used seats
    const usedSeatsResult = await db.query(
      'SELECT seat_number FROM guests WHERE event_id = $1 AND seat_number IS NOT NULL',
      [eventId]
    );
    const usedSeats = new Set(usedSeatsResult.rows.map(row => row.seat_number));

    const availableSeats = allSeats.filter(seat => !usedSeats.has(seat));

    // Fetch guests without seats
    const unseatedGuests = await db.query(
      'SELECT guest_id FROM guests WHERE event_id = $1 AND seat_number IS NULL',
      [eventId]
    );

    const updated = [];

    for (let i = 0; i < unseatedGuests.rows.length && availableSeats.length > 0; i++) {
      const guestId = unseatedGuests.rows[i].guest_id;
      const seat = availableSeats.shift();

      await db.query(
        'UPDATE guests SET seat_number = $1 WHERE guest_id = $2 AND event_id = $3',
        [seat, guestId, eventId]
      );

      updated.push({ guest_id: guestId, seat });
    }

    const notSeated = unseatedGuests.rows.length - updated.length;

    res.status(200).json({
      message: 'Auto-assignment complete',
      assigned: updated.length,
      unassigned: notSeated,
      guests: updated
    });

  } catch (err) {
    console.error('Auto-assign error:', err);
    res.status(500).json({ error: 'Failed to auto-assign seats' });
  }
});


//Route to send final email with QR code and assigned seats
app.post('/api/organizer/send-final-email/:eventId', requireLogin, requireOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const organizerId = req.session.user.id;

  try {
    // Check if event exists and belongs to organizer
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE event_id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to send final email for this event' });
    }

    const event = eventCheck.rows[0];

    // Get guests with accepted RSVP and valid seat & QR code
    const guestRes = await db.query(
      `SELECT first_name, last_name, email_address, seat_number, qr_code
       FROM guests
       WHERE event_id = $1 AND rsvp_status = $2 AND seat_number IS NOT NULL AND qr_code IS NOT NULL`,
      [eventId, 'accepted']
    );

    if (guestRes.rows.length === 0) {
      return res.status(404).json({ message: 'No guests found with accepted RSVP and assigned seats' });
    }

    // Configure mail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,         // should match sender email
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Loop through guests and send emails
    for (const guest of guestRes.rows) {
      const base64Image = guest.qr_code.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Image, 'base64');

      const mailOptions = {
        from: `"${event.organizer_name || 'Event Organizer'} via Planna" <${process.env.EMAIL_USER}>`,
        to: guest.email_address,
        subject: `Final Invite: ${event.event_name}`,
        html: `
          <p>Dear ${guest.first_name},</p>
          <p>This is your final event confirmation for <strong>${event.event_name}</strong>.</p>
          <p><strong>Event Date:</strong> ${new Date(event.event_date).toLocaleString('en-KE', {
            timeZone: 'Africa/Nairobi',
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Seat:</strong> ${guest.seat_number}</p>
          <p><img src="cid:qrcode_${guest.email_address}" alt="QR Code" width="150"/></p>
          <p>Kindly present this QR code at the entrance for check-in.</p>
          <p>Regards,<br>${event.organizer_name || 'Event Organizer'}</p>
        `,
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrBuffer,
            cid: `qrcode_${guest.email_address}` // Must match img src cid
          }
        ]
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      message: 'Final emails sent successfully to all guests with assigned seats',
      total_emails_sent: guestRes.rows.length
    });

  } catch (err) {
    console.error('Error sending final emails:', err);
    res.status(500).json({ error: 'Failed to send final emails' });
  }
});

// Route to update check-in status when QR code is scanned
app.post('/api/organizer/check-in-guest', requireLogin, requireOrganizer, async (req, res) => {
  const { qr_code } = req.body; // This should be the decoded UUID string from the QR scanner
  const organizerId = req.session.user.id;

  if (!qr_code) {
    return res.status(400).json({ error: 'QR code is required' });
  }

  try {
    // Retrieve guest and associated event using the access_code (UUID)
    const result = await db.query(`
      SELECT g.guest_id, g.check_in_status, e.organizer_id, e.event_date, e.end_time
      FROM guests g
      JOIN events e ON g.event_id = e.event_id
      WHERE g.access_code = $1
    `, [qr_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guest with provided QR code not found' });
    }

    const guest = result.rows[0];

    // Ensure the guest belongs to an event of this organizer
    if (guest.organizer_id !== organizerId) {
      return res.status(403).json({ error: 'Unauthorized: This guest is not from your event' });
    }

    // Check if already checked in
    if (guest.check_in_status === true) {
      return res.status(200).json({ message: 'Guest already checked in' });
    }

    // Construct event end datetime
    const eventEnd = new Date(`${guest.event_date.toISOString().split('T')[0]}T${guest.end_time}`);

    // Compare with current time
    const now = new Date();
    if (now > eventEnd) {
      return res.status(403).json({ error: 'Check-in not allowed after the event has ended' });
    }

    // Update check-in status
    await db.query(`
      UPDATE guests
      SET check_in_status = TRUE
      WHERE access_code = $1
    `, [qr_code]);

    res.status(200).json({ message: 'Guest checked in successfully' });

  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to check in guest' });
  }
});    
//Administrator routes

//Route to get the total event count in the application
app.get('/api/admin/total-events', requireLogin, requireAdmin, async (req,res) => {
    try{
        const eventCountResult = await db.query('SELECT COUNT(*) from events');
        res.status(200).json({
            total_events: parseInt(eventCountResult.rows[0].count)
        })
    }catch(err){
        console.error('Error retrieving total events:', err);
        res.status(500).json({
            error: 'Failed to retrieve total events'
        })
    }
});

//Route to count total number of organizers in the application
app.get('/api/admin/total-organizers', requireLogin, requireAdmin, async (req,res) => {
    try{
        const organizerCountResult = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['organizer']);
        res.status(200).json({
            total_organizers: parseInt(organizerCountResult.rows[0].count)
        })
    }catch(err){
        console.error('Error counting organizers', err);
        res.status(500).json({
            error: 'Failed to count organizers'
        })
    }
});

//Route to count total number of accepted RSVPs
app.get('/api/admin/total-rsvps', requireLogin, requireAdmin, async (req,res) => {
    try{
        const rsvpCountResult = await db.query('SELECT COUNT(*) FROM guests WHERE rsvp_status = $1', ['accepted']);
        res.status(200).json({
            total_rsvp_accepted: parseInt(rsvpCountResult.rows[0].count)
        });
    }catch(err){
        console.error('Error counting RSVPs:', err);
        res.status(500).json({
            error: 'Failed to count RSVPs'
        })
    }
});

//Route to view RSVPs per event
app.get('/api/admin/rsvps-per-event', requireLogin, requireAdmin, async (req,res) => {
    try{
        const rsvpsPerEventResult = await db.query(`
            SELECT e.event_name, COUNT(g.guest_id) AS total_rsvps, 
            COUNT(CASE WHEN g.rsvp_status = 'accepted' THEN 1 END) AS accepted_rsvps, 
            COUNT(CASE WHEN g.rsvp_status = 'declined' THEN 1 END) AS declined_rsvps
            FROM events e
            LEFT JOIN guests g ON e.event_id = g.event_id
            GROUP BY e.event_name            
            `);
        if(rsvpsPerEventResult.rows.length === 0){
            return res.status(404).json({
                message: 'No RSVPs found for any event'
            })
        }
        res.status(200).json({
            rsvps_per_event: rsvpsPerEventResult.rows            
        })
    }catch(err){
        console.error('Error retrieving RSVPs per event:', err);
        res.status(500).json({
            error: 'Failed to retrieve RSVPs per event'
        })
    }
});

//Route to display the most active organizers in the application
app.get('/api/admin/most-active-organizers', requireLogin, requireAdmin, async (req,res) => {
    try{
        const result = await db.query(`
            SELECT u.user_id, u.first_name, u.last_name, u.email, COUNT(e.event_id) AS total_events
            FROM users u JOIN events e ON u.user_id = e.organizer_id
            WHERE u.role = 'organizer'
            GROUP BY u.user_id
            ORDER BY total_events DESC
            LIMIT 10            
            `)
            res.status(200).json({
                most_active_organizers: result.rows
            })
    } catch (err){
        console.error('Error retrieving most active organizers', err);
        res.status(500).json({
            error: 'Failed to retrieve most active organizers'
        })
    }
})

//Route to get all the organizers in the application
app.get('/api/admin/all-organizers', requireLogin, requireAdmin, async (req,res) => {
    try{
        const result = await db.query('SELECT user_id, first_name, last_name, email, status FROM users WHERE role = $1', ['organizer']);
        if(result.rows.length === 0){
            return res.status(404).json({
                message: 'No organizers found'
            })
        }
        res.status(200).json({
            organizers: result.rows
        })
    }catch(err){
        console.error('Error retrieving organizers:', err);
        res.status(500).json({
            error: 'Failed to retrieve organizers'
        })
    }
});

//Route to delete an event by the admin
app.delete('/api/admin/delete-event/:eventId', requireLogin, requireAdmin, async (req,res) => {
    const eventId = req.params.eventId;
    try{
        //Check if the event exists
        const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [eventId]);
        if(eventCheck.rows.length === 0){
            return res.status(404).json({
                error: 'Event not found'
            })
        }
        //Delete the event from the database
        await db.query('DELETE FROM events WHERE event_id = $1', [eventId]);
        res.status(200).json({
            message: 'Event deleted successfully'
        })
    }catch(err){
        console.error('Error deleting event:', err);
        res.status(500).json({
            error: 'Failed to delete event'
        })
    }
});

//Route to display upcoming events
app.get('/api/admin/upcoming-events', requireLogin, requireAdmin, async (req,res) => {
    try{
        const result = await db.query(`
            SELECT event_id, event_name, event_date, start_time,end_time, location FROM events
            WHERE event_date >= CURRENT_DATE
            ORDER BY event_date ASC            
            `);
            res.status(200).json({
                upcoming_events: result.rows
            })
    }catch(err){
        console.error('Error retrieving upcoming events:', err);
        res.status(500).json({
            error: 'Failed to retrieve upcoming events'
        })
    }
});

app.patch('/api/admin/toggle-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 AND role = $3',
      [status, id, 'organizer']
    );
    res.status(200).json({ message: `Status updated to ${status}` });
  } catch (err) {
    console.error('Status update failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Route to allow a guest to event information based on their access code
app.get('/api/guest/event-info/:accessCode', async (req,res) => {
    const accessCode = req.params.accessCode;
    try{
        const result = await db.query(`
            SELECT e.event_id, e.event_name, e.event_date, e.location, e.start_time, e.end_time,
            g.first_name, g.last_name, g.rsvp_status, g.seat_number, g.check_in_status
            FROM guests g
            JOIN events e ON g.event_id = e.event_id
            WHERE g.access_code = $1            
            `, [accessCode]);
            if(result.rows.length === 0){
                return res.status(404).json({
                    error: 'Access code not found or invalid'
                })
            }
            return res.status(200).json({
                eventDetails: result.rows[0]
            });
    }catch(err){
        console.error('Error retrieving event by access code:', err);
        return res.status(500).json({
            error: 'Server error retrieving event details'
        })
    }
});

//Route to allow guest to cancel their RSVP
app.post('/api/guest/cancel-rsvp', async (req,res) => {
    const {access_code} = req.body;
    if(!access_code){
        return res.status(400).json({
            error: 'Access code required'
        });
    }
    try{
        const result = await db.query(`
            SELECT g.guest_id, g.email_address, g.first_name, g.last_name, e.event_name, 
            FROM guest g
            JOIN events e ON g.event_id = e.event_id
            WHERE g.access_code = $1            
            `, [access_code]);
            if(result.rows.length === 0){
                return res.status(404).json({
                    error: 'Invalid access code'
                });
            }
            const guest = result.rows[0];
            //Update RSVP status
            await db.query(`
                UPDATE guests SET rsvp_status = 'declined' WHERE access_code = $1                
                `, [access_code]);
            //Send cancellation email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: `"Planna" <${process.env.EMAIL_USER}>`,
                to: guest.email_address,
                subject: `RSVP Cancellation for ${guest.event_name}`,
                html: `
                    <p>Dear ${guest.first_name},</p>
                    <p>We have received your request to cancel your RSVP for the event <strong>${guest.event_name}</strong>.</p>
                    <p>Your RSVP has been successfully cancelled.</p>
                    <p>Thank you for letting us know!</p>
                    <p>Best regards,<br>Planna Team</p>                     
                `
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({
                message: ''
            })


    }catch(err){
        console.error('RSVP cancellation error:', err);
        res.status(500).json({
            error: 'Failed to cancel RSVP'
        })
    }
});



app.listen(serverport, () => {
    console.log(`Server is running on port http://localhost:${serverport}`);
})