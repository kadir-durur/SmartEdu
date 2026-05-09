const User = require('../models/User');
const bcrypt = require('bcrypt');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).redirect('/');

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error: error.message
        });
    }
}

exports.loginUser = async (req , res)=>{
    try {
        const {email , password} = req.body;

        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).send('Böyle Bir Kullanıcı Bulunamadı!');
        }

        const same = await bcrypt.compare(password , user.password);

        if(same) {
            req.session.userID = user._id;
            req.session.userRole = user.role;
            res.status(200).redirect('/');
        }
        else{
            res.status(400).send('Şifre Yanlış!');
        }

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error: error.message
        });
    }
}

exports.logoutUser = (req , res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    });
};

exports.getDashboardPage = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userID }).populate('courses');
        
        const courses = await Course.find({ user: req.session.userID });

        res.status(200).render('dashboard', {
            page_name: 'dashboard',
            user,
            courses
        });
    } catch (error) {
        res.status(400).redirect('/');
    }
};