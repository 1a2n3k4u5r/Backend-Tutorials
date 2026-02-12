import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
     },
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
     },
       fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
     },
       avatar: {
        type: String,  //cloudinary url
        require: true
      },
       coverImage: {
        type: String, 
      },
      watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
      }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken:{
        type: String
 }
}, 
{
    timestamps: true
}
)

userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPassword = async function (password){
     return await bcrypt.compare(password, this.password) // cryptography hai computation power use hoti hai to time lagta hai matlab await karna padega,return humsa ture or false ma bta data hai ki ye return hua ki nhi
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {       // all things in the class is a payload
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
     {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     }

    )
}
userSchema.methods.generateRefreshToken  = function(){
   return jwt.sign(
    {       // all things in the class is a payload
        _id: this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
     {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     }

    )
}
export const User = mongoose.model("User", userSchema);


// jab bhi app pre ka andar callback huma aisa [pre("save", () => {})]nhi likhna nhi chaiya koiki bahut problem hoti hai because javascript ka andar arrowfunction ka pass this ka reference nhi hota hai, context nhi pta hota hai usa lakin yha par pta hona bahut jaruri ha

//bcrypt hash ka sath sath password bhi check kar sakti hai

//JWT ek Bearer token hota hai jo Authorization header ke through bheja jata hai.matlab jiska pass ye token hoga data  usa bhaja jayga



// refresh token ma information kam hoti hai koiki ya bar-bar refresh hota rahta hai  ya. sirf id rahta hai