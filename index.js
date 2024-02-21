import express from 'express';
import axios from 'axios';
const app = express();
import bodyParser from 'body-parser';
import mongoose from 'mongoose'



mongoose.connect('mongodb://127.0.0.1:27017/allUsers') // Last part is a Database
.then(() => {
	console.log('Mongoose database connected')
})
.catch(() => {
	console.log('Failed to connect to mongodb')
})

const userSchema = new mongoose.Schema({
	firstName:{
		type: String,
		required: true
	},
	lastName:{
		type:String
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

app.get('/', (req,res) => {
	console.log('received request for home page')
	res.render('index', {name: "Sarthak"})
})

app.post('/submit', async (req, res, next) => {
    console.log(req.body);

    const data = {
        username: req.body.username,
        password: req.body.password
    };

    try {
        const existingUsers = await User.find({ firstName: data.username });

        if (existingUsers.length > 0) {
            console.log('User with this username already exists');
            return res.status(400).json({ error: 'User with this username already exists' });
        }

        const newUser = await User.create({
            firstName: data.username,
            lastName: data.password,
            email: data.username
        });

        console.log('Created a new user:', newUser);
        return res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

 

app.get('/about', (req,res) => {
	console.log('received request for about page')
	res.send('About')
})

// Define a middleware function to log requests to '/something'
app.use('/spam', (req, res, next) => {
    console.log('SPAM REQUEST');
    next(); // Pass control to the next middleware function
});
 
app.listen(5000, () => {
	console.log('server started');
}) 

// /home/sarthak/server
// npm start dev 