const express = require('express')
const router = express.Router()
const generateToken = require('../utils/jwt')
const {body,validationResult} = require('express-validator')  //importing express validator
const gql = require('graphql-tag')
const client = require('../db/apolloClient')
const bcrypt = require('bcrypt')

const checkAuth = require('../middleware/checkAuth')
const tutorAuth = require('../middleware/tutorAuth')

router.get('/login',[
    body('email','Please Enter valid email adress').isEmail(),
    body('password', 'Please Enter valid password').isLength({
        min:5
    })
], async (req,res)=>{
    const error = validationResult(req)
    const { email, password} = req.body
    
   const {data: {
       users
   } } = await client
  .query({
    query: gql`
    query getUser($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
          password
        }
      }  
    `,
    variables : {
        "email": email
    }
  })

    if(!users.length){
      return res.status(401).send('Envalid email')
    }
    if(password!==users[0].password){
      return res.status(200).send('invalid Password')
    }

    const token = await generateToken(email, users[0].id);
    
    // console.log(this, this.$apolloHelpers);
    return res.send({token:token})
})

router.get('/profile',[checkAuth], async (req,res)=>{
    return res.send('You are Authorized')
})

module.exports = router