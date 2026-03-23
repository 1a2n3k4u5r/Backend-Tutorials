import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save ({ validateBeforeSave: false})

    return {accessToken, refreshToken}


  } catch(errror){
    throw new ApiError
  }

}
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

 const { fullname, email, username, password } = req.body   // yaha humna req.body se abstract kiya sara ka sara data point
//  console.log("email:", email);

 if (
    [fullname, email, username, password].some((field) => field?.trim() === "")  
 ) {
    throw new ApiError(400, "All fields are required")
 }  // yha humna check kara ki vo sara ka sara point khi empty string to nhi pass kar di kisi na

 const existedUser = await User.findOne ({
    $or: [{ username }, { email }]
  }) // usa bad humna check kara ki already user exist to nhi karta is email ya fir is username  se 
 //   .findOne  sabsa phala find jo hoga user vo return kardega
   if (existedUser) {
    throw new ApiError(409, "User with emaik or username already exists")
   }   // agar kart ha to  error da do
  
   console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path ; // fir humna localpath nikala avatar ka aur upload karna ki kosis karenga 
  // req.body ka pass sara ka sara data ata hai, middleaware request ka andar  aur field add karta hai, jaisa ki req.body by default express ne da diya hai use prakar multer huma req.files ka access da deta hai, LocalPath isliya kuki  ya abhi humara server pa hai cloudinary  pa nhi gya hai


//   const coverImageLocalPath = req.files?.coverImage[0]?.path; 

  let coverImageLocalPath;   // here scope issue
  if (req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length > 0)  {
    coverImageLocalPath = req.files.coverImage[0].path
  } // ya par huma ek bag mila jisa humna resolve kar diya 
  // isArray bata hai ki humara pass properly array aya  hai ki nhi aya hai jo bhi humna argument pass kiya hai

  if(!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required")
  }      // avatar agar nhi mila to error through kar do
  
   const avatar = await uploadOnCloudinary(avatarLocalPath)    // agar mil gya to cloudinary pa upload kar do or await karna jaruri hai

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)    // agar coverimage apko nhi mil rhi localpath to cloud apko error nhi da bas empty string return kar data hai
  
   if(!avatarLocalPath) {
  throw new ApiError(400, "avatar file is required")
}    // agar ya par avatar nhi upload hua hai to error da do


  const user = await User.create({   // user.create se humna value push kar di
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })    // agar sab kuch hogya hai to ek object create kar do

  const createdUser =   await User.findById(user._id).select(
    "-password -refreshToken"
  )   // -password -refreshToken hata do receive value hai 

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while rgisterin the user")
  }    // agar user nhi create nhi hua ha to error da do

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")   // agar ho gya hai successfully return kar do
  )

});

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  //username or email
  // find the user
  //password check
  //access and refresh token
  // send cookie

  const{email, username, password } = req.body
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  // Here is an alternative of above code based on logic discussed in video:
  //if (!(usernsme || email)) {
  // throw.new ApiError(400, "username bor email is required")
  //  }
  
  const user = await User.findOne({
    $or: [{username}, {email}]
})

if (!user) {
  throw new ApiError(404, "User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
}

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken",  refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken
      },
      "User logged In Successfully"
    )
  )

}) 

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
        }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200, {}, "User logged Out"))

})
// logout kisa kiya jayaga 
// 1.) first step is to clear the cookie
// 2.) or second step pa apko refreshToken ko bhi  user.model.js sa bhi to reset  karna pada ga

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
     const user = await User.findById(decodedToken?._id)
  
     if(!user) {
      throw new ApiError(401, "unauthorized request")
     }
  
     if(incomingRefreshToken !== urser?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token is expired or used")
     }
  
     const options = {
      httpOnly: true,
      secure: true
     }
  
     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
     )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
    
  }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

//kuki ya ek array hai or array pa bahut sara method hota hai to hum .map lga sakta  hai lakin yha pa hum .some ka upar hum condition lga ka check karta hai or ya true or false return karta hai.
// .map ma ya problem ha ki usko return kya kar rha hai ,sub pa return hai, or final return kya aa rha hai  ya sab check karna padega

 // $or it is a mongodb operators

 // middleaware - matlab jana sa phala mil ka jaya ga. example - jisa multer  ma form ka data to ja rha sath ma images ko bhi lata jao sath ma  yahi to middleaware  tha.
 // cookie = two way access hoti hai 
 
 // uses of accesToken and refreshToken is that  ki user ko bar bar apna email or password na dana pada,or accesToken is a short lived hota hai means one day ya khi save nhi hota hai sirf user ka pass hota hai  or dusra hota hai session storage jisko hum refreshToken bhi bolta hai jisko hum database ma bhi rakta hai
