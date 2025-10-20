# Data Model (Phase 1)

## Entities
Collections (high-level buckets)
    * product_configuration - every saved configuration/estamate
    * price_catalog - entral place for unit price & options
    * quote_requests - one per customer inquiry
    * gallery_items - images and blurbs for marketing pages
    * testimonials - short quotes from customers
    * admin_assets - logos, banners, misc media for site shell.
    * users - admin users for the portal

### product_configurations
- id (UUID)
- productType: "garden-room" | "house-extension" | "house-build"
- size: { widthM: number, depthM: number }
- cladding: {areaSqm: number}
- bathroom: {half: number, three_quarter: number} // Half = Toliet + Sink, three_quarter = Toliet + Sink + Showe
- electrical: {switches: number, sockets: number, heater?: number, underskink_heater?: number, elec_boiler?: number} // underskink_heater included with half bathroom, elec_boiler = included with three_quarter bathroom
- internal_doors: number
- internal_wall: { finish: "none" | "panel" | "skim_paint", areaSqM?: number }
- heaters: number
- glazing: { 
    windows: Array<{widthM:number, heightM:number}>, 
    externalDoors: Array<{widthM:number, heightM:number"}>, 
    skylights: Array<{widthM:number, heightM:number}> 
}
- floor: { type: "none" | "wooden" | "tile", areaSqM: number }
- delivery: { distanceKm?: number, cost: number }
- extras: {esp_insulation?: number, render?: number, steel_door?: number, other: Array<{title: string, cost: number}>}
- estimate: { currency: string, subtotalExVat: number, vatRate: number, totalIncVat: number }
- notes: string
- permittedDevelopmentFlags: Array<{ code:string, label:string }>
- createdAt, updatedAt

### price_catalog
- id: UUID
- label: string,
- currency": string
- current": boolean // only one document at a time marked true
- validFrom": date // edit date?=0 | create date
- validTo: null // null = open ended
- base: {"baseRatePerM2": number, "fixedCharge": number, "defaultHeightM": 2.4}
- cladding: {"ratePerM2": number}
- bathroom: {"half": number, "threeQuarter": number}
- glazing: {
    "window": { "charge": number, "ratePerM2": number },
    "externalDoor": { "charge": number, "ratePerM2": number },
    "skylight": { "charge": number, "ratePerM2": number }
  }
- electrical: {
    "switch": number,
    "doubleSocket": number,
    "heater": number,
  }
- internal" {
    "internalDoorCharge": number,
    "internalWall": {
      "none": number,
      "panel": number,
      "skim_paint": number
    }
  }
- flooring": {
    "none": number,
    "wooden": number,
    "tile": number
  }
- delivery: {
    "freeKm": number,
    "ratePerKm": number
  }
- extras": {
    "ESPInstallRatePerM2": number,
    "renderRatePerM2": number,
    "steelDoorCharge": number
  }
- taxes: {"vatPct": number}
- discounts: {"discountAmt": number}
- createdAt, updatedAt

### quote_requests
- id (UUID)
- configId (UUID) (points to product_configurations.id)
- customer: { firstName, lastName, email, phone: {contry_prefix: string, phone_num: number}, addressLine1, addressLine2?, town?, county?, eircode }
- esiredInstallTimeframe: string
- quote_number: string (unique, human-friendly; store once generated, e.g. Q2-2025-00123, second quarter of 2025 incremental number 00123)
- payment: {
  status: 
    | "pre-quote"        // no quote issued yet
    | "quoted"           // quote issued, waiting for deposit or decision
    | "deposit-paid"     // deposit received
    | "installments"     // payment plan in progress
    | "paid"             // fully paid
    | "overdue"          // missed expected payment timeline
    | "refunded",        // fully or partially refunded

  totalPaid: number,     // running total (€), avoid recalculating from history
  expectedInstallments?: number | null,  // null if no plan is agreed
  lastPaymentAt?: string | null,         // ISO timestamp
  createdAt: string,     // when this payment record object was initialized (usually same as quote submitted)
  updatedAt: string,     // update on every payment history push

  history: Array<{
    id: string,                        // UUID for each transaction
    type: 
      | "DEPOSIT"
      | "INSTALLMENT"
      | "FINAL"
      | "REFUND"
      | "ADJUSTMENT",                // optional for admin manual correction
    amount: number,                  // amount for this record
    timestamp: string,               // ISO (when received/recorded)
    note?: string,                   // optional free-text
    installmentNo?: number | null,   // only if this corresponds to a payment plan step
    recordedBy?: string | null       // userId (admin) who logged it
  }>
}
- payment_status: {{"pre-quote" | "quoted" | "deposit-paid"| installment_no: Array<number> | last-payment}, updatedAt}
- retention: { expiresAt: ISODate }
- submittedAt
Note: Keep PII (customer details) only here; keep configurations free of PII so they’re easy to reuse as templates.

### gallery_items
- id (UUID)
- quote_number: string (same quote number as in quote_request)
- featured: boolean
- title
- description
- category: "garden-rooms" | "house-extensions" | "house-builds"
- images: Array<{ url: string, alt: string }>
- locationRegion?: string
- tags: string[]
- createdAt, updatedAt

### Testimonial
- id (UUID)
- published: boolean
- quote
- author
- context?: { projectType?: string, location?: string }
- createdAt: ISODate

### AdminAsset
- id (UUID)
- kind: "logo" | "banner" | "gallery" | "other"
- url
- alt
- metadata?: Record<string, string>
- published: boolean
- createdAt, updatedAt

### users
- id: code
- email: email
- passwordHash: <hashed>
- role: admin
- status: active
- display_name: strign
- permissions: {
    - canEditPricing: boolean
    - canArchiveQuotes: boolean
    - canDelete: boolean
}
- lastLoginAt createdAt updatedAt

## Relationships
- quote_requests.configId → product_configurations.id
- gallery_items.quote_number → quoted_requests.quote_number
- Everything else stands alone.
- when cloning configuration for another customer, create a new product_configurations doc must be created, no shared edit across customers
- AdminAsset used by frontend for display; changes published via admin flow

## Validation Rules
- Eircode: non-empty; 7 characters, split 3 + 4 (e.g., A65 F4E2); the first part is a routing key; D6W is a special case; all letters will be auto capped, space optional.
- Phone: international format allowed; min 7 digits
- Email: standard email validator (don’t reinvent)
- Size: width/depth within permitted ranges; flags set if over permissive thresholds
- Retention: expiresAt = submittedAt + 60 days (configurable)

## State Transitions
- QuoteRequest: new → contacted → quoted → in-progress → completed → archived
- Auto-delete: if now > expiresAt and not in-progress/completed, record eligible for deletion
