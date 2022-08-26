const jwt = require('jsonwebtoken')

module.exports = async (req,res,next)=>{
    const token = req.header('token')

    if(!token){
        return res.status(404).send('token Not Found')
    }

    try{
        const validateToken = jwt.verify(token,'ashjgfa')
        // return res.send(validateToken.content.email)
        next()
    }
    catch(ex){
        return res.send(ex)
    }
}
