import { formatBusinessDataForEmbedding, getBusinessByPhoneNumberId } from "./businessService.js";
import { chatHistory } from "./chatHistory.js";
import { crawlWebsite } from "./crawler.js";
import embedAndStore from "./embedAndStore.js";
import {groq} from "./llmService.js"
import {supabase} from "../lib/supabaseClient.js" 

const tool_functions = [
  {
    type: "function",
    function: {
      name: "confirmBusiness",
      description: "Confirm the selected business",
      parameters: {
        type: "object",
        properties: {
          place_id: {
            type: "string",
            description: "Google Place ID of the confirmed business"
          },
        },
        required: ["place_id"],
      },
    },
  },
];


export async function generateSignupResponse(context , step , userPhone , phoneNumberId) {
    const SystemPrompt = `You are Dammi.ai — a B2B conversational WhatsApp agent that helps other businesses create and manage their own WhatsApp-based AI agents.

Your personality:
- You sound like a real person chatting on WhatsApp — short, friendly, and direct.
- Never mention that you are an AI.
- Keep responses under 2 sentences unless necessary.
- Be casual but professional.

Current context:
- The customer is already signed up.
- We have already searched for their business using the Google Places API.
- Your current task is to confirm which business belongs to the user.
- The user will usually say something like "Yes, that's mine" or "No, not that one."

Flow overview (for your internal awareness — don’t mention this to the user):
1. **Step 1 (current)**: Confirm the business the user owns, based on the list provided.
2. **Step 2 (automatic)**: After confirmation, Dammi will internally fetch additional data from:
   - The user's Google Business Profile (opening hours, phone, etc.)
   - The business website (for service, contact, and brand info)
   These are automatic steps — no need for the user to approve or confirm them.
3. **Step 3**: Once setup completes, the user's WhatsApp account will be ready to reply to their clients using business-aware context.

Your current role:
- Ask the user to confirm which business listing is theirs.
- When the user confirms, call the 'confirmBusiness' function with the correct 'place_id'.
- Do **not** explain what happens next.
- Do **not** return text when a function call is needed.
- Be conversational, like: “Got it, that’s your place?” or “Cool, I’ll lock that in.”

Output behavior:
- If unsure, ask a short clarification.
- If the user clearly confirms their business, trigger the 'confirmBusiness' tool call.
- Otherwise, reply naturally and help move toward confirmation.`

    const llm_message_context = [
        {
            role:"system",
            content: `${SystemPrompt} \n \n Relevant Business Data ${context}` , //thinking of having this as multiple step function 
        },
        ...(chatHistory[userPhone] || []),
    ]

    const completion = await groq.chat.completions.create({
        messages:llm_message_context,
        model: "llama-3.1-8b-instant",
        temperature:0.1,
        max_completion_tokens : 300,
        tools: tool_functions

    });
    console.log(completion)
    
    const messages = completion.choices[0].message; // Contains all the data from the ai completion
    console.log(messages)

    if (messages.content) {
        return messages?.content || "Some Error Occured & I couldn't generate an answer at the moment.";
    } else {
        for (const toolCall of messages.tool_calls) {
            const { name, arguments: rawArgs } = toolCall.function;
            const func_args = JSON.parse(rawArgs || "{}");
            switch (name) {
                case "confirmBusiness":
                console.log("🧾 Calling confirmBusiness with args:", func_args);
                const responseText = await confirmBusiness(func_args.place_id, phoneNumberId);
                return responseText;
            }
        } 
    }
}

//Move Storing to Confirm Business 
async function confirmBusiness(placeId , phoneNumberId) {
    const responseText = await fetchBusinessMapDetails(placeId , phoneNumberId);
    return responseText;// Just passing all responseText to THe main /Whatsapp.js main hook to deter complexity and keep all message sending to one place
}

//There's a lot of redundancy in this code . Fix it after launch
//Fetches & Embeds Google Business Data of Confirmed Business . Also Returns Response Text
async function fetchBusinessMapDetails(placeId ,phoneNumberId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,opening_hours,formatted_phone_number,website&key=${process.env.GOOGLE_PLACES_KEY}`;
  const response = await fetch(url);
  const businessData = await response.json();
  console.log(phoneNumberId)
  const business = await getBusinessByPhoneNumberId(phoneNumberId);//DK if this will work
  console.log(businessData);
  const businessId = business.businessId;
  if (businessData.result.website) {
    try {
        console.log(businessData.result.website)
        await crawlWebsite(businessData.result.website , business.businessId)
        console.log("Successfull Crawl")
        const {data, error} = await supabase
            .from('whatsapp_accounts')
            .update({
                website_data: true
            })
            .eq('businessId' , businessId);
            
        if (error) {
            console.error("❌ Supabase error:", error);
            return "Something went wrong.";
        }
        } catch(error) {
            console.log("Couldnt Store Website Embedded Data" , error)
           return "There's been some errors with Your Website , try Again Soon or Contact Support";
        }   
   
  }



  console.log("This is business data below:")
  const formattedBusinessData = formatBusinessDataForEmbedding(businessData.results);
  console.log(formattedBusinessData);

  //saveBusinessData(businessData);//not implemented yet
  //write new Error Handling // if (response.status !== "OK") throw new Error(response.status + "" + (response.error_message || ""))
  try {
    await embedAndStore(formattedBusinessData);
    await supabase
            .from('whatsapp_accounts')
            .update({
                google_maps_data: true
            })
            .eq('businessId' , businessId);
    console.log("Google Business Profile Embedded Successfully")

  } catch (error) {
    console.log("Error , Couldnt Store Google maps Data : " , error)
    return "There's been some errors with Your Google Business Profile, try Again Soon or Contact Support";
  }
    

    
  return "Thank you for Completing Your Business Profile. We Fetched Data About Your business. Your Dammi.ai Chatbot is now Live & Available For Your Users";
}   


