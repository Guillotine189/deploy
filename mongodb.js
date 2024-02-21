const mongoose = require("mongoose")


mongoose.connect('mongodb"//127.0.0.1:27017/login')
.then(() => {
	console.log('Database Connected')
})
.catch(() => {
	console.log('Failed to connect Database')
})


const newSchema = new mongoose.Schema({
	name:{
		type:string,
		required:true
	}
	password:{
		type:string,
		required:true
	},
	email:{
		type: email,
		required: true
	}
})


const collection = new mongoose.model('collection1',newSchema)

module.export = collection