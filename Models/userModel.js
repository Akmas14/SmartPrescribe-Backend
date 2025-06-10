const mongoose = require("mongoose")
const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
const userSchema = new mongoose.Schema({
    FullName: {type : String, required: true},
    Email: {
        type : String,
        Unique : true,
        required : true

    },

    Password:{
        type : String
    },
    Role: {
        type: String,
        enum: ['Patient', 'Physician']
    },
    PhoneNumber: {
        type : Number,
        required: true,
        minLength:11,
        maxLength:11
    },
    Gender:{
        type: String,
        enum: ['male','female']
    },
    Age:{
        type:Number,
        
    },
    Specialty: {
        type: String,
        required: function () {
            return this.Role === 'Physician';
        },
    },

    DateOfBirth: {
        type : Date,
        required: function () {
            return this.Role === 'Patient';
        },
        validate: {
            validator: function(value) {
              // Validate that the age is at least 65
              return calculateAge(value) >= 65;
            },
            message: 'Age must be at least 65.'
          }
    },

    

})
module.exports = mongoose.model('User', userSchema);