import * as express from 'express'
import { Document, connect, model, Schema, NumberSchemaDefinition } from 'mongoose';
import validator from 'validator'

const router = express.Router();

connect('mongodb://127.0.0.1:27017/dsi-assessment').then(() => {
    console.log('Connected to the database');
}).catch(() => {
    console.log('Something went wrong when conecting to the database');
});

export interface StudentDocumentInterface extends Document {
    name: string,
    surname: string,
    age: number,
    email: string
}

const StudentSchema = new Schema<StudentDocumentInterface>({
    name:{
        type: String,
        required: true,
        validate: (value: string) => {
            if(!value.match(/^[0-9]/)){
                throw new Error('Names must contain letters only')
            } else if (!validator.isAlpha(value)) {
                throw new Error('Names must contain alphanumeric characters only');
            }
        }
    },
    surname:{
        type: String,
        required: true,
        validate: (value: string) => {
            if(!value.match(/^[0-9]/)){
                throw new Error('Surnames must contain letters only')
            } else if (!validator.isAlpha(value)) {
                throw new Error('Surnames must contain alphanumeric characters only');
            }
        }
    },
    age:{
        type: Number,
        required: true,
        validate: (value: number) => {
            if(value > 100 || value < 0){
                throw new Error('You must use a valid age')
            }
        }
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate: (value: string) => {
            if (!validator.isEmail(value)) {
                throw new Error('Emails must use a correct email form (example@example.com)');
            }
        }
    }
})

const Student = model<StudentDocumentInterface>('Student', StudentSchema)

router.post('/students', async (req, res) => {
    const student = new Student(req.body);

    try {
        await student.save();
        return res.status(201).send(student);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.get('/students', async (req, res) => {
    const filter = req.query.name?{name: req.query.name.toString()}:{};

    try{
        const students = await Student.find(filter)
        if (students.length !== 0) {
            return res.send(students);
        }
        return res.status(404).send();
    } catch(error) {
        return res.status(500).send(error);
    }
    
    
});

router.get('/students:email', async (req,res) => {
    try{
        const student = await Student.findOne({email: req.query.email?.toString()})
        if(student){
            return res.send(student);
        }
        return res.status(404).send();
    } catch(error){
        return res.status(500).send(error);
    }

})

router.patch('/students', async (req, res) => {
    if (!req.query.email) {
        return res.status(400).send({
            error: 'An email must be provided',
        });
    }

    const allowedUpdates = ['name', 'surname', 'email', 'age'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).send({
            error: 'Update is not allowed',
        });
    }

    try {
        const student = await Student.findOneAndUpdate({
            email: req.query.email.toString()
        },
        req.body,
        {
            new: true,
            runValidators: true
        });
        
        if (student) {
            return res.send(student);
        }
        return res.status(404).send();
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete('/students', async (req, res) => {
    if (!req.query.email) {
        res.status(400).send({
            error: 'An email must be provided',
        });
    } else {
        try{
            const student = await Student.findOneAndDelete({name: req.query.email.toString()})
            if(student){
                return res.status(201).send(`${student.name} ${student.surname} deleted`);
            }
        }catch(error){
            return res.status(500).send(error);
        }
    }
})


export default router