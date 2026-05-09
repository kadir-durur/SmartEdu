const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    slug: {
        type: String,
        unique: true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    videoUrl: {
        type: String,
        required: false 
    },
    ratings : [{
        user: {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        },
        rating : {
            type : Number,
            required : true,
            min : 1,
            max : 5
        }
    }]
});


CourseSchema.pre('validate', function() {
    this.slug = slugify(this.name, {
        lower: true,
        strict: true
    });
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;