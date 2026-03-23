import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(

 upload.fields([
        {
           name:"avatar",
           maxCount: 2
        },
        {
           name: "coverImage",
           maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

 //secured routes
 router.route("/logout").post(verifyJWT,logoutUser)
 router.route("/refresh-token").post( refreshAccessToken
)

export default router;

// array ek hi field ma multiple file lata hai