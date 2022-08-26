const jwt = require('jsonwebtoken')
const gql = require('graphql-tag')
const client = require('../db/apolloClient')

module.exports = async (req,res,next)=>{
    const token = req.header('token')

    if(!token){
        return res.status(404).send('token Not Found')
    }

    try{
        const validateToken = jwt.verify(token,'ashjgfa')

        const {data: {
            users_by_pk
        } } = await client
       .query({
         query: gql`
         query MyQuery($id: Int!) {
            users_by_pk(id: $id) {
              email
              user_role {
                role
              }
            }
          }
          
         `,
         variables : {
            "id": validateToken.content.user_id
          }
       })
       
       if(users_by_pk == null){
            return res.status(404).send('User not found!')
        }
    
       if(users_by_pk != null && users_by_pk.user_role.role != "tutor"){
            return res.status(404).send('You are not authorized!')
       }
       
        next()
    }
    catch(ex){
        return res.send(ex)
    }
}
