const {body,validationResult} = require('express-validator')  //importing express validator
const gql = require('graphql-tag')
const client = require('../db/apolloClient')
const jwtDecode = require('jwt-decode')
const express = require('express');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const path = require('path');

const app = express();

//var type = upload.single('name');

const fileUpload = async (req, res) => {
    console.log(req.body, req.file);
    const token = req.header('token')
    const tokenContent = jwtDecode(token)
    const classroomId = req.params.classroomId;
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
            "classroomId": 3,
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

module.exports = {
    fileUpload
}