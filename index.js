import express from 'express';
import axios from 'axios';
const app = express();
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fetchuser from './middleware/fetchuser.js'


app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}))
app.set('view engine', "ejs");




const jwtSecret = '!@#$QWERqwer1234'



mongoose.connect('mongodb://127.0.0.1:27017/allUsers') // Last part is a Database
.then(() => {
	console.log('Mongoose database connected')
})
.catch(() => {
	console.log('Failed to connect to mongodb')
})

const userSchema = new mongoose.Schema({
	fullName:{
		type: String,
		required: true
	},
	password:{
		type:String,
		required: true
	},
	email:{
		type:String,
		unique:true
	}
})

const notesSchema = new mongoose.Schema({
    usermail: {
        type: String,
        required: true
    },
    notes: {
        type: [String], 
        default: []
    }
});


const User = mongoose.model('user',userSchema); // the word inside the quotes is the collection
const Notes = mongoose.model('allnotes',notesSchema)



// in get request axios.get('path', {header: {}})
// in post request axios.post('path',{body},{header:{}})


console.log(User)

app.get('/signup', (req,res) => {
	console.log('received request for signup page')
	res.render('signup')
})

app.get('/login', (req,res) => {
	console.log('received request for login page')
	res.render('login')
})


app.get('/home', async (req,res) => {
	try{
		res.render('homepage')

	}catch(error){
		res.sendStatus(500).json({response:"Internal server error"})
	}
})


app.post('/signup', async (req, res, next) => {
    console.log(req.body);

    const data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.ema
    };

    try {
        const existingUsers = await User.find({ email: data.email });

        if (existingUsers.length > 0) {
            console.log('User with this email already exists');
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(data.password, salt)

        const newUser = await User.create({
            fullName: data.username,
            password: secPass,
            email: data.email
        });

        await Notes.create({
        	usermail: data.email,
        	notes: []
        })

        const token = await jwt.sign(data.email, jwtSecret)

        const returnData = {
        	name: data.username,
        	email: data.email,
        	'auth-token': token
        }

        console.log('Created a new user:', newUser);
        return res.status(200).json(returnData);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


app.post('/login', async (req, res, next) => {
    console.log(req.body);

    const data = {
        password: req.body.password,
        email: req.body.ema
    };

    try {
        const existingUsers = await User.findOne({ email: data.email });

        if (!existingUsers) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }
        console.log(existingUsers)
        console.log('User exists')

        const correctPassword = await bcrypt.compare(data.password, existingUsers.password)
        
        if (!correctPassword){
        	return res.status(400).json({ error: 'Invalid Credentials' });
        }
        console.log('Password was correct')

        const token = await jwt.sign(existingUsers.email, jwtSecret)
        const returnData = {
        	name: existingUsers.fullName,
        	email: existingUsers.email,
        	'auth-token': token
        }

        console.log('User ', existingUsers.fullName, ' Logged in');
        return res.status(200).json(returnData);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});



 
app.post('/userdata', fetchuser, async (req,res,next) => {
	console.log('got user data request')
	try{
		console.log(req.user)
		const useremail = req.user
		const user = await User.findOne({email:useremail}).select('-password')
		console.log('found' + user)
		res.send(user)
	}
	catch(error){
		res.status(401).json({error:"internal server error"})
	}
})


app.post('/sendnotes', fetchuser, async(req,res,next) => {
	console.log('SEND NOTES REQUEST')
	try{
		const userMail = req.user
		console.log('USER IS REQUESTING NOTES ' + userMail)
		const user = await Notes.findOne({usermail:userMail})
		console.log('FOUND USER DATA ' + user)
		const notes = user.notes
		res.status(200).json({response:{'notes':notes}})
	}
	catch(error){
		res.status(401).json({error:"internal server error"})
	}	
})

app.post('/addnotes', fetchuser, async(req,res,next) => {
	try{
		console.log("req.user " + req.user)
		const useremail = req.user
		const user = await Notes.findOne({usermail:useremail})
		console.log("user: " + user)
		console.log('RESPONSE BODY ' + req.body)
		const newNotes = req.body.notes // whatever the notes are in the payload, just put that as the notes in database
		console.log(newNotes)
		user.notes = newNotes
		await user.save()
		res.status(200).json({response:{msg:"Got the notes",notes:newNotes}})

	}
	catch(error){
		res.status(401).json({error:"internal server error"})
	}	
})

app.post('/temp', fetchuser, async (req,res,next) => {

		const useremail = req.user
		const user = await User.findOne({email:useremail}).select('-password')
		if(!user){
			res.sendStatus(400).json({response:"User not found"})
		}
		console.log('FOUND USER: ' + user)
		console.log('received request to open home page for ' + user.fullName)

})



app.get('/about', (req,res) => {
	console.log('received request for about page')
	res.send('About')
})

// Define a middleware function to log requests to '/something'
app.use('/spam', (req, res, next) => {
    console.log('SPAM REQUEST');
    next(); // Pass control to the next middleware function
});
 
app.listen(5001, () => {
	console.log('server started');
}) 

// /home/sarthak/server
// npm start dev 