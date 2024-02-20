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
 
app.listen(5001, () => {
	console.log('server started');
})

// /home/sarthak/server
// npm start dev 