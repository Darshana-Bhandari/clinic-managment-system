import {EsewaClient} from "esewa-pay"
import { ENV } from "./env"







//initiate the esewa client
export const esewa = new EsewaClient({
    secretKey:ENV.ESEWA_SECRET_KEY,
    productCode:ENV.ESEWA_PRODUCT_CODE,
    successUrl:ENV.ESEWA_SUCCESS_URL,
    failureUrl:ENV.ESWA_FAILURE_URL,
    env:ENV.ESEWA_ENVIRONMENT
})

