const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const courseController = require('./controllers/courseController');
const authController = require('./controllers/authController');
const session = require('express-session');
const roleMiddleware = require('./middlewares/roleMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); 
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        
        cb(null, Date.now() + extension); 
    }
});

const upload = multer({ storage: storage });


mongoose.connect('mongodb://localhost:27017/smartedu-db', {

}).then(() => {
    console.log("Veritabanı bağlantısı başarıyla yapıldı");
}).catch((err) => {
    console.log("Veritabanı bağlanamadı", err);
})

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method', {
    methods: ['POST', 'GET']
}));

app.use(session ({
    secret: 'smartedu-gizli-anahtar',
    resave : false,
    saveUninitialized : true
}));

global.userIn = null;


app.use((req, res, next) => {
    global.userIN = req.session ? req.session.userID : null;
    global.userRole = req.session ? req.session.userRole : null;
    next();
});

app.delete('/courses/:slug', roleMiddleware(["teacher", "admin"]), courseController.deleteCourse);

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/add-course', roleMiddleware(["teacher", "admin"]), (req, res) => {
    res.render('add-course');
});

app.get('/register' , (req , res)=>{
    res.render('register');
})

app.get('/login' , (req , res)=>{
    res.render('login');
})

app.get('/users/dashboard', authMiddleware, authController.getDashboardPage);

app.get('/users/logout' , authController.logoutUser);

app.post('/courses/enroll', authMiddleware, courseController.enrollCourse);

app.post('/courses/rate' , authMiddleware , courseController.rateCourse);

app.post('/courses/complete' , authMiddleware , courseController.markAsCompleted);

app.get('/courses/update/:slug', roleMiddleware(["teacher", "admin"]), courseController.getUpdatePage);

app.put('/courses/:slug', roleMiddleware(["teacher", "admin"]), courseController.updateCourse);

app.get('/courses', courseController.getAllCourses);

app.get('/courses/:slug', courseController.getCourse);

app.post('/users/login', authController.loginUser);

app.post('/users/signup', authController.createUser);

app.post('/courses', roleMiddleware(["teacher", "admin"]), upload.single('video'), courseController.createCourse);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} de çalıştı`);
});