const mongoose = require('mongoose');
const bcrpyt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'], 
        default: 'student' 
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    completedCourses : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Course'
    }]
});

UserSchema.pre('save' , async function () {
    const salt = await bcrpyt.genSalt(10)

    this.password = await bcrpyt.hash(this.password , salt)
});

const User = mongoose.model('User', UserSchema);
module.exports = User;