import { resendClient, sender } from '../lib/resend.js';
import { createWelcomeEmailTemplate } from './emailTemplate.js';

const sendWelcomeEmail = async (name, email, clientURL) => {
    const { data, error } = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "welcome to chatify",
        html: createWelcomeEmailTemplate(name, clientURL),
    })

    if(error){
        console.error("error occured sending mail: "+error);
        throw new Error("Failed to send welcome mail");
    }

    console.log("welcome mail sent seccessfully "+data);
}

export default sendWelcomeEmail;