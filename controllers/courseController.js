const Course = require('../models/Course');
const User = require('../models/User');



exports.createCourse = async (req, res) => {
    try {
        req.body.user = req.session.userID;
        
        if (req.file) {
            req.body.videoUrl = '/uploads/' + req.file.filename;
        }

        const course = await Course.create(req.body);
        res.status(201).redirect('/courses');
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message });
    }
};

exports.getAllCourses = async (req , res)=>{
    try {
        const courses = await Course.find().sort('-createdAt');
        res.status(200).render('courses' , {
            courses
        });
    } catch (error) {
        console.log("Kurs Eklenirken Hata Oluştu:" , error);

        res.status(400).json({
            status : 'fail',
            error : error.message
        });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug }).populate('user');
        
        let averageRating = 0;
        if (course.ratings && course.ratings.length > 0) {
            const total = course.ratings.reduce((acc, obj) => acc + obj.rating, 0);
            averageRating = (total / course.ratings.length).toFixed(1); 
        }

        let userRating = null;
        if (req.session.userID && course.ratings) {
            const existing = course.ratings.find(r => r.user.toString() === req.session.userID.toString());
            if (existing) {
                userRating = existing.rating;
            }
        }

        res.status(200).render('course', {
            course,
            page_name: 'courses',
            averageRating, 
            userRating     
        });
    } catch (error) {
        res.status(400).redirect('/courses');
    }
};

exports.deleteCourse = async (req , res)=>{
    try {
        await Course.findOneAndDelete({ slug:req.params.slug});

        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).redirect('/users/dashboard');
    }
}

exports.getUpdatePage = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        res.status(200).render('update-course', {
            course,
            page_name: 'courses',
        });
    } catch (error) {
        res.status(400).redirect('/users/dashboard');
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        
        course.name = req.body.name;
        course.description = req.body.description;
        
        course.save(); 

        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).redirect('/users/dashboard');
    }
};

exports.enrollCourse = async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);
        
        await user.updateOne({ $addToSet: { courses: req.body.course_id } });

        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).redirect('/courses');
    }
};

exports.markAsCompleted = async (req , res)=>{
    try {
        const user = await User.findById(req.session.userID);

        await user.updateOne({$addToSet : {completedCourses : req.body.course_id}});

        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).redirect('/courses');
    }
};

exports.rateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.body.course_id);
        
        const existingRating = course.ratings.find(r => r.user.toString() === req.session.userID.toString());

        if (existingRating) {
            existingRating.rating = req.body.rating;
        } else {
            course.ratings.push({ user: req.session.userID, rating: req.body.rating });
        }

        course.markModified('ratings'); 
        await course.save();
        
        res.status(200).redirect(`/courses/${course.slug}`);
    } catch (error) {
        res.status(400).redirect('/courses');
    }
};