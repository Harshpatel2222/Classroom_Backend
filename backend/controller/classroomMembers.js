const {body,validationResult} = require('express-validator')  //importing express validator
const gql = require('graphql-tag')
const client = require('../db/apolloClient')
const jwtDecode = require('jwt-decode')

const getClassroomMembers = async (req, res) => {
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    const classroomId = req.params.classroomId

    //check if classroom is exist or not
    try {
        const {data: {
          classroom
      } } = await client
     .query({
       query: gql`
       query MyQuery ($id:Int!){
        classroom(where: {id: {_eq: $id}}) {
          id
          name
          created_by
        }
      }         
       `,
       variables : {
        "id": classroomId,
      }
     })
     //checking if class is there or not
     if(classroom.length===0){
        return res.status(401).send("Class does not exits")
    }
    //checking if tutor is in this class or not
    if(classroom[0].created_by!==tokenContent.content.user_id){
        return res.status(401).send("You can not access this class")
    }
      } catch (error) {
        return res.status(401).send({ success: false, error: error })
      }

      //getting list of classroom membar
      try {
        const {data: {
            classroom_members
        } } = await client
       .query({
         query: gql`
         query MyQuery($classroomId : Int!) {
            classroom_members(where: {classroom_id: {_eq: $classroomId}}) {
              user {
                id
                email
                name
              }
            }
          }
         `,
         variables : {
            "classroomId": classroomId
          }
       })
       //cheing if classroom members is there or not
       if(classroom_members.length===0){
        return res.status(404).send("Classroom members not Found")
       }
    
      return res.status(200).json({ success: true, data: classroom_members})
      } catch (error) {
          
      }
   
}

const addClassroomMembers = async (req, res) => {
    const classroomId = req.params.classroomId
    const { userId } = req.body
    const token = req.header('token')
    const tokenContent = jwtDecode(token)

    //checking if classroom is accesing the same tutor who is created the classroom or not
    try {
        const {data: {
          classroom
      } } = await client
     .query({
       query: gql`
       query MyQuery ($id:Int!){
        classroom(where: {id: {_eq: $id}}) {
          name
          created_by
        }
      }         
       `,
       variables : {
          "id": classroomId
        }
     })

     if(classroom[0].created_by!==tokenContent.content.user_id){
        return res.status(401).send("You are not authorized for this classroom")
    }
      } catch (error) {
        return res.status(401).send({ success: false, error: error })
      }

    //checing if student is already member or not
    try {
        const {data: {
            classroom_members
        } } = await client
       .query({
         query: gql`
         query MyQuery($classroomId: Int!, $userId: Int!) {
            classroom_members(where: {_and: {classroom_id: {_eq: $classroomId}, member_id: {_eq: $userId}}}) {
              user {
                id
                email
                name
              }
              classroom {
                created_by
              }
            }
          }  
         `,
         variables : {
            "classroomId": classroomId,
            "userId": userId
          }
       })
       if(classroom_members.length){
        return res.status(404).send("Classroom member already exist!")
       }
    } catch (error) {
        return res.status(401).send({ success: false, error: error })
    }

    // if not member than add in classroom
    try {
      const {data: {
        insert_classroom_members_one
        } } = await client
       .mutate({
         mutation: gql`
         mutation MyMutation($classroomId: Int!, $userId : Int!) {
            insert_classroom_members_one(object: {classroom_id: $classroomId, member_id: $userId}) {
              id
            }
          }
         `,
         variables : {
            "classroomId": classroomId,
            "userId": userId
          }
       })
       
      return res.status(201).send({ success: true, data: "Member sucessfully Added" })
    } catch (error) {
      return res.status(401).send({ success: false, error: error })
    }
    
  }
  
const deleteClassroomMember = async (req, res) => {
    const id = req.params.id
  
    const token = req.header('token')
    const tokenContent = jwtDecode(token)

     //checing if membar is exist or not
     try {
        const {data: {
            classroom_members_by_pk
        } } = await client
       .query({
         query: gql`
         query MyQuery($id: Int!) {
            classroom_members_by_pk(id: $id) {
              classroom_id
              member_id
              id
            }
          }          
         `,
         variables : {
            "id": id
          }
       })
       if(classroom_members_by_pk===null){
        return res.status(404).send("Classroom member dose not exist!")
       }
    } catch (error) {
        return res.status(401).send({ success: false, error: error })
    }
    
    //checking if classroom is accesing the same tutor who is created the classroom or not
    try {
        const {data: {
            classroom_members
      } } = await client
     .query({
       query: gql`
       query MyQuery ($id:Int!){
        classroom_members(where: {id: {_eq: $id}}) {
          classroom {
            created_by
          }
        }
      }                
       `,
       variables : {
          "id": id
        }
     })
     if(classroom_members[0].classroom.created_by!==tokenContent.content.user_id){
        return res.status(401).send("You are not authorized for this classroom")
    }
      } catch (error) {
        return res.status(401).send({ success: false, error: error })
      }

   
  
    //deleteing the member
    try {
      const {data: {
        delete_classroom_members_by_pk
        } } = await client
       .mutate({
         mutation: gql`
         mutation MyMutation($id: Int!) {
            delete_classroom_members_by_pk(id: $id) {
              id
            }
          }
         `,
         variables : {
            "id": id
          }
       })
  
       if(delete_classroom_members_by_pk.affected_rows===0){
          return res.status(404).send("Delete failed!")
        }
      return res.status(201).send({ success: true, data: "Specify classroom member deleted successfully"})
    } catch (error) {
      return res.status(401).send({ success: false, error: error })
    }
  
  }

module.exports = {
  getClassroomMembers,
  addClassroomMembers,
  deleteClassroomMember
}