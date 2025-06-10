//const User = require("../models/userModel");
const User = require('../Models/userModel')
const Patient = require('../Models/patientModel')
const Physician = require('../Models/physicianModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const nodemailer = require('nodemailer');
const OTP = require('../Models/OTPModel')

const signup = async(req,res) => {
    try{
    let {FullName, Email, Password, Role, PhoneNumber,Gender,Specialty,DateOfBirth} = req.body
    const foundUser = await User.findOne({Email:Email})
    if(foundUser)
        return res.status(500).json({message:"Email already exists log in or enter different Email"})
    const hashedPassword = await bcrypt.hash(Password, 10);
        let newUser;
        let newPhysician;
        let newPatient;
        //console.log(req.body)
        const today = new Date();
    const birthDate = new Date(DateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (Role==='Patient'){
         DateOfBirth = req.body.DateOfBirth
         newUser = new User({
            FullName:FullName,
            Email: Email,
            Password: hashedPassword,
            Role: Role,
            Gender:Gender,
            Age:age,
            PhoneNumber: PhoneNumber,
            DateOfBirth: DateOfBirth
        })
    }
    else{
        Specialty = req.body.Specialty
        console.log(Specialty)
         newUser = new User({
            FullName:FullName,
            Email: Email,
            Password: hashedPassword,
            Role: Role,
            PhoneNumber: PhoneNumber,
            Gender:Gender,
            Specialty: Specialty
        })
    }
    console.log(newUser)
    await newUser.save();
    console.log(1)

    if (Role==='Patient'){
            newPatient = new Patient({
            user:newUser._id
        })
        await newPatient.save()
        console.log("test "+newPatient.user)

    }
    
    else{
            console.log(newUser._id)
            newPhysician = new Physician({
            User: newUser._id
        })
        await newPhysician.save()
        //console.log("test "+newPhysician.User)

    }
    console.log(newPhysician)

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "Role": newUser.Role, // Role of the user (Patient/Physician)
                "userid": newUser._id,
                "Email": newUser.Email,
                "PhoneNumber": newUser.PhoneNumber,
                "FullName": newUser.FullName
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { "Email": newUser.Email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '3000d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        //secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing username and roles 
    //res.json({ accessToken })        
    res.status(201).json({ message: "User registered successfully", accessToken });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }

}
const verifyOTP = async (req,res) =>{
    try{
        const otp = await OTP.findOne({Email:req.params.Email})
        console.log('test'+req.params.Email)
        console.log(otp)
    const match = await bcrypt.compare(req.body.otp, otp.OTP);
        console.log(match)
    if (!match) return res.status(401).json({ message: "Wrong OTP" });

    if (new Date() > otp.OTP.expiry) {
      return res.status(500).json({ message: "OTP expired " });
    }
    
    await OTP.findByIdAndDelete(OTP._id)
    console.log('testtt')
    return res.status(200).json(match)
    }
    catch(e){
        return res.status(500).json({message:e.message})
    }
}
const ContinueAsGuest = (req,res)=>{
    const accessToken = jwt.sign({},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
    )
    res.json(accessToken)
}
const login = asyncHandler(async (req, res) => {
    const { Email, password } = req.body

    if (!Email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const foundUser1 = await User.find({ Email:Email }).exec()
    const test = await User.findById("6706901c2d2a7fe18eef3125")
    const foundUser = await User.findOne({ Email:Email })
    console.log(foundUser+" test")
    console.log(foundUser1+" test")
    console.log(test+" ww")

    console.log(req.body)
    if (!foundUser) {
        return res.status(401).json({ message: 'incorrect email' })
    }

    const match = await bcrypt.compare(password, foundUser.Password)

    if (!match) return res.status(401).json({ message: 'incorrect password' })

    const accessToken = jwt.sign(
        {
        "UserInfo": {
            "Role": foundUser.Role, // Role of the user (Patient/Physician)
            "userid": foundUser._id,
            "Email": foundUser.Email,
            "PhoneNumber": foundUser.PhoneNumber,
            "FullName": foundUser.FullName
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '3000d' }
    )

    const refreshToken = jwt.sign(
        { "Role": foundUser.Role, // Role of the user (Patient/Physician)
            "userid": foundUser._id,
            "Email": foundUser.Email,
            "PhoneNumber": foundUser.PhoneNumber,
            "FullName": foundUser.FullName },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '3000d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', accessToken, {
        httpOnly: true, //accessible only by web server 
        secure: false, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing username and roles 
    res.json({ accessToken })
})
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ Email: decoded.Email }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "Role": foundUser.Role, // Role of the user (Patient/Physician)
            "userid": foundUser._id,
            "Email": foundUser.Email,
            "PhoneNumber": foundUser.PhoneNumber,
            "FullName": foundUser.FullName
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '3000d' }
            )

            res.json({ accessToken })
        })
    )
}
const logout = (req, res) => {
    console.log('test2')
    const cookies = req.cookies
    console.log(cookies.jwt)
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    console.log('tstttst')
    res.clearCookie('jwt', { httpOnly: false, sameSite: 'None', secure: true })
    res.status(200).json({ message: 'Cookie cleared' })
}
const generateOTPWithExpiry = async (req,res)=> {
    try
    {const email = req.body.email
    const isSigningUp = req.body.firstTime 
        console.log("haaaaa"+email)
    if(isSigningUp){
        const user = await User.findOne({Email:email})
        if(user){
            console.log('teest')
            return res.status(500).json({message:'Email already exists please enter a different one'})
        }
    }
    const generatedOTP = Math.random().toString(10).substr(2, 4); // Generate a new OTP
  
    const expiry = new Date(); // Set OTP expiry to current time
    expiry.setMinutes(expiry.getMinutes() + 5); // Set expiry time (e.g., 5 minutes from now)
    const hashedOTP = await bcrypt.hash(generatedOTP, 8)
    const formattedExpiry = expiry.toLocaleString(); // Format expiry date as a string
    console.log(email)
    const deleteAll = await OTP.findOneAndDelete({Email:email})
    const OTP1 = new OTP({
        Email:email,
        OTP:hashedOTP,
        expiry:formattedExpiry
    })
    await OTP1.save()
    sendOTPByEmail(email,generatedOTP,expiry)
    return res.status(200).json(OTP1)
}
    catch(e){
        return res.status(500).json({message:e.message})
    }
  }
const newPassword = async (req,res) => {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({Email:email})
    
    if(!user){
        return res.status(500).json({message:'Email does not exist please chech what you have entered'})
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const updatedPassword = await User.findOneAndUpdate({Email:email},{Password:hashedPassword})
    return res.status(200).json({message:'Successfully updated password'})
}
  
  
  function sendOTPByEmail(email, otp, expiry) {
    const formattedExpiry = expiry.toLocaleString(); // Format expiry date as a string
  
    const transporter = nodemailer.createTransport({
      // Configure your email service details here
      service: 'gmail',
      auth: {
        user: process.env.AUTH_EMAIL,
  
        pass: process.env.AUTH_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    const mailOptions = {
  
      to: email,
      subject: 'Your One-Time Password',
      text: `Your OTP is: ${otp}\nExpiry Date: ${formattedExpiry}` // Include expiry date in the email text
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
module.exports = {
    login,
    refresh,
    logout,
    signup,
    ContinueAsGuest,
    generateOTPWithExpiry,
    verifyOTP,
    newPassword
}
