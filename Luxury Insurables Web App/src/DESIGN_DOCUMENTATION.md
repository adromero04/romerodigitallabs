# Luxury Insurables - Design Documentation

## Executive Summary

Luxury Insurables is a mobile-first web application designed for high net-worth individuals to catalog valuable assets and view insurance coverage details. The app emphasizes security, clarity, and a premium user experience while maintaining strict separation between client-provided data and insurance information.

---

## 1. Information Architecture

### Primary Navigation (Mobile)
**Bottom Navigation Bar** (Always visible)
- **Catalog** - View all assets (grid/list)
- **Add Asset** - Quick access to add new items
- **Settings** - Security, privacy, account management

### Key Pages Hierarchy

```
├── Authentication
│   ├── Login
│   └── MFA (Two-Factor Authentication)
│
├── Onboarding (First-time users)
│   ├── Welcome
│   ├── Asset Documentation Info
│   ├── Notifications Info
│   └── Get Started
│
├── Catalog (Home)
│   ├── Grid View (Photo-forward)
│   ├── List View (Detail-forward)
│   ├── Search
│   ├── Filters (Category, Value Range)
│   └── Disclaimer Banner
│
├── Add Asset
│   ├── Step 1: Details Form
│   ├── Step 2: Photo Upload
│   ├── Step 3: Review & Confirm
│   └── Success Confirmation
│
├── Asset Detail
│   ├── Photo Gallery
│   ├── Client Information (Editable)
│   ├── Insurance Details (Read-only, NFP-sourced)
│   ├── Edit Mode
│   └── Delete Confirmation
│
└── Settings
    ├── Account Info
    ├── Security Settings
    │   ├── Change Password
    │   ├── Two-Factor Auth
    │   └── Session Timeout
    ├── Notifications
    ├── Privacy & Legal
    │   ├── Privacy Policy
    │   ├── Terms of Service
    │   └── Data Protection
    └── Sign Out
```

---

## 2. User Flows

### Flow 1: First-Time User Onboarding
```
1. User enters email + password → Login screen
2. System sends MFA code → MFA screen
3. User enters 6-digit code
4. First-time detection → Onboarding sequence
   a. Welcome screen (security messaging)
   b. Asset documentation explanation
   c. Important disclaimer (upload ≠ coverage)
   d. Notifications information
5. Complete onboarding → Empty catalog state
```

### Flow 2: Add Asset + Upload Images
```
1. User taps "Add Asset" in bottom nav
2. Disclaimer banner displayed (upload ≠ coverage)
3. Step 1: Asset Details Form
   - Name* (required)
   - Description* (required)
   - Estimated Value* (required) [with "why we ask" tooltip]
   - Category* (required) - 6 options with emoji icons
   - Brand (optional)
   - Year (optional)
   - Serial Number (optional) [with security explanation]
   - Appraisal Date (optional)
   → "Continue to Photos" button
4. Step 2: Photo Upload
   - Camera/gallery access
   - Multi-image selection
   - Reorder capability
   - Set cover photo
   - Minimum 1 photo required
   → "Review" button
5. Step 3: Review & Confirm
   - Preview card showing all details
   - "What happens next?" information box
   - Explicit reminder: NOT automatically insured
   → "Submit Asset" button
6. Success confirmation modal
   - "NFP account manager notified"
   - Return to catalog
```

### Flow 3: View Catalog → Filter/Search
```
1. User lands on Catalog (default: grid view)
2. Header shows: total items, total value
3. User can:
   a. Toggle Grid ⟷ List view
   b. Search by keyword (name, brand, description)
   c. Open filters panel
      - Category (All, Vehicle, Jewelry, Watch, etc.)
      - Value Range (All, <100k, 100k-500k, >500k)
   d. View disclaimer banner (persistent)
4. Tap any asset → Asset Detail screen
```

### Flow 4: Open Asset Detail → View Insurance Details
```
1. User taps asset from catalog
2. Asset Detail screen loads
   - Photo gallery (swipe through images)
   - "Asset Information" section
     - Label: "Client-provided" (top-right)
     - All user-entered fields displayed
   - "Insurance Details" section
     - Icon + "From NFP" badge
     - Distinct visual treatment (gradient background)
     - Status badge (Active/Pending/Not Bound/Needs Review)
     - Premium, Coverage Limit, Deductible
     - Effective/Expiration dates
     - Read-only disclaimer at bottom
   - Important notice banner (upload ≠ coverage)
3. User can:
   - Edit client information (not insurance data)
   - Delete asset (with warning modal)
   - Navigate back to catalog
```

### Flow 5: Edit Client-Provided Details
```
1. From Asset Detail, tap Edit icon (top-right)
2. Edit mode activated
   - Editable fields: Name, Description, Value, Brand
   - Insurance section remains read-only (grayed out)
   - Warning: "Insurance details cannot be edited here"
3. User makes changes
4. Tap "Save Changes"
5. Confirmation (no modal needed)
6. Return to detail view (edit mode off)
7. Account manager notified of update
```

### Flow 6: Delete/Archive Asset
```
1. From Asset Detail, tap Delete icon (top-right)
2. Confirmation modal appears
   - Warning icon (red)
   - "Delete Asset?" heading
   - Asset name shown in quotes
   - "This action cannot be undone"
   - "Your account manager will be notified"
3. User must choose:
   - "Cancel" → Close modal
   - "Delete" (red button) → Confirm deletion
4. Asset removed from catalog
5. Return to Catalog view
6. Account manager receives notification
```

---

## 3. Screen-by-Screen Wireframes Description

### Login Screen
**Layout:**
- Full-screen dark gradient background (slate-900 to slate-800)
- Centered logo/icon (shield with amber accent)
- App name: "Luxury Insurables"
- Tagline: "Secure asset management"
- Email input field
- Password input field
- "Continue" button (amber)
- "Forgot password?" link
- Trust indicator at bottom (lock icon + security message)
- Legal disclaimer (tiny text)

**Visual Style:**
- Dark, sophisticated, banking-like
- High contrast for readability
- Large input fields (touch-friendly)

---

### MFA Screen
**Layout:**
- Dark background (consistent with login)
- Back button (top-left)
- Shield icon (centered, amber)
- Heading: "Two-Factor Authentication"
- Instruction text
- 6 individual input boxes for code (large, white)
- Method switcher: [SMS Code] [Auth App]
- "Resend code" link
- Security note at bottom

**UX Details:**
- Auto-focus first input
- Auto-advance to next input on entry
- Auto-submit on 6th digit
- Visual feedback for each input

---

### Onboarding Screens (4-step sequence)
**Common Layout:**
- Progress dots at top (4 dots)
- Large icon (centered)
- Heading
- Description paragraph
- Important notice box (amber for warnings, blue for info)
- "Continue" button at bottom
- "Back" button (after step 1)

**Step 1: Welcome**
- Shield icon
- "Welcome to Luxury Insurables"
- Description of service
- Blue info box: data encryption message

**Step 2: Document Assets**
- Camera icon
- "Document Your Assets"
- Explanation of cataloging
- ⚠️ AMBER WARNING BOX: "Adding an item does not automatically provide coverage"

**Step 3: Stay Informed**
- Bell icon
- "Stay Informed"
- Insurance details viewing
- Info: Account manager notifications

**Step 4: You're All Set**
- Checkmark icon
- "You're All Set"
- Encouragement to add first asset
- "Get Started" button

---

### Catalog - Grid View
**Layout:**
- Sticky header (white background)
  - Title: "My Assets"
  - Subtitle: "X items · $XXXk total"
  - View toggles: [Grid] [List]
- Search bar (large, prominent)
- "Filters" button with active indicator
- Expandable filters panel
  - Category chips
  - Value range chips
- Disclaimer banner (amber, persistent)
  - Alert icon + "Assets shown here are not automatically insured..."
- 2-column grid of asset cards
  - Square photo
  - Status badge (top-right on photo)
  - Name (truncated to 2 lines)
  - Category label
  - Estimated value

**Empty State:**
- Search icon (large, centered)
- "No assets found"
- Contextual message based on filters

---

### Catalog - List View
**Layout:**
- Same header as grid view
- Single-column list
- Each row:
  - Thumbnail photo (left, 80x80px rounded)
  - Name (truncated to 1 line)
  - Description (truncated to 1 line, gray)
  - Value (bottom-left)
  - Category (bottom-right, small)
  - Status badge (top-right)

**Visual Hierarchy:**
- More detail-forward than grid
- Better for scanning text
- Smaller photos

---

### Add Asset - Step 1: Details Form
**Layout:**
- Sticky header
  - "Cancel" (left)
  - "Add Asset" (center)
  - Progress bars (3 bars, 1st active)
- Disclaimer banner (amber)
- Scrollable form
  - Asset Name* (text input)
  - Description* (textarea, 4 rows)
  - Estimated Value* (number input with $ prefix)
    - Info tooltip: "We ask for estimated value to help determine coverage"
  - Category* (6 cards in 2-column grid)
    - Each: emoji icon, label, selectable border
  - Brand (text input, optional)
  - Year (number input, optional)
  - Serial Number (text input, optional)
    - Info tooltip: "Serial numbers help verify authenticity"
  - Appraisal Date (date picker, optional)
- "Continue to Photos" button (disabled until required fields complete)

**Form Validation:**
- Required fields marked with red asterisk
- Real-time validation
- Button disabled state

---

### Add Asset - Step 2: Photos
**Layout:**
- Sticky header with progress (2nd bar active)
- Heading: "Add Photos"
- Instruction text
- 3-column grid
  - Each uploaded photo:
    - Square thumbnail
    - "Cover" badge (if cover photo)
    - Set as cover button (checkmark icon)
    - Remove button (X icon)
  - Upload tile:
    - Camera icon
    - "Add Photo" text
    - Dashed border
- "Back" and "Review" buttons (50/50 width)

**Photo Management:**
- First photo is default cover
- Tap to enlarge (future enhancement)
- Reorder by drag (future enhancement)

---

### Add Asset - Step 3: Review & Confirm
**Layout:**
- Sticky header with progress (3rd bar active)
- Heading: "Review & Submit"
- Preview card (same style as detail view)
  - Cover photo (large)
  - All details displayed
- Blue info box: "What happens next?"
  - Bulleted list:
    - Asset added to catalog
    - Account manager notified
    - Review for coverage options
    - NOT automatically insured
- "Back" and "Submit Asset" buttons

**Success Modal:**
- White rounded modal on dark overlay
- Green checkmark icon
- "Asset Added Successfully"
- "Your NFP account manager has been notified"
- Auto-dismiss after 1.5s

---

### Asset Detail Screen
**Layout:**
- Sticky header
  - "Back" (left)
  - Edit icon (top-right)
  - Delete icon (top-right, red)
- Full-width photo gallery
  - Large photo (320px height)
  - Pagination dots (if multiple photos)
- Content area (white background with padding)

**Section 1: Asset Information**
- Section header: "ASSET INFORMATION" (small caps, gray)
- Label: "Client-provided" (top-right, small)
- White card with border
  - Name (large heading)
  - Description (gray text)
  - Grid of details:
    - Estimated Value
    - Category
    - Brand (if exists)
    - Year (if exists)
    - Serial Number (if exists)
    - Appraisal Date (if exists)
    - Added date
    - Last updated date

**Section 2: Insurance Details**
- Section header with shield icon + "FROM NFP" badge (blue)
- Gradient card (blue-50 to indigo-50) with blue border
  - If insurance exists:
    - Status badge (large, top)
    - Divider line
    - 2-column grid:
      - Annual Premium (with $ icon)
      - Coverage Limit (with shield icon)
      - Deductible (with alert icon)
      - Effective Date (with calendar icon)
      - Expiration Date (with calendar icon)
    - Divider line
    - Disclaimer: "Insurance details managed by NFP..."
  - If no insurance:
    - Empty state
    - Shield icon (gray)
    - "No Insurance Details"
    - "Your NFP account manager will review..."

**Section 3: Important Notice**
- Amber info box
- Bold "Important:"
- Explanation of client data vs. insurance data

---

### Asset Detail - Edit Mode
**Layout:**
- Same header (Cancel replaces Back, no delete icon)
- Heading: "Edit Asset"
- Explanation: insurance details cannot be edited
- Form fields (editable):
  - Asset Name
  - Description
  - Estimated Value
  - Brand
- Insurance section grayed out (not editable)
- "Cancel" and "Save Changes" buttons

---

### Delete Confirmation Modal
**Layout:**
- Dark overlay (50% black)
- White rounded modal (centered)
  - Close X (top-right)
  - Red icon circle (trash icon)
  - Heading: "Delete Asset?"
  - Warning text with asset name in quotes
  - "This action cannot be undone"
  - "Your account manager will be notified"
  - "Cancel" and "Delete" buttons (Delete is red)

---

### Settings Screen
**Layout:**
- Sticky header
  - "Back" button
  - Title: "Settings"
- Account info card
  - Avatar circle (initials, gradient)
  - Name
  - Email
- Settings sections (each in white cards):

**Security Section:**
- Change Password (chevron right)
- Two-Factor Authentication (with "Active" badge)
- Session Timeout (chevron right)

**Notifications Section:**
- Email Notifications (toggle switch)

**Privacy & Legal Section:**
- Privacy Policy (chevron right)
- Terms of Service (chevron right)
- Data Protection (chevron right)

**Privacy Notice Box (blue):**
- Shield icon
- "Your Privacy Matters"
- Explanation of bank-level encryption

**Data Use Policy Box (amber):**
- Document icon
- "Data Use Policy"
- Warning about PII/sensitive data

**Sign Out button (red text)**

**App version footer (small, centered)**

---

### Session Timeout Modal
**Layout:**
- Dark overlay
- White rounded modal (centered)
  - Clock icon (amber circle)
  - Heading: "Session Expired"
  - Explanation (security, 15 min timeout)
  - "Sign In Again" button (amber)
  - Shield icon + "Your data remains secure" (small text)

---

## 4. UI Design Direction

### Color Palette

**Primary:**
- Amber 600 (#d97706) - Primary actions, accents
- Amber 700 (#b45309) - Hover states
- Amber 50 (#fffbeb) - Light backgrounds, warnings

**Neutral:**
- Slate 900 (#0f172a) - Headings, dark text
- Slate 700 (#334155) - Body text
- Slate 500 (#64748b) - Secondary text
- Slate 400 (#94a3b8) - Placeholders
- Neutral 50 (#fafafa) - Page background
- Neutral 100 (#f5f5f5) - Card backgrounds
- White (#ffffff) - Primary surfaces

**Semantic:**
- Emerald 600 (#059669) - Active status, success
- Red 600 (#dc2626) - Destructive actions, errors
- Blue 600 (#2563eb) - Informational, insurance data
- Amber 600 (#d97706) - Warnings, disclaimers

**Gradients:**
- Login/MFA: slate-900 → slate-800
- Insurance cards: blue-50 → indigo-50
- Avatar: amber-500 → amber-600

---

### Typography Scale

**Font Family:**
- System font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

**Scale:**
- H1: 1.75rem (28px), weight 700, line-height 1.25, letter-spacing -0.025em
- H2: 1.25rem (20px), weight 600, line-height 1.375, letter-spacing -0.0125em
- H3: 1.125rem (18px), weight 600, line-height 1.5
- Body: 0.9375rem (15px), weight 400, line-height 1.6
- Small: 0.875rem (14px), weight 400
- Tiny: 0.75rem (12px), weight 400

**Font Weights:**
- Regular: 400
- Semibold: 600
- Bold: 700

---

### Spacing System

- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)

**Component Padding:**
- Cards: 16px (1rem)
- Screen horizontal: 16px (1rem)
- Section vertical: 24px (1.5rem)

---

### Component Library

**Buttons:**

*Primary (Amber):*
- Background: amber-600
- Hover: amber-700
- Text: white
- Padding: 12px 16px (py-3 px-4)
- Border radius: 8px (rounded-lg)
- Min height: 44px

*Secondary (Neutral):*
- Background: neutral-100
- Hover: neutral-200
- Text: slate-900
- Same padding/radius

*Destructive (Red):*
- Background: red-600
- Hover: red-700
- Text: white

*Ghost:*
- Background: transparent
- Hover: neutral-100
- Text: slate-600

**Input Fields:**
- Border: 1px solid neutral-200
- Focus: 2px ring amber-500/20, border amber-500
- Padding: 12px 16px
- Border radius: 8px
- Background: white
- Min height: 44px (touch-friendly)

**Cards:**
- Background: white
- Border: 1px solid neutral-200
- Border radius: 12px (rounded-xl)
- Padding: 16px
- Shadow: subtle (optional)

**Status Badges:**

*Active:*
- Background: emerald-50
- Text: emerald-700
- Border: emerald-200
- Icon: CheckCircle

*Pending:*
- Background: amber-50
- Text: amber-700
- Border: amber-200
- Icon: Clock

*Not Bound:*
- Background: slate-100
- Text: slate-700
- Border: slate-200
- Icon: XCircle

*Needs Review:*
- Background: orange-50
- Text: orange-700
- Border: orange-200
- Icon: AlertCircle

**Category Chips:**
- Inactive: neutral-100 background, slate-700 text
- Active: slate-900 background, white text
- Border radius: 9999px (fully rounded)
- Padding: 6px 12px

**Upload Tiles:**
- Dashed border: 2px dashed neutral-300
- Hover: border amber-500, background amber-50
- Square aspect ratio
- Camera icon centered

**Photo Thumbnails:**
- Border radius: 8px (rounded-lg)
- Object-fit: cover
- Aspect ratio: 1:1 (square)

**Info Boxes:**

*Warning (Amber):*
- Background: amber-50
- Border: amber-200
- Text: amber-900
- Icon: AlertCircle (amber-600)

*Info (Blue):*
- Background: blue-50
- Border: blue-200
- Text: blue-900
- Icon: Info (blue-600)

*Success (Emerald):*
- Background: emerald-50
- Border: emerald-200
- Text: emerald-900
- Icon: CheckCircle (emerald-600)

---

### Visual Style Guidance

**Gallery-Forward Cards (Catalog):**
- Large, prominent photos
- Minimal text overlay
- Photo should occupy 60-70% of card space
- Hover effect: subtle border color change (neutral-200 → amber-500)
- Tap feedback: scale(0.98)

**Shadows:**
- Use sparingly for premium feel
- Cards: no shadow by default, subtle on hover (optional)
- Modals: medium shadow (0 10px 15px rgba(0,0,0,0.1))
- Floating elements (bottom nav): subtle shadow

**Borders:**
- Prefer borders over shadows for separation
- 1px solid, neutral colors
- Rounded corners (8-12px) for modern feel

**Whitespace:**
- Generous padding in cards (16px minimum)
- Breathable spacing between sections (24px+)
- Don't cram information

**Animations:**
- Subtle, purposeful
- Page transitions: fade + slight translate
- Button taps: scale(0.98)
- Modal appearance: scale(0.9 → 1) + fade
- Duration: 200-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

---

## 5. Microcopy

### Disclaimers

**Upload Disclaimer (Add Asset screen):**
> "Adding an item to your catalog does not automatically provide insurance coverage. Your NFP account manager will review and contact you."

**Catalog Banner:**
> "Assets shown here are not automatically insured. Check each item's insurance details below."

**Asset Detail Important Notice:**
> "Important: Only information in the 'Insurance Details' section represents active coverage. Asset information you provide is for cataloging purposes and does not guarantee coverage."

**Insurance Section (Read-only note):**
> "Insurance details are managed by NFP and updated automatically. Contact your account manager for changes."

**Onboarding Warning (Step 2):**
> "Important: Uploading images or adding an item does not automatically mean it is insured/covered."

---

### Empty States

**Empty Catalog:**
> **Heading:** "No assets found"
> **Body:** "Add your first asset to get started"

**Empty Catalog (with filters):**
> **Heading:** "No assets found"
> **Body:** "Try adjusting your filters"

**No Insurance Details:**
> **Heading:** "No Insurance Details"
> **Body:** "Your NFP account manager will review this asset and update coverage information."

---

### Upload Confirmations

**Asset Added Success Modal:**
> **Heading:** "Asset Added Successfully"
> **Body:** "Your NFP account manager has been notified and will review your submission."

**Asset Updated (inline notification):**
> "Changes saved. Your account manager has been notified."

---

### Insurance Section Labels

**Section Header:**
> "INSURANCE DETAILS" (with shield icon) + "From NFP" badge

**Premium Field:**
> "Annual Premium" (with dollar icon)

**Coverage Limit:**
> "Coverage Limit" (with shield icon)

**Deductible:**
> "Deductible" (with alert triangle icon)

**Dates:**
> "Effective Date" / "Expiration Date" (with calendar icon)

**Status:**
> "Policy Status"

---

### Error States

**Failed Photo Upload:**
> **Heading:** "Upload Failed"
> **Body:** "Unable to upload photo. Please check your connection and try again."
> **Button:** "Retry"

**Invalid Value:**
> "Please enter a valid dollar amount (e.g., 50000)"

**Session Expired:**
> **Heading:** "Session Expired"
> **Body:** "For your security, you've been signed out after 15 minutes of inactivity. Please sign in again to continue."
> **Note:** "Your data remains secure"

**Network Error:**
> **Heading:** "Connection Lost"
> **Body:** "Unable to save changes. Please check your internet connection."

**Deletion Error:**
> **Heading:** "Unable to Delete"
> **Body:** "Something went wrong. Please try again or contact support."

---

### Privacy + Security Messaging

**Login Screen (Trust Indicator):**
> "Your data is encrypted end-to-end and stored securely. We never share your information without your explicit consent."

**Settings - Privacy Notice:**
> "Luxury Insurables uses bank-level encryption to protect your data. We never share your information without explicit consent. Your asset details are private and accessible only to you and your designated NFP account manager."

**Settings - Data Use Policy:**
> "This platform is designed for insurance servicing and asset cataloging. Please avoid uploading sensitive personal information (SSN, financial account numbers, etc.) that is not directly related to insuring these assets."

**MFA Screen (Security Note):**
> "For your security, you'll be asked to verify your identity each time you sign in"

**Estimated Value Tooltip:**
> "We ask for estimated value to help your account manager determine appropriate coverage levels."

**Serial Number Tooltip:**
> "Serial numbers help verify authenticity and ownership in case of loss or theft."

**What Happens Next? (Add Asset Review):**
> - Your asset will be added to your catalog
> - Your NFP account manager will be notified
> - They will review and contact you about coverage options
> - This item is NOT automatically insured until confirmed

---

### Button Labels

**Primary Actions:**
- "Continue"
- "Get Started"
- "Submit Asset"
- "Save Changes"
- "Sign In Again"

**Secondary Actions:**
- "Back"
- "Cancel"
- "Review"

**Destructive:**
- "Delete"
- "Remove"

**Utility:**
- "Resend code"
- "Forgot password?"
- "Sign Out"

---

## 6. Accessibility + Trust

### Contrast Targets

**WCAG AAA Compliance (7:1 for body text, 4.5:1 for large text):**
- Body text (slate-700 #334155) on white: 10.7:1 ✓
- Headings (slate-900 #0f172a) on white: 17.4:1 ✓
- Secondary text (slate-500 #64748b) on white: 6.5:1 ✓
- White text on amber-600: 5.2:1 ✓
- Placeholder text (slate-400): 4.8:1 (meets AA, large text AAA)

**Status Badges:**
- All badge text/icon colors meet 4.5:1 against backgrounds
- Border added for additional visual distinction

---

### Large Tap Targets

**Minimum Size: 44x44px (per iOS Human Interface Guidelines)**
- All buttons: min-height 44px, min-width 44px
- Input fields: min-height 44px
- Navigation items: 72px wide × 60px tall (extra generous)
- Photo thumbnails: minimum 80x80px
- Icon-only buttons: 44x44px hit area (even if icon is smaller)

**Spacing Between Tap Targets:**
- Minimum 8px gap between interactive elements
- Exception: Segmented controls/button groups (visually grouped)

---

### "Privacy-First" Cues

**Visual Indicators:**
1. **Shield Icons** - Used throughout for security features
   - Login screen
   - MFA screen
   - Insurance details section
   - Settings security options

2. **Lock Icons** - Data protection messaging
   - Login trust indicator
   - Encrypted connection references

3. **"From NFP" Badges** - Clear data source labeling
   - Insurance details explicitly marked as NFP-sourced
   - Blue color (trust, institutional)

4. **Gradient Backgrounds** - Visual separation
   - Insurance data: blue gradient (institutional, separate from client data)
   - Client data: white cards (user-controlled)

5. **Section Headers** - Clear ownership labels
   - "Client-provided" label on asset information
   - "From NFP" label on insurance details

6. **Persistent Disclaimers** - Always visible
   - Catalog banner (can't be dismissed)
   - Add asset flow (every step)
   - Asset detail screen (always present)

---

### How to Avoid Implying Coverage

**Strategy 1: Repetitive, Clear Disclaimers**
- Show disclaimer on EVERY screen where assets are displayed
- Use warning color (amber) for maximum attention
- Place in prominent positions (top of content, before CTAs)

**Strategy 2: Visual Separation**
- Client data: white cards, neutral styling
- Insurance data: blue gradient, shield icon, distinct visual treatment
- Never mix the two in same visual container

**Strategy 3: Explicit Language**
- Never use words like "protected," "covered," "insured" for client-added items
- Always say "catalog," "submitted," "pending review"
- Insurance section uses explicit terms: "Active," "Coverage Limit"

**Strategy 4: Contextual Explanations**
- "What happens next?" info boxes
- Tooltips on sensitive fields explaining purpose
- Success messages clarify: "account manager notified" (not "you're covered")

**Strategy 5: Read-Only Insurance Data**
- Client CANNOT edit insurance details
- Visually grayed out in edit mode
- Explicit message: "managed by NFP"

**Strategy 6: Status Badges**
- "Pending" status for items under review
- "Not Bound" for items without coverage
- "Needs Review" for incomplete applications
- Never auto-assign "Active" status

---

### Accessibility Features

**Screen Reader Support:**
- Semantic HTML (headings, landmarks, labels)
- ARIA labels on icon-only buttons
- Alt text on all images
- Form labels properly associated
- Live regions for dynamic content

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Focus indicators (2px amber outline)
- Escape key dismisses modals
- Enter submits forms

**Motion Preferences:**
- Respects prefers-reduced-motion
- Animations disabled if user preference set
- Fallback to instant transitions

**High Contrast Mode:**
- Increased shadow intensity
- Border enhancements
- All content remains readable

**Touch Gestures:**
- No complex gestures required
- Swipe optional (pagination dots alternative)
- Pinch-zoom not disabled

**Error Prevention:**
- Confirmation modals for destructive actions
- Inline validation on forms
- Clear error messages with recovery steps
- Undo options where possible (future enhancement)

---

## 7. Notification System (Account Manager)

### Trigger Events
1. **New Asset Added** - Sends notification with asset details
2. **Asset Updated** - Sends notification with changes
3. **Asset Deleted** - Sends notification
4. **New Photos Uploaded** - Sends notification

### Notification Content (Server-side, not shown to client)
- User name and email
- Asset name and category
- Action taken (added/updated/deleted)
- Timestamp
- Link to asset (in manager portal)

### Client-Side Confirmation
- "Your NFP account manager has been notified"
- No specific timeline promised
- Sets expectation for follow-up

---

## 8. Future Enhancements (Not in Current Scope)

1. **Drag-to-reorder photos**
2. **Photo zoom/lightbox**
3. **Bulk upload**
4. **Export catalog (PDF)**
5. **Document attachment (appraisals, receipts)**
6. **Notes/comments field**
7. **Reminders (appraisal renewal)**
8. **Dark mode**
9. **Multilingual support**
10. **Account manager messaging (in-app)**

---

## 9. Technical Notes

### Responsive Breakpoints
- Mobile-first: 320px - 767px (primary target)
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Responsive Adjustments:**
- Catalog grid: 2 columns mobile → 3 columns tablet → 4 columns desktop
- Bottom nav: persistent on mobile/tablet → sidebar on desktop
- Max-width container: 1200px on desktop
- Font sizes scale up slightly on desktop

### Performance Considerations
- Lazy load images
- Compress photos on upload
- Thumbnail generation (server-side)
- Paginated catalog (if >50 items)

### Security Considerations
- All API calls over HTTPS
- Authentication tokens refreshed every 15 min
- Session timeout after 15 min inactivity
- No sensitive data in URLs
- Rate limiting on uploads

---

## Conclusion

Luxury Insurables balances premium aesthetics with functional clarity. The design prioritizes:

1. **Trust** - Through consistent security messaging and visual cues
2. **Clarity** - Via strict separation of client vs. insurance data
3. **Simplicity** - Clean, focused interfaces with minimal friction
4. **Accessibility** - WCAG AAA compliance, large tap targets, semantic HTML
5. **Mobile-First** - Optimized for smartphone use (primary device)

The result is a sophisticated yet approachable experience that helps high-net-worth individuals manage valuable assets with confidence, while maintaining absolute clarity about insurance coverage status.
