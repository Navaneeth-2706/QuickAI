import express from "express";
import { generateArticle, generateBolgTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import {auth} from "../middlewares/auth.js"
import  upload  from "../configs/multer.js";

const airouter = express.Router();

airouter.post("/generate-article",auth, generateArticle);
airouter.post('/generate-blog-title',auth,generateBolgTitle)
airouter.post('/generate-image',auth,generateImage)
airouter.post('/remove-image-background',upload.single('image'),auth,removeImageBackground)
airouter.post('/remove-image-object',upload.single('image'),auth,removeImageObject)
airouter.post('/resume-review',upload.single('resume'),auth,resumeReview)


export default airouter; 


