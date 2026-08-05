// Statutory registrations, shown site-wide as a trust signal.
//
// ONLY THE NUMBERS ARE PUBLISHED — never the certificate scans. The FSSAI
// certificate carries the owner's photograph, an Aadhaar reference and the
// full home street address (Venipura Mominvad); the Udyam PDF carries a
// personal mobile that is not the bakery's public number. None of that
// belongs on a public page, and none of it is what anyone actually checks:
// customers and food-safety officers verify the NUMBER on the government
// portal. Don't add a certificate image/PDF here without re-reading this.
//
// Displaying the FSSAI number is a requirement for food businesses under the
// FSS Act, so this is load-bearing, not decoration.

// How each registration is WRITTEN wherever it appears — footer, checkout,
// About, invoice. One spelling site-wide: a customer who sees "Udyam …" in the
// footer and "MSME …" on the bill has no way to know they are the same thing.
//
//   prefix  — how the number is introduced. Rendered in normal weight.
//   number  — the registration itself. Rendered bold.
//   display — `prefix number`, for plain-text places (the invoice) that can't
//             style the two halves separately.
//
// Keeping the prefix separate is what makes the two lines look alike: bolding
// `display` bolded "MSME :" too, so MSME sat dark and heavy next to a lighter
// "FSSAI Reg. No.".
export const FSSAI = {
  number: '20726012000837',
  prefix: 'FSSAI Reg. No.',
  display: 'FSSAI Reg. No. 20726012000837',
  label: 'FSSAI Registered',
  blurb: 'Our kitchen is registered with the Food Safety and Standards Authority of India.',
  // Fee paid upto 16-07-2027 (registered 17-07-2026). The registration lapses
  // if the fee is not renewed by then — update `number` only if it changes,
  // but this date is the reminder that the claim above has a shelf life.
  feePaidUpto: '2027-07-16',
  verifyUrl: 'https://foscos.fssai.gov.in/',
  verifyLabel: 'FoSCoS portal',
}

const UDYAM_NUMBER = 'UDYAM-GJ-12-0059372'

export const UDYAM = {
  number: UDYAM_NUMBER,
  // "MSME" leads, because that is the name customers recognise — "Udyam" is
  // just what the portal calls its registry.
  prefix: 'MSME :',
  display: `MSME : ${UDYAM_NUMBER}`,
  label: 'MSME · Udyam Registered',
  blurb: 'Registered as a Micro enterprise with the Ministry of MSME, Government of India.',
  // Deep-links straight to the portal's "Verify Udyam Registration" form.
  // FSSAI's FoSCoS is a JS app with no equivalent stable deep link, so that
  // one points at the portal root.
  verifyUrl: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
  verifyLabel: 'Udyam portal',
}
