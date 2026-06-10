import { BrevoClient } from "@getbrevo/brevo";
import emailConfig from "./config.json";

type EmailCategoryConfig = {
  subject: string;
  htmlContent: string;
};
type EmailConfig = {
  [category: string]: EmailCategoryConfig;
};
const typedEmailConfig = emailConfig as EmailConfig;

type EmailTemplateParams = Record<string, string | number | boolean | null | undefined>;

function stringifyTemplateParams(params: EmailTemplateParams) {
  return Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
    accumulator[key] = value === null || value === undefined ? "" : String(value);
    return accumulator;
  }, {});
}

function interpolateTemplate(template: string, params: Record<string, string>) {
  return template.replace(/\{\{\s*(?:params\.)?([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    return params[key] ?? "";
  });
}

const getConfigByCategory = (category: string) => {
  const config = typedEmailConfig[category];
  if (!config) {
    throw new Error(`Email config not found for category: ${category}`);
  }
  return config;
};

export async function sendBrevoEmail({
  to,
  category,
  params = {},
}: {
  to: { email: string; name?: string }[];
  category: string;
  params?: EmailTemplateParams;
}) {
  try {
    const config = getConfigByCategory(category);

    const senderName = process.env.BREVO_SENDER_NAME ?? process.env.BREVO_SENDER;
    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? process.env.BREVO_FROM_EMAIL_ID;

    if (!senderName || !senderEmail) {
      throw new Error("Sender name or email not configured in environment variables.");
    }

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured in environment variables.");
    }

    const brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });

    const finalParams = stringifyTemplateParams({
      ...params,
      senderName,
      senderEmail,
    });
    const subject = interpolateTemplate(config.subject, finalParams);
    const htmlContent = interpolateTemplate(config.htmlContent, finalParams);

    return await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to,
      params: finalParams,
    });
  } catch (error: unknown) {
    const typedError = error as {
      response?: { body?: { message?: string } };
      message?: string;
    };
    const errorMessage =
      typedError?.response?.body?.message ||
      typedError?.message ||
      "Unknown error occurred while sending email.";
    console.error("Brevo Email Send Error:", errorMessage);
    throw new Error(errorMessage);
  }
}
