const jwt  = require('jsonwebtoken')

//generating the JWT Token
const generateToken = async (email,id) =>{
    const content = {
        user_email : email,
        user_id : id
    }
    const key = 'ashjgfa'
    const options = {
        expiresIn: 6000000
    }

    const token = jwt.sign({content},key,options)

    return await token
}

module.exports = generateToken