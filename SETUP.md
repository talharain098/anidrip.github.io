# AniDrip — setup (Roman Urdu)

Sab brand/contact settings sirf **config.js** mein hain.

## 1. WhatsApp, contact aur social links
`config.js` kholen:
- `whatsapp`: country code ke saath number, sirf digits (misal: `923001234567`). Khali ho to WhatsApp khulta hai magar customer ko chat khud chunni parti hai.
- `contact`: phone / email / address (optional, footer mein nazar aayenge).
- `social`: nayi social links yahan daalein. Khali links site par kahin nahi dikhte.

## 2. Admin portal (products + login)
1. supabase.com par **naya** project banayein (AniDrip ke liye; purane brand ka project use na karein).
2. SQL Editor mein `supabase-setup.sql` ka poora text paste karke Run karein.
3. Authentication -> Users -> Add user: apna email + password (yehi admin login hai). "Allow new users to sign up" band kar dein.
4. Project Settings -> API se Project URL aur anon public key `config.js` ke `supabase` hisse mein paste karein.
5. Poora folder hosting par upload karein.
6. `/admin.html` kholen, login karein, pehli dafa "Import current products" dabayein.

Jab tak Supabase connect nahi hota, site `products.js` se products dikhati hai.

## Custom T-shirt / Sweatshirt / Hoodie designer
- Customer picks garment (T-shirt half/full sleeve, Sweatshirt, Hoodie), **colour** (18 basic swatches + full colour box with hue slider + hex), uploads front/back PNG, then moves / resizes (corner handles, slider, mouse-wheel) / rotates / **crops** (✂ Crop: free or fixed ratio, auto-trim, remove white background).
- A live **match %** shows how well the print and the shirt colour go together (visibility, hue harmony, size, placement) and suggests better colours.
- Garment mockups (front + back, all colours) are in `mockups.js` (rendered fabric layers, embedded so everything also works when index.html is opened straight from a folder).

### Sending the design WITH the picture
A website cannot attach an image to WhatsApp by itself. What it does:
1. **With Supabase connected (recommended):** the mockup image (+ front/back PNGs) is uploaded to your `designs` storage bucket and the *link* goes inside the WhatsApp message, so WhatsApp shows the picture right in the chat. (`supabase-setup.sql` already creates the bucket - run it once.)
2. **Without Supabase:** "Drop Your Order" on phones opens the share sheet with the image + text already attached (customer picks WhatsApp); on desktop the image is copied and WhatsApp opens with the text (Ctrl+V).
