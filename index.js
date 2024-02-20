import express from 'express';

const app = express();


app.set('view engine', "ejs");

app.get('/', (req,res) => {
	console.log('received request for home page')
	// res.send('Working Home')
	res.render('index', {name: "Sarthak"})
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
 
app.listen(5002, () => {
	console.log('server started');
})

// /home/sarthak/server
// npm start dev 