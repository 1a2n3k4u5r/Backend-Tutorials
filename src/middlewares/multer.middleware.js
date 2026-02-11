import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname)
  }
})

 export const upload = multer({
  storage,
  })


// function ka andar jo file hai vo multer ka pass hi hota hai, request to hai hi ap ka pas -> jo user sa request aa rhi hai,  ek file access or mil jata hai jiska andar apko sari file mil jati hai, agar function ka andar file bhi  aa rhi hai isliye hi multer use hota hai, express ma file nhi hoti hai yha par cb matlab call back