//Sends OTP & Returns it
import axios from 'axios';
import express from 'express';
import {encrypt , decrypt} from '../services/encrypt.js'
import { supabase } from '../lib/supabaseClient.js';

const router = express.Router();
const encryptionKey = process.env.ENCRYPTION_KEY;

router.post('/' , async (req, res) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit OTP
    const enc_data = encrypt(otp);
    

    // In a real application, you would send the OTP via SMS or email here
    async function sendOtp(to , otp) { 
        try {
            const response = await axios.post(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, 
                {
                    messaging_product: 'whatsapp',
                    to: to , 
                    type:'text',
                    text : { body: `Your Dammi.ai Signup OTP is ${otp}` }

                },

                {
                    headers: {
                        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',

                    },
                }

            );
            console.log('OTP sent successfully:', response.data);
        }
        catch (error) {
            console.error('Error sending OTP:', error.response ? error.response.data : error.message);
        }
    };

    try {
        sendOtp(req.body.phone , otp); // Send OTP to the provided phone number
        console.log(enc_data)
        console.log(otp)
        res.status(200).json({ enc_data : enc_data });
    } catch (error) {
        res.status(500).json({ error: `Failed to send OTP Due to Sendotp() Error ${error}` });
    }    
});


router.post("/verification" , async (req,res) => {
    console.log(req.body.encryptedData)
    const decrypted_otp = decrypt(req.body.encryptedData); // using crypto decrypt function from encrypt.js
    if(req.body.otp === decrypted_otp ) {
        console.log("OTP Verified");
        try {
            const {data , error} = await supabase 
            .from('dammi_auth')
            .insert([
                {
                    email: req.body.email,
                    phone: req.body.phone,
                }
            ])
            .select();

              // handle error, send 500 response
            if (!data || data[0].length === 0) {
              console.log("No rows inserted");
       
            } else {

            //User is successfully created and sent

              const user = data[0];
              console.log("User created:", user);
              console.log(`User ID :  ${user.id}`);
              res.status(200).json({id :user.id});
  
            }

            
        }
        catch(error) {
            console.log(error)
            res.status(500).json({ error: `Cldn't Create User: ${error}` });
        };    
    }else{
        console.log("Invalid OTP")
        res.status(500).json({error: `OTP Invalid or Mismatch` })
    }
});

export default router;