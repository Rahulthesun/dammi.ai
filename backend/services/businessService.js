import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);



export async function getBusinessByPhoneNumberId(phoneNumberId) {
  const { data, error } = await supabase
    .from('whatsapp_accounts')
    .select('*')
    .eq('phoneNumberId', phoneNumberId)
    .single();
  if (error) throw error;
  return data;
}


export async function fetchBusinessData(businessName , businessLocation , businessPhone) {
  let query = `${businessName}, ${businessLocation}, ${businessPhone}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_PLACES_KEY}`;
  const response = await fetch(url);
  const businessData = await response.json();



  console.log("This is business data below:")
  console.log(businessData.results);

  //saveBusinessData(businessData);//not implemented yet
  //write new Error Handling // if (response.status !== "OK") throw new Error(response.status + "" + (response.error_message || ""))
  return businessData.results;
}

export async function saveBusinessData(data) {
  const { error } = await supabase
    .from('whatsapp_accounts')
    .update({
      wbaId: data.wabaId,
      phoneNumberId: data.phoneNumberId,
      phoneNumber: data.phoneNumber,
      accessToken: data.accessToken.encrypted,
      iv: data.accessToken.iv,
      authTag: data.accessToken.authTag,
      createdAt: data.connectedAt
    })
    .eq('businessId' , businessId)
    ;
    if (error) throw error;
  
  console.log('Saved to database:', { ...data, accessToken: '[ENCRYPTED]' });
}


//This function is not complete yet
export async function generateb2bresponse(businessId , businessData) {
  const {data , error} = await supabase 
    .from('whatsapp_accounts')
    .select("*")
    .eq('businessId' , businessId)
    .single();

  if (error) throw error;
  
}



export function decryptToken(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

