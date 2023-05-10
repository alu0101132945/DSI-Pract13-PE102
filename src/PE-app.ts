import * as express from 'express';
import students from './students';
//import courses from './courses';

const app = express();
app.use(express.json());

app.use('/students', students);
//app.use('/courses', courses);

/**
 * Show 404 error if access to a wrong path.
 */
app.get('*', (_, res) => {
    res.status(404).send();
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000.')
})