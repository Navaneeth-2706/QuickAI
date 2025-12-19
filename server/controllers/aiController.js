
// export const generateArticle = async (req, res)=>{
//   try{
//     const {userId} = req.auth();
//     const {prompt, length} = req.body;
//     const plan = req.plan;
//     const free_usage = req.free_usage
//     if(plan !== 'premium' && free_usage >=10){
//       return res.json({success:false , message:"limit reached. Upgrade to continue."})

//     }
//     else{
      
//     }

//   }
//   catch(error){

//   }

// }


import { model } from "../utils/huggingfaceModel.js";
import { clerkClient } from "@clerk/express";
import sql from "../configs/db.js"
import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import * as pdf from "pdf-parse"


export const generateArticle = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, length } = req.body;

    const plan = req.plan;
    const free_usage = req.free_usage??0;
    

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await model.generateContent(
      prompt,
      {max_tokens: length}
    );

    const content = await response.response.text();

 
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
 
    return res.json({
      success: true,
      content,
    });

  } catch (error) {
    console.error("generate Article Error",error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};




export const generateBolgTitle = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt } = req.body;

    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await model.generateContent(
      `Generate 5 blog titles for the topic: ${prompt}`,
      {
        max_tokens: 100,
        temperature: 0.7,
      }
    );

    const content = await response.response.text();

 
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'Blog Titles')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
 
    return res.json({
      success: true,
      content,
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};


export const generateImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt ,publish } = req.body;

    const plan = req.plan;
    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subsciptions.",
      });
    }

    const form = new FormData()
    form.append('prompt', prompt)

    const {data}= await axios.post("https://clipdrop-api.co/text-to-image/v1",form,{
      headers:{'x-api-key': process.env.CLIPDROP_API_KEY},
      responseType:"arraybuffer",
    })

    const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;

    const {secure_url} = await cloudinary.uploader.upload(base64Image)

 
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image',${publish ?? false})
    `;
 
    return res.json({
      success: true,
      content: secure_url,
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};




export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.userId;
    const image = req.file;

    const plan = req.plan;
    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subsciptions.",
      });
    }

    const {secure_url} = await cloudinary.uploader.upload(image.path,{
      background_removal: 'cloudinary_ai'
    })

    
 
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;
 
    return res.json({
      success: true,
      content: secure_url,
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const userId = req.userId;
    const {object} = req.body
    const image = req.file;

    const plan = req.plan;
    

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subsciptions.",
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path)

    const imageUrl = cloudinary.url(public_id,{
      transformation: [{effect:`gen_remove:prompt_${object}`}],
      resource_type: 'image',
      sign_url: true,
      type: 'upload'
    })
 
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;
 
    return res.json({
      success: true,
      content: imageUrl,
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};



// export const resumeReview = async (req, res) => {
//   try {
//     const userId = req.userId;
    
//     const resume = req.file[0];

//     const plan = req.plan;
    

//     if (plan !== "premium") {
//       return res.json({
//         success: false,
//         message: "This feature is only available for premium subsciptions.",
//       });
//     }

//     if(resume.size > 5 * 1024 * 1024){
//       return res.json({success: false, 
//         message:'resume file size exceeds allowed size(5MB).'})

//     }

//     const dataBuffer = fs.readFileSync(resume.path)
//     const pdfData = await pdf(dataBuffer)
//     const prompt = `Review the following resume and provide constructive feedback on:
//       - Overall score(out of 10)
//       - Strengths
//       - Weaknesses
//       - Areas for improvement
//       - ATS optimization suggestions
//       - Suggestions to improve clarity, impact, and professionalism
//       Resume Content:
//       ${pdfData.text}`

//     const response = await model.generateContent(
//       prompt,
//       {
//         max_tokens: 1000,   
//         temperature: 0.6,   
//       }
//     );

//     const content = await response.response.text();
 
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, 'Review the Uploaded resume', ${content},'resume')`;
 
//     return res.json({
//       success: true,
//       content,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };



/**
 * Resume Review Controller
 */
export const resumeReview = async (req, res) => {
  try {
    console.log("🚀 resumeReview endpoint HIT");

    const userId = req.userId;
    const plan = req.plan;
    const resume = req.file;

    // Plan check
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    // File check
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded.",
      });
    }

    console.log("📄 Resume received:", resume.originalname);

    // Parse PDF directly from buffer
    console.log("📄 Parsing PDF...");
    const pdfData = await pdf(resume.buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to extract text from the uploaded PDF.",
      });
    }

    // Trim text to avoid token overflow
    const resumeText = pdfData.text.slice(0, 6000);
    console.log("📄 Resume text length:", resumeText.length);

    // Optimized prompt
    const prompt = `
      You are an expert resume reviewer and ATS optimization specialist.

      Analyze the resume below and respond in the following structured format:

      1. Overall Score (out of 10)
      2. Strengths (bullet points)
      3. Weaknesses (bullet points)
      4. Missing or Weak Sections
      5. ATS Optimization Suggestions
      6. Actionable Improvements

      Rules:
      - Be concise and professional
      - Do not repeat resume text
      - Limit response to 400 words

      Resume Content:
      ${resumeText}
      `;

    console.log("🤖 Sending resume to AI...");

    // Gemini-style generateContent
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const content = response.response.text();

    console.log("✅ AI response generated");

    // Save to DB (optional but recommended)
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume')
    `;

    return res.json({
      success: true,
      content,
    });

  } catch (error) {
    console.error("❌ Resume Review Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while reviewing the resume.",
    });
  }
};






