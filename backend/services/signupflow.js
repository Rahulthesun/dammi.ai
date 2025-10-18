import { formatBusinessDataForEmbedding, getBusinessByPhoneNumberId } from "./businessService";
import { chatHistory } from "./chatHistory";
import { crawlWebsite } from "./crawler";
import embedAndStore from "./embedAndStore";
import {groq} from "./llmService"

const tool_functions = [
    {
        name : "confirmBusiness",
        description : "The User Confirms that one of the businesses from the list of businesses you showed him is his business",
        parameters : {
            type: "object",
            properties : {
                place_id : {
                    type: "string"
                }
            },
            required: ["place_id"]
            
        }   
    }

];

export async function generateSignupResponse(context) {
    const SystemPrompt = `You are Dammi.ai — a B2B conversational WhatsApp agent that helps other businesses create and manage their own WhatsApp-based agents.You speak casually, like a real person chatting on WhatsApp — short, friendly, and direct.
You’re currently guiding an admin through their business setup flow`

    const llm_message_context = [
        {
            role:"system",
            content: `${SystemPrompt} \n \n Relevant Business Data ${context}` , //thinking of having this as multiple step function 
        },
        ...chatHistory
    ]

    const completion = await groq.chat.completions.create({
        messages:llm_message_context,
        model: "llama-3.1-8b-instant",
        temperature:0.1,
        max_completion_tokens : 300,
        tools: tool_functions

    });
    const messages = completion.choices[0].message; // Contains all the data from the ai completion
 

    // Refine this for multiple tool Call Functions
    if (messages.tool_calls[0].function.name === "confirmBusiness") { 
        const args = JSON.parse(messages.tool_calls.arguments);
        await confirmBusiness(args.place_id); // Add Phone NUmber id in context also
        //sendmessage()
        return "";
    } else {
        return messages?.content || "Some Error Occured & I couldn't generate an answer at the moment.";
    }

    

}


async function confirmBusiness(placeId , phoneNumberId) {
    await fetchBusinessMapDetails();

}

//Fetches & Embeds Google Business Data of Confirmed Business
async function fetchBusinessMapDetails(phoneNumberId , placeId) {
  let query = `${businessName}, ${businessLocation}, ${businessPhone}`;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,opening_hours,formatted_phone_number,website&key=${process.env.GOOGLE_PLACES_KEY}`;
  const response = await fetch(url);
  const businessData = await response.json();
  
  const {businessId} = await getBusinessByPhoneNumberId(phoneNumberId);//DK if this will work

  if (businessData.results.website) {
    await crawlWebsite(businessData.results.website , businessId)
  }



  console.log("This is business data below:")
  console.log(businessData.results);
  const formattedBusinessData = formatBusinessDataForEmbedding(businessData.results);
  console.log(formattedBusinessData);

  //saveBusinessData(businessData);//not implemented yet
  //write new Error Handling // if (response.status !== "OK") throw new Error(response.status + "" + (response.error_message || ""))
  await embedAndStore(formattedBusinessData);
  return "Thank you for Completing Your Business Profile. We Fetched Data About Your business. Your Dammi.ai Chatbot is now Live & Available For Your Users";
}   