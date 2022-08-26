const express = require('express')
const { readQuery } = require('./db/apolloClient')
const app  = express()

const gql = require('graphql-tag')
const client = require('./db/apolloClient')
const jwtDecode = require('jwt-decode')
const path = require('path');

const auth = require('./routes/auth')
const classroom = require('./routes/classroom')
const users = require('./routes/users')
const classroomMembers = require('./routes/classroomMembers')
const tutorAuth = require('./middleware/tutorAuth')
const multer = require('multer');
const upload = multer();
const fs = require('fs')

var type = upload.single('name');

app.use(express.json());
app.use('/auth', auth)
app.use('/classrooms',classroom)
app.use('/users',users)
app.use('/classroom',[tutorAuth], classroomMembers)
// app.use(upload.array()); 
// app.use(express.static('public'));



// const fileUpload = async (req, res) => {
//     console.log(req.body, req.file);
//     const { originalname, mimetype, buffer } = req.file;
//     let fileBuffer = Buffer.from(buffer, 'base64');
    
//     fs.writeFileSync("./public/files/" + originalname, fileBuffer, 'base64');
//     return res.status(200).send("File uploaded successfully!")


// }

const fileUpload = async (req, res) => {
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    const classroomId = req.params.id;
    const { originalname, mimetype, buffer } = req.file;
    const { description } = req.body
    let fileBuffer = Buffer.from(buffer, 'base64');
    const fileExtension = path.extname(originalname);
try {
    const {data: {
        insert_files_one
      } } = await client
     .mutate({
       mutation: gql`
       mutation MyMutation($name: String!, $type: String!, $description: String!, $classroomId: Int!, $uploadedBy: Int!) {
        insert_files_one(object: {name: $name, type: $type, classroom_id: $classroomId, description: $description, uploaded_by: $uploadedBy}) {
          id
        }
      }          
       `,
       variables : {
        "name": originalname,
        "description": description,
        "type": mimetype,
        "classroomId": classroomId,
        "uploadedBy": tokenContent.content.user_id
      }
     })
     if(insert_files_one == null){
        return res.status(401).send("File not uploaded successfully!")
     }

     const newFileName = insert_files_one.id + fileExtension;
     fs.writeFileSync("./public/files/" + newFileName, fileBuffer, 'base64');

    return res.status(201).send({ success: true, data: insert_files_one })
  } catch (error) {
    return res.status(401).send({ success: false, error: error })
  }
    }

const getFiles = async (req,res,) =>{
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    const id = req.params.id
    try {
        const {data: {
            files
      } } = await client
     .query({
       query: gql`
       query MyQuery ($id:Int){
        files(where: {classroom_id: {_eq: $id}}) {
          name
          type
          description
          id
          updated_at
          uploaded_by
        }
      }
       `,
       variables : {
        "id": id
      }
     })
    return res.status(200).json({ success: true, data: files})
      } catch (error) {
        return res.status(401).send({ success: false, error: error })
      }
}
    
app.post('/fileUpload/:id',type, fileUpload)
app.get('/getFiles/:id', getFiles)

app.listen(5001,()=>{
    console.log('Running on 5001');
})