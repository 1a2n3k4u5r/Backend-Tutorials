import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
  // registerUser use karega to kya kya steps follow karenga
// 1.)get user details from frontend
// 2.) validation - not empty
// 3.) check if user already exists: username, email
// 4.) check for images, check for avatar
// 5.) upload  them to cloudinary, avatar
// 6.) create user object - create entry in db
// 7.) remove password and refresh token field from response
// 8.) check for user creation
// return res

 const { fullname, email, username, password } = req.body
 console.log("email:", email);

 if (
    [fullname, email, username, password].some((field) => field?.trim() === "")  
 ) {
    throw new ApiError(400, "All fields are required")
 }

 const existedUser =  User.findOne ({
    $or: [{ username }, { email }]
  })  //   .findOne  sabsa phala find jo hoga user vo return kardega
   if (existedUser) {
    throw new ApiError(409, "User with emaik or username already exists")
   }
  
  const avatarLoacalPath =  req.files?. avatar[0]?.path ; // req.body ka pass sara ka sara data ata hai, middleaware request ka andar  aur field add karta hai, jaisa ki req.body by default express ne da diya hai use prakar multer huma req.files ka access da deta hai, LocalPath isliya kuki  ya abhi humara server pa hai cloudinary  pa nhi gya hai
  const coverImageLocalPath = req.files?.coverImage[0]?.path; 

  if(!avatarLoacalPath) {
    throw new ApiError(400, "Avatar file is required")
  }
  
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar) {
    throw new ApiError(400, "Avatar file is required")
   }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

  const createdUser =   await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while rgisterin the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

});

export {
    registerUser
}

//kuki ya ek array hai or array pa bahut sara method hota hai to hum .map lga sakta  hai lakin yha pa hum .some ka upar hum condition lga ka check karta hai or ya true or false return karta hai.
// .map ma ya problem ha ki usko return kya kar rha hai ,sub pa return hai, or final return kya aa rha hai  ya sab check karna padega

