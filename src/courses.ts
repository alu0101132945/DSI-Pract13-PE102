import * as express from 'express'
import { Document, connect, model, Schema, NumberSchemaDefinition, Types } from 'mongoose';
import validator from 'validator'
import { StudentDocumentInterface } from './students';

const router = express.Router();

connect('mongodb://127.0.0.1:27017/dsi-assessment').then(() => {
    console.log('Connected to the database');
}).catch(() => {
    console.log('Something went wrong when conecting to the database');
});

interface CourseDocumentInterface extends Document {
    name: string,
    description: string,
    students: StudentDocumentInterface[],
}

const CourseSchema = new Schema<CourseDocumentInterface>({
    name:{
        type: String,
        required: true,
        unique: true, 
        validate: (value: string) => {
            if (!validator.isAlpha(value)) {
                throw new Error('Names must contain alphanumeric characters only');
            }
        }
    },
    description:{
        type: String,
        required: true,
    },
    students:{
        type: Array<StudentDocumentInterface>,
        required: true,
    }
})

export default router