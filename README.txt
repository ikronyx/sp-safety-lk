SP SAFETY — WEBSITE & PRODUCT CATALOG

Plain HTML, CSS and JavaScript with the existing Bootstrap theme. No build step,
Node installation, database, payment gateway or server application required.
Upload all contents of this folder to your web hosting public folder.
Open index.html for the home page; products.html for the catalog.

PAGES
index.html: existing home/about/contact content and promoted essentials.
products.html: live search, category, min/max price, saved/featured filters,
price/name/category sorting, result counts, page sizes and pagination.
product.html?id=PRODUCT-ID: shared detail page driven by the product ID.
cart.html: quantities, removal, subtotal and WhatsApp enquiry.

PRODUCT EDITING
Edit data/products.js in a text editor. Each object is a product:
id: unique permanent URL identifier; do not change IDs casually.
name: display name in consistent title case.
category: display category; filter options are built automatically.
price: numeric LKR amount, without commas or currency symbols.
image: relative path including category folder and exact filename/extension.
featured: true to promote a product, false otherwise. Home shows first four.
description: product text; replace with verified specifications when available.
Add an object (separated with a comma) to add a product; remove it to delete.
Keep window.SP_PRODUCTS = [ ... ]; intact. Refresh after saving.
No invented discounts, stock quantities or safety certifications are included.

IMPORTANT: PRODUCT PHOTOS
The supplied archive contained an EMPTY images/products folder. The 101 entries
were imported from the supplied file list. Their exact expected paths are in
data/products.js, under images/products/CATEGORY/ORIGINAL-FILENAME.
Copy your category folders into images/products, keeping exact filenames,
spaces, punctuation and upper/lowercase extensions. A photo placeholder appears
until each image is supplied. Miscelleneous is corrected only in the displayed
category name; its image folder keeps the original spelling.
product-image-manifest.txt preserves your original file list.

CART & ENQUIRIES
Cart and saved products use localStorage in the visitor's browser. No accounts,
server stock, online payments or automatic order submission are implemented.
WhatsApp opens a prefilled enquiry to 94772360385; the customer must press Send.
Prices are estimates; delivery and final terms are confirmed by SP Safety.
To change the WhatsApp number, edit enquiry() in js/shop.js.
Browser storage is most reliable on a hosted domain or local web server.
The original Bootstrap/icons and GSAP CDN links require internet access;
core shop layout, mobile navigation and catalog logic have local fallbacks.

CHANGED / ADDED
index.html, products.html, product.html, cart.html,
css/shop.css, js/shop.js, data/products.js,
images/product-placeholder.svg, product-image-manifest.txt, README.txt.
Existing css/style.css and original images are retained.

VALIDATION
JavaScript syntax and product data integrity checked; 101 unique IDs,
12 categories, numeric prices, and source-to-image mappings verified.
Full interactive browser validation was blocked by this workspace's Chromium
process restrictions; check desktop/mobile layout and WhatsApp on your hosting.

DESIGN REFINEMENTS — NOVEMBER 2026
The catalog, product detail and cart pages now share refined card layouts,
local SVG icons, interactive saved states, guide-price labels and consistent
spacing. Navigation has a cart icon, live badge and accessible item count.
Catalog filters have removable active chips and a mobile filter toggle.
Product details include image enlargement, quantity steppers, information
accordions and an ordering explanation. The cart includes an enquiry process
indicator, item cards, editable stepper controls, a detailed summary, helpful
contact links, illustrated empty state and undo for removal/clear actions.
GST Interior Masters has a dedicated promotional section immediately after
Brands we provide. Its abstract interior illustration is inline SVG, with no
external image dependencies. The section links to the supplied website in a
new tab. No business relationship or unverified service claims are stated.
To edit the promotion, locate interior-spotlight in index.html; its styles are
at the end of css/shop.css. Existing product data and image paths are unchanged.
Legacy gallery/animation scripts are no longer loaded by the storefront pages.

REFINEMENT VALIDATION
JavaScript syntax checked. An isolated DOM test harness exercised keyword
search, price range, price sorting, pagination size, no-results state, cart
addition/removal, quantity changes, subtotals and WhatsApp enquiry generation.
HTML checks verified unique IDs, local asset references, script loading and
promotion placement. Full browser rendering remains unverified because of
workspace browser process restrictions. Check responsive appearance on hosting.

READABILITY & WIDTH UPDATE — NOVEMBER 2026
Products and cart pages now use a wider 1760px maximum layout, with 32px side
gutters on desktop and 16px on phones. Catalog cards use four columns on wide
screens. Product names, descriptions, filter labels, prices, cart line items,
ordering notes and enquiry summaries have larger type and more comfortable
line spacing. The individual product page also benefits from the readability
adjustments. Modified: products.html, cart.html, product.html, css/shop.css.
