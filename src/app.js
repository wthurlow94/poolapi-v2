import express from 'express';
import bodyParser from 'body-parser'
import routes from './routes/index';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'

const app = express();

const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors())
app.use('/', routes);

mongoose.connect(process.env.CONNECTION_URL,
    { 
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting to db")
else
    console.log("Db connected successfully")



app.listen(port, () => {
    console.log('Server started on port ' + port);

});

export default app;
