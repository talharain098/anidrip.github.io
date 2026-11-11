/* ===== ANIDRIP — CENTRAL CONFIG (edit only this file for brand/contact/social/backend) ===== */
window.ANIDRIP = {
  brand: "AniDrip",
  tagline: "Electric Style. Main Character Energy.",
  currency: "PKR",
  /* WhatsApp number: country code + number, digits only (92 = Pakistan, no leading 0). */
  whatsapp: "923093903779",
  /* Optional email/address shown in the footer when filled in (phone number is NOT shown — only the WhatsApp link) */
  contact: { email: "anidrip.pk@gmail.com", address: "" },
  /* New social profile links go here. Empty = not shown anywhere on the site. */
  social: { instagram: "https://www.instagram.com/anidrip.pk?xtok=MXdxcjcya3YzN3B4YQ==", tiktok: "https://www.tiktok.com/@anidrip.pk", facebook: "https://www.facebook.com/share/19vKgZeXVY/", youtube: "" },
  /* Prices in PKR. Custom-design orders add "custom" on top of the garment price. */
  pricing: { tee: 1699, sweat: 1899, hoodie: 2399, custom: 200 },
  /* Delivery fee = petrol cost for the distance + addOn, never more than max. EDIT origin to the exact store address; update petrolPerLitre when fuel prices change. */
  delivery: { origin: "Taj Masjid Road, Agra Taj Colony, Lyari, Karachi, Pakistan", petrolPerLitre: 270, kmPerLitre: 40, roundTrip: false, addOn: 100, min: 300, max: 550, country: "pk" },
  /* Supabase (products + admin login). TODO: create a NEW project for AniDrip (see SETUP.md) and paste here. */
  supabase: { url: "https://hqaslueuoftoqkzrkbzd.supabase.co", anonKey: "sb_publishable_rK7XetNgmyl8qvLZ5aYE3w_0LxRz8Jb" }
};
