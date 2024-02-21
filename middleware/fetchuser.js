import jwt from 'jsonwebtoken'
const jwtSecret = '!@#$QWERqwer1234'

const fetchuser = async (req,res,next) => {
	const token = req.header('auth-token')
	if(!token){
		res.status(401).json({error:"Invalid Token"})
	}

	console.log(token)
	try{
		const data = await jwt.verify(token, jwtSecret);
		console.log("Data for " + data)
		// console.log(req)
		req.user = data
		next()
	}
	catch(error){
		res.status(500).json({error:"Internal server error"})	
	}



}

export default  fetchuser;