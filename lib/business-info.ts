export const businessInfo = {
  brandName: "Sacred Spices",
  tagline: "Food Carries Energy",
  supportEmail: "lakshmikarande0@gmail.com",
  supportPhone: "9730774102",
  cityState: "Sangli, Maharashtra",
  fssaiStatus: "In Process",
  fssaiNumber: "TODO_AFTER_APPROVAL",
  shippingProcessingDays: "1-3 business days",
  withinStateDelivery: "2-4 days",
  otherStateDelivery: "4-7 days",
  preorderShippingText: "Pre-orders ship when the batch is ready.",
  whatsappNumber: "9730774102",
  officialFoscosUrl: "https://foscos.fssai.gov.in"
} as const;

export const fssaiDisplay = `FSSAI Registration: ${businessInfo.fssaiStatus}`;

function isMissingBusinessValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized.startsWith("todo") || normalized.includes("todo_after");
}

export function publicSupportEmail() {
  return isMissingBusinessValue(businessInfo.supportEmail) ? "Support email coming soon" : businessInfo.supportEmail;
}

export function publicSupportPhone() {
  return isMissingBusinessValue(businessInfo.supportPhone) ? "Support phone coming soon" : businessInfo.supportPhone;
}

export function publicWhatsAppNumber() {
  return isMissingBusinessValue(businessInfo.whatsappNumber) ? "WhatsApp support coming soon" : businessInfo.whatsappNumber;
}

export function publicCityState() {
  return isMissingBusinessValue(businessInfo.cityState) ? "Business location coming soon" : businessInfo.cityState;
}

export function supportDisplay() {
  return `${publicSupportEmail()} | ${publicSupportPhone()}`;
}
