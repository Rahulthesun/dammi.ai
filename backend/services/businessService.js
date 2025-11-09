import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);



export async function getBusinessByPhoneNumberId(phoneNumberId) {
  const { data, error } = await supabase
    .from('whatsapp_accounts')
    .select('*')
    .eq('phoneNumberId', phoneNumberId)
    .single();
  if (error) {
        console.error("❌ BusinessByPhoneNumberId Error :", error);
  }
  return data;
}

export async function getBusinessById(id) {
  const { data, error } = await supabase
    .from('whatsapp_accounts')
    .select('*')
    .eq('businessId', id)
    .single();
  if (error) {
        console.error("❌ BusinessById Error :", error);
  }
  return data;
}


export function formatbusinessData(BusinessData) {
  const name = BusinessData.name || "Business Name Unknown";
  const rating = BusinessData.rating ? `${BusinessData.rating}★` : "No rating";
  const reviews = BusinessData.user_ratings_total || 0;
  const address = BusinessData.address || "Address Not Available";
  const place_id = BusinessData.place_id || "No Place Id";
  return `${name} 
  Address: ${address} 
  Rating: ${rating} (${reviews} review${reviews === 1 ? '' : 's'}) 
  Place ID: ${place_id}`;

}

export function formatBusinessDataForEmbedding(BusinessData) {
  return Object.entries(BusinessData)
    .map(([key, value]) => {
      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) value = value.join(", ");
      // Replace null/undefined with placeholder
      if (value == null) value = "N/A";
      // Format key to readable text
      const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      return `${formattedKey}: ${value}`;
    })
    .join("\n");
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

