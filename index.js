import express from 'express';
import axios from 'axios';
const app = express();
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fetchuser from './middleware/fetchuser.js'

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

const User = mongoose.model('user',userSchema); // the word inside the quotes is the collection


console.log(User)

app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}))
app.set('view engine', "ejs");

app.get('/signup', (req,res) => {
	console.log('received request for signup page')
	res.render('signup', {name: "Sarthak"})
})

app.get('/login', (req,res) => {
	console.log('received request for login page')
	res.render('login', {name: "Sarthak"})
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
            return res.status(400).json({ error: 'User with this username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(data.password, salt)

        const newUser = await User.create({
            fullName: data.username,
            password: secPass,
            email: data.email
        });


        const tokenData = {
        	id: email
        }
        const token = await jwt.sign(tokenData, jwtSecret)
        const returnData = {
        	name: User.fullName,
        	email: User.email,
        	'auth-token': token
        }
        const finalData = {
        	status: 'User created successfully',
        	response:returnData
        }

        console.log('Created a new user:', newUser);
        return res.status(200).json(finalData);
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