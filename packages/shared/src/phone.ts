const DEFAULT_COUNTRY_CODE = '34' // Spain

// Phone as typed by the photographer -> digits for https://wa.me/<number>.
// "600 123 456" -> "34600123456", "+34 600..." / "0034 600..." -> "34600...".
// Returns null when there aren't enough digits to be a phone number.
export function toWhatsAppNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (!phone.trim().startsWith('+') && digits.length === 9) {
    digits = DEFAULT_COUNTRY_CODE + digits
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null
}
