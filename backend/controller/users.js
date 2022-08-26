const {body,validationResult} = require('express-validator')  //importing express validator
const gql = require('graphql-tag')
const client = require('../db/apolloClient')
const jwtDecode = require('jwt-decode')


const getTutors = async (req, res) => {
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    
    const {data: {
        users
    } } = await client
   .query({
     query: gql`
     query MyQuery($roleId: Int!) {
        users(where: {user_role: {id: {_eq: $roleId}}}) {
          id
          name
          email
          classrooms {
            id
            name
          }
          created_at
          updated_at
        }
      }
       
     `,
     variables : {
        "roleId": 1
      }
   })
  return res.status(200).json({ success: true, data: users})
}

const getStudents = async (req, res) => {
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    
    const {data: {
        users
    } } = await client
   .query({
     query: gql`
     query MyQuery($roleId: Int!) {
        users(where: {user_role: {id: {_eq: $roleId}}}) {
          id
          name
          email
          created_at
          updated_at
          classroom_members_aggregate {
            nodes {
              classroom_id
            }
          }
        }
      }      
     `,
     variables : {
        "roleId": 2
      }
   })
  return res.status(200).json({ success: true, data: users})
}


module.exports = {
    getTutors,
    getStudents
  }