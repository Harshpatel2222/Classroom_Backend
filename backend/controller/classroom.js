const {body,validationResult} = require('express-validator')  //importing express validator
const gql = require('graphql-tag')
const client = require('../db/apolloClient')
const jwtDecode = require('jwt-decode')


const getClassroom = async (req, res) => {
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
  
    try {
      const {data: {
        classroom
    } } = await client
   .query({
     query: gql`
     query MyQuery ($createdBy:Int!){
        classroom(where: {created_by: {_eq: $createdBy}}) {
          name
          id
          created_by
        }
      }
        
     `,
     variables : {
        "createdBy": tokenContent.content.user_id
      }
   })
  return res.status(200).json({ success: true, data: classroom})
    } catch (error) {
      return res.status(401).send({ success: false, error: error })
    }
    
}

const createClassroom = async (req, res) => {
  const { name } = req.body
  const token = req.header('token')
  const tokenContent = jwtDecode(token)

  try {
    const {data: {
      insert_classroom_one
      } } = await client
     .mutate({
       mutation: gql`
       mutation MyMutation($name:String!, $createdBy:Int!) {
          insert_classroom_one(object: {name: $name, created_by: $createdBy}) {
            id
            name
          }
        }
       `,
       variables : {
          "name": name,
          "createdBy": tokenContent.content.user_id
        }
     })
    return res.status(201).send({ success: true, data: insert_classroom_one })
  } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }
  
}

const updateClassroom = async (req, res) => {
  const { name } = req.body
  const id = req.params.id

  const token = req.header('token')
  const tokenContent = jwtDecode(token)

  try {
    const {data: {
      classroom
  } } = await client
 .query({
   query: gql`
   query MyQuery ($id:Int!){
      classroom(where: {id: {_eq: $id}}) {
        name
        id
        created_by
      }
    }
      
   `,
   variables : {
      "id": id
    }
 })
 if(classroom.length===0){
   return res.status(404).send("Class not Found")
 }
 
 if(classroom[0].created_by!==tokenContent.content.user_id){
  return res.status(401).send("You can not update this classroom")
}
 
  } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }

  try {
    const {data: {
      update_classroom
      } } = await client
     .mutate({
       mutation: gql`
       mutation MyMutation ($id:Int!,$createdBy:Int!,$name:String!) {
        update_classroom(where: {id: {_eq: $id}, created_by: {_eq: $createdBy}}, _set: {name: $name}) {
          affected_rows
        }
      }
      
       `,
       variables : {
          "name": name,
          "createdBy": tokenContent.content.user_id,
          "id" :  id
        }
     })
     return res.status(201).send({ success: true, data: "Classroom updated successfully"})

    } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }
  
}

const deleteClassroom = async (req, res) => {
  const id = req.params.id

  const token = req.header('token')
  const tokenContent = jwtDecode(token)

  try {
    const {data: {
          classroom
      } } = await client
    .query({
      query: gql`
      query MyQuery ($id:Int!){
          classroom(where: {id: {_eq: $id}}) {
            name
            id
            created_by
          }
        }
      `,
      variables : {
          "id": id
        }
    })
    if(classroom.length===0){
      return res.status(404).send("Class not Found")
    }
    
    if(classroom[0].created_by!==tokenContent.content.user_id){
      return res.status(401).send("You can not delete this classroom")
    }
 
  } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }

  try {
    const {data: {
      delete_classroom
      } } = await client
     .mutate({
       mutation: gql`
       mutation MyMutation($created_by: Int!, $classroom_id: Int!) {
        delete_classroom(where: {created_by: {_eq: $created_by}, id: {_eq: $classroom_id}}) {
          affected_rows
        }
      }
       `,
       variables : {
        "created_by": tokenContent.content.user_id,
        "classroom_id": id 
      }
     })

     if(delete_classroom.data.affected_rows===0){
        return res.status(404).send("Delete failed!")
      }

    return res.status(201).send({ success: true, data: "Classroom deleted successfully"})
    
  } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }

}

module.exports = {
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom
}