---
name: fabtex-purchase
description: Business logic and schema interactions for Fabtex Purchase module (GRN/Invoice).
---

# Fabtex Purchase Skill (Reusable Intelligence)

This skill encapsulates the intelligence required to manage the Fabtex Purchase module, specifically Good Receipt Notes (GRN) and Purchase Invoices.

## 1. Domain Overview
The Fabtex Purchase module handles the progression of a Purchase Order (PO) to physical receipt (GRN) and finally to financial recognition (Invoice).

### Key Models
- **PurchaseOrder (PO):** The initiating document.
- **PurchaseOrderItem:** Items within a PO, tracking expected color, brand, and grade.
- **GRN:** Proof of physical delivery. Linked to a PO.
- **GRNItem:** Specific quantities received against a `PurchaseOrderItem`.
- **PurchaseInvoice:** Financial document for billing.
- **PurchaseInvoiceItem:** Quantities and rates invoiced against PO/GRN items.

## 2. Business Logic (RI)

### Partial Fulfillment Logic
A single Purchase Order can have multiple GRNs and Invoices.
- **Remaining Quantity Calculation (GRN):** `PO Quantity - Sum(GRNItem quantities)`.
- **Invoiced Quantity Logic:** Invoices can be created against either a PO or a specific GRN.
- **Remaining Quantity Calculation (Invoice):** `Ordered/Received Quantity - Sum(InvoiceItem quantities)`.
- **Progress Tracking:**
    - `Received %`: `(Total Received / Total Ordered) * 100`.
    - `Invoiced %`: `(Total Invoiced / Total Received) * 100`.

### Even vs Uneven Packing
- **Even Packing:** Weight is calculated automatically (`Pcs * UnitSize`).
- **Uneven Packing:** Weight is manually entered for each unit.

## 3. Implementation Patterns

### Server Actions
Always fetch `companyId` from the database using `prisma.company.findFirst()` if not available in the token, as `TokenPayload` does not contain it by default.

### UI Components
- Use `OrderProgress` component for visual status tracking.
- GRN forms must pre-calculate "Already Received" and "Remaining" fields to prevent over-receipt.

### Design & Print Logic
Professional printable documents (POs, GRNs) must follow these rules:
- **Branding:** Include `LegalName`, `Address`, `Logo`, and `ContactInfo` from the `Company` record.
- **Printing:** Use `print:hidden` utility to hide UI navigation and buttons during printing.
- **Layout:** Use a grid for header details (From/To) and a robust table for items.
- **Signatures:** Add a signature section at the bottom (visible only in print mode or at end of page).
- **Page Breaks:** Use `print:break-inside-avoid` on table rows to prevent awkward slicing between pages.

## 4. Reusable Intelligence (RI) - Error Log & Prevention

### Recurring CRUD Errors
- **Property Access:** Always verify property names against `schema.prisma`. 
    - *Common Mismatch:* `Account` uses `name`, while `Company` uses `tradeName`.
    - *PO Dropdowns:* Ensure `po.account?.name` is used, not `tradeName`.
- **Relationship Inclusion:** If a progress bar or detail view fails, ensure `include` counts are deep enough (e.g., `items: { include: { grnItems: true, invoiceItems: true } }`).
- **Data Casing:** Prisma generated client uses exact model casing (e.g., `gRN` for `GRN`). Lint errors here mean the client needs regeneration or the casing is wrong in code.

### Build & Runtime Errors
- **Stale Cache:** `Unknown field` errors after schema changes are almost always due to `.next` cache. Fix: `cmd /c "rmdir /s /q .next" && npx prisma generate && npm run dev`.
- **TypeScript Errors:** Never ignore `any` types if it hides property mismatches. Explicitly type where possible to catch errors at compile time.

### Implementation Checklist (Prevention)
- [ ] Verify Prisma model casing in server actions.
- [ ] Check `include` objects for nested relations.
- [ ] Validate property names in UI components (Table cells/Forms).
- [ ] Clear cache if schema feels out of sync.
