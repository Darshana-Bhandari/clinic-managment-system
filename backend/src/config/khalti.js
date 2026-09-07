


// Khalti API configuration
const KHALTI_API_URL = ENV.KHALTI_ENV === "production"
  ? "https://khalti.com/api/v2" : "https://dev.khalti.com/api/v2";

  const KHALTI_PAYMENT_URL = ENV.KHALTI_ENVIRONMENT === "production"
  ? "https://khalti.com/api/v2/payment/" : "https://dev.khalti.com/api/v2/epayment/";



  // KHalti api headers
    const KHALTI_API_HEADERS = {
        "Authorization": `Key ${ENV.KHALTI_API_KEY}`,
        "Content-Type": "application/json"
    };

    // khalit api functions
    export const initiateKhaltiPayment = async (paymentData) =>{
        const {amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info} = paymentData;



        const response = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
            method:"POST",
            headers: getHeaders(),
            body: JSON.stringify({
                amount,
                purchase_order_id,
                purchase_order_name,
                return_url,
                website_url,
                customer_info:{
                    name:customer_info?.name,
                    email:customer_info?.email,
                    phone:customer_info?.phone
                },
                amount_breakdown:[   // Optional: You can provide a breakdown of the amount if needed
                    {
                        label:purchase_order_name,
                        amount:amount
                    }
                ]
            
            })
      });

      if(!response.ok){
        const errordata= await response.json();
        throw new Error(errordata?.message || "Failed to initiate Khalti payment");
      }
      return await response.json();
    }


    // verify khalti payment 
    export const verifyKhaltiPayment = async (token, amount) =>{
        const response = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
            method:"POST",
            headers: getHeaders(),
            body: JSON.stringify({
               pidx
            })
        });

        if(!response.ok){
            const errordata= await response.json();
            throw new Error(errordata?.message || "Failed to verify Khalti payment");
        }
        return await response.json();
    }


    export default {
        initiateKhaltiPayment,
        verifyKhaltiPayment,
        KHALTI_PAYMENT_URL,
        KHALTI_API_URL
    
    }

   