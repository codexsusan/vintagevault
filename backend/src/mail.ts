import { Resend } from "resend";
import { FROM_ADDRESS, RESEND_SECRET } from "./constants";
import { loadEmailTemplate } from "./utils/emailTemplateLoader";
import { TemplateData } from "./types";

const resend = new Resend(RESEND_SECRET!);

export const sendMail = async (
  to: string,
  subject: string,
  templateName: string,
  templateData: TemplateData
) => {
  const html = await loadEmailTemplate(templateName, templateData);
  // Used resend to send email
  return await resend.emails.send({
    from: `Vintage Vault <${FROM_ADDRESS!}>`,
    to,
    subject,
    html: html,
  });
};
