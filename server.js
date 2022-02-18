const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const morgan = require('morgan');
const path = require('path');

// create express app
const app = express();
app.use(cookieParser());
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 300000,
        sameSite: 'none'
    }
}));

// upload file path
const FILE_PATH = 'uploads';

// configure multer
const uploadStorage = multer.diskStorage({
    destination: `${FILE_PATH}/`, // Destination to store video 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: uploadStorage,
});

// enable CORS
app.use(cors({ origin: true, credentials: true }));

// add other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// start the app 
const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);

app.get('/', (req, res) => { 
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<h1>It Works!</h1>')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end()
      } else {
        req.session.views = 1
        res.end('<h1>Welcome to the session demo. refresh!</h1>')
      }
});

app.post('/upload-file', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        // make sure file is available
        if (!file) {
            res.status(400).send({
                status: false,
                data: 'No file is selected.'
            });
        } else {
            // send response
            res.send({
                status: true,
                message: 'File is uploaded.',
                data: {
                    name: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }

    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/upload-files', upload.array('files', 8), async (req, res) => {
    try {
        const files = req.files;

        // check if files are available
        if (!files) {
            res.status(400).send({
                status: false,
                data: 'No photo is selected.'
            });
        } else {
            let data = [];

            // iterate over all files
            files.map(f => data.push({
                name: f.originalname,
                mimetype: f.mimetype,
                size: f.size
            }));

            // send response
            res.send({
                status: true,
                message: 'files are uploaded.',
                data: data
            });
        }

    } catch (err) {
        res.status(500).send(err);
    }
});







