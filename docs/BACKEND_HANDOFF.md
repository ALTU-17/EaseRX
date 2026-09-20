# EaseRX — Frontend ⇄ Backend API Handoff

**Audience:** backend developer (ASP.NET Core)
**Frontend status:** all endpoints below are integrated and rendering against a local contract mirror.
We only need the response shapes confirmed and a few new endpoints added.

| | |
|---|---|
| **Base URL (real)** | `https://localhost:7161/api` |
| **Frontend origin (dev)** | `http://localhost:5173` (also `:5174`) |
| **Contract mirror (local)** | `http://localhost:4000/api` — `server/rx.js` implements this same contract for verification |

---

## 1. Global contract conventions

| Concern | Current frontend expectation |
|---|---|
| **Auth header** | Every `/api/rx/*` request sends `Authorization: Bearer <token>` (token from `POST /api/auth/login`). `/api/rx/public/booking/*` must be **anonymous**. |
| **Auth endpoints** | `/api/auth/*` — no token required. |
| **Content-Type** | `application/json` on every request. |
| **Success envelope** | We accept either `{ success: true, data: <payload> }` **or** the raw payload. Please confirm which you return. |
| **Error envelope** | We read `message`, then `error`, then `title`. Please return a consistent `{ "message": "..." }` with the correct HTTP status. |
| **Paged list envelope** | Assumed `{ items: [...], total: N, page: 1, pageSize: 20 }`. Please confirm. |
| **Dates** | ISO-8601. `dateOfBirth` sent as `YYYY-MM-DD`; `startAt` / `consultationDate` / `invoiceDate` as full ISO strings. |
| **Delete semantics** | Confirm soft vs hard delete and the cascade rules (delete a patient → what happens to their prescriptions/invoices?). |
| **CORS / TLS** | Dev cert is self-signed — allow origin `http://localhost:5173` (and `:5174`), otherwise the browser blocks every call. |

---

## 2. Implemented endpoints

Every endpoint below is already called by a screen.

### 2.1 Auth — `/login` (`Auth.jsx`)

| Method | Path | Request | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, clinicName?, registrationNo?, phoneNumber, email, password, role }` | we send `role: "Doctor"` |
| POST | `/api/auth/login` | `{ emailOrPhone, password }` | expects `{ token, user }` |
| POST | `/api/auth/forgot-password` | `{ email, client }` | we send `client: "RxMaker"` |
| POST | `/api/auth/reset-password` | `{ userId, token, newPassword }` | is `userId` an email or a GUID? |

### 2.2 Patients — `/patients`, `/patients/:id`

`GET /api/rx/patients?search&page&pageSize` · `POST /api/rx/patients` · `GET /api/rx/patients/{id}` · `PUT /api/rx/patients/{id}` · `DELETE /api/rx/patients/{id}`

### 2.3 Medicines — `/medicines` (new screen)

`GET /api/rx/medicines?search&page&pageSize` · `POST /api/rx/medicines` · `PUT /api/rx/medicines/{id}` · `DELETE /api/rx/medicines/{id}`

*(`GET /api/rx/medicines/{id}` exists but is currently unused by the UI.)*

### 2.4 Prescriptions — `/rx`, `/prescriptions`

`GET /api/rx/prescriptions?status&page&pageSize` · `POST /api/rx/prescriptions` · `PUT /api/rx/prescriptions/{id}` · `DELETE /api/rx/prescriptions/{id}`

*(`GET /api/rx/prescriptions/{id}` is wired but unused so far.)*

### 2.5 Invoices — `/bill`, `/bill/:id`, `/rx`

`GET /api/rx/invoices?status&page&pageSize` · `POST /api/rx/invoices` · `POST /api/rx/invoices/from-prescription/{prescriptionId}` · `GET /api/rx/invoices/{id}` · `PUT /api/rx/invoices/{id}/payment` · `DELETE /api/rx/invoices/{id}`

### 2.6 Dashboard — `/dashboard`

`GET /api/rx/dashboard`

### 2.7 Appointments — `/appointments`

`GET /api/rx/appointments?page&pageSize` · `POST /api/rx/appointments` · `PUT /api/rx/appointments/{id}` · `POST /api/rx/appointments/{id}/cancel` · `GET /api/rx/appointments/booking-info`

*(`GET /api/rx/appointments/{id}` is wired but unused so far.)*

### 2.8 Public booking — `/book`, `/book/:clinicId` (anonymous)

`GET /api/rx/public/booking/{clinicId}` · `POST /api/rx/public/booking/{clinicId}`

### 2.9 Settings — `/settings`, header branding

`GET /api/rx/settings` · `PUT /api/rx/settings/profile` · `POST /api/rx/settings/profile/submit-verification` · `PUT /api/rx/settings/pdf` · `POST /api/rx/settings/pdf/reset`

### 2.10 Plans — `/plans`, sidebar plan card

`GET /api/rx/plans` · `POST /api/rx/plans/upgrade`

*(`GET /api/rx/plans/current` exists but is unused — we derive the current plan from `/plans`.)*

---

## 3. Response DTOs we need confirmed

The handoff specified **request** DTOs but not most **response** shapes. The frontend uses defensive
mappers, so the shapes below are what we currently parse. Please confirm or correct — the proposed C#
is ready to paste.

### 3.1 Patient — `GET/POST/PUT /api/rx/patients`

```csharp
public class PatientResponseDto
{
    public Guid Id { get; set; }              // or string — we treat id as opaque
    public string FullName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; }        // F | M | Other
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
}
```

### 3.2 Medicine — `GET/POST/PUT /api/rx/medicines`

```csharp
public class MedicineResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? GenericName { get; set; }
    public string? Form { get; set; }
    public string? Strength { get; set; }
    public string? DefaultSig { get; set; }
    public int? DefaultDispenseQty { get; set; }
    public int? DefaultRefills { get; set; }
    public bool IsActive { get; set; }
}
```

### 3.3 Prescription — `GET/POST/PUT /api/rx/prescriptions`

> **Critical:** `PatientName` must be returned, otherwise list rows render blank.

```csharp
public class PrescriptionResponseDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; }       // required
    public DateTime ConsultationDate { get; set; }
    public string? BloodPressure { get; set; }
    public string? Temperature { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? DoctorAdvice { get; set; }
    public string Status { get; set; }             // "Draft" | "Final"
    public List<PrescriptionMedicineLineDto> Medicines { get; set; }
    public DateTime? CreatedAt { get; set; }
}
```

### 3.4 Invoice — `GET/POST /api/rx/invoices`

> **Critical:** `InvoiceNumber`, `Subtotal`, `Total`, `PaidAmount` are all required by the invoice screen.

```csharp
public class InvoiceResponseDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; }
    public DateTime InvoiceDate { get; set; }
    public List<InvoiceItemCreateDto> Items { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public string Status { get; set; }             // "Paid" | "Unpaid" | "Partial"
    public string? Notes { get; set; }
}
```

### 3.5 Appointment — `GET/POST/PUT /api/rx/appointments`

> Confirm the **exact status enum**. We currently map `Scheduled → pending`, `Confirmed`, `Completed`, `Cancelled`.

```csharp
public class AppointmentResponseDto
{
    public Guid Id { get; set; }
    public Guid? PatientId { get; set; }
    public string PatientName { get; set; }
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public string? Email { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; }             // ? Scheduled | Confirmed | Completed | Cancelled
    public string? Notes { get; set; }
}
```

### 3.6 Dashboard — `GET /api/rx/dashboard`

You gave the scalar fields; these nested arrays were unspecified. We parse:

```csharp
public class DashboardResponseDto
{
    public string ClinicName { get; set; }
    public string DoctorName { get; set; }
    public StatBlockDto Patients { get; set; }       // { value, percentChange }
    public StatBlockDto Prescriptions { get; set; }
    public StatBlockDto Receipts { get; set; }
    public StatBlockDto Revenue { get; set; }
    public int DraftPrescriptionsCount { get; set; }
    public int TodayAppointmentsCount { get; set; }

    // shapes below need confirmation:
    public List<ActivityItemDto> RecentActivity { get; set; }
    public List<PatientResponseDto> NewPatients { get; set; }
    public List<AppointmentResponseDto> UpcomingPatients { get; set; }
    public List<RevenuePointDto> RevenueTrend { get; set; }
    public string BookingLink { get; set; }
    public PlanSummaryDto Plan { get; set; }         // { name, isActive, message }
}

public class ActivityItemDto { public string Id; public string Type; /* prescription|patient|alert */ public string Text; public string Meta; }
public class RevenuePointDto { public string Month; public decimal Value; }
public class StatBlockDto    { public decimal Value; public int PercentChange; }
public class PlanSummaryDto  { public string Name; public bool IsActive; public string? Message; }
```

### 3.7 Settings — `GET /api/rx/settings` (**new response DTO needed**)

Only the PUT DTOs were provided. We need one composite GET response:

```csharp
public class SettingsResponseDto
{
    // doctor profile
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RegistrationNo { get; set; }
    public string? NpiNumber { get; set; }
    public string? StateOfLicensure { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public bool IsVerified { get; set; }

    // clinic identity (used for the header, sidebar and printed prescription)
    public string ClinicName { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    // PDF config
    public double PdfTopMarginMm { get; set; }
    public double PdfBottomMarginMm { get; set; }
    public double PdfLeftMarginMm { get; set; }
    public double PdfRightMarginMm { get; set; }
    public double PdfPrintScale { get; set; }
    public string PdfPaperSize { get; set; }          // "A4" | "Letter" | "A5"
    public bool PdfIncludeLogo { get; set; }
    public bool PdfIncludeSignature { get; set; }
    public bool PdfAddWatermark { get; set; }
}
```

### 3.8 Plans — `GET /api/rx/plans`

```csharp
public class PlansResponseDto
{
    public List<PlanDto> Plans { get; set; }
    public CurrentPlanDto CurrentPlan { get; set; }   // { planId, name }
}

public class PlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string? Tagline { get; set; }
    public bool Popular { get; set; }
    public List<PlanFeatureDto> Features { get; set; } // { text, included }
}
```

### 3.9 Public booking clinic — `GET /api/rx/public/booking/{clinicId}`

Currently parsed as `{ clinicId, clinicName, bookingLink }`. Should it also return address, working
hours and doctor name?

---

## 4. Small contract fixes

1. `forgot-password` `client`: we send **`"RxMaker"`** — your earlier doc said `"easeRX"`. Confirm the canonical value.
2. `reset-password` `userId`: your example used an email address — confirm email vs GUID.
3. `RegisterRequest` carries `masjidId` and defaults `role` to `"MasjidAdmin"` — looks like template leakage. Confirm the RxMaker role string (`"Doctor"`?).
4. Confirm the **paged list envelope** for all list endpoints.
5. Confirm the **error envelope** so we can surface real messages to the user.

---

## 5. New endpoints requested (missing today)

### 5.1 Already in the UI, but no endpoint exists

| # | Feature | Proposed endpoint(s) |
|---|---|---|
| 1 | **Booking availability / slots** — the client currently generates slots locally and posts `startAt`; nothing prevents double-booking | `GET /api/rx/public/booking/{clinicId}/slots?date=` and **409 Conflict** on POST when the slot is taken |
| 2 | **Clinic profile** (name, working hours) — Settings can edit address/phone/email but not the clinic name or timings | `PUT /api/rx/settings/clinic` |
| 3 | **Doctor change password** | `POST /api/rx/settings/change-password` |
| 4 | **File upload** — `pdfIncludeLogo` / `pdfIncludeSignature` imply logo + signature images | `POST /api/rx/settings/assets` (multipart) → returns URLs included in settings |
| 5 | **Logout / refresh / token revoke** — token lifetime is unspecified | `POST /api/auth/refresh`, `POST /api/auth/logout` |
| 6 | **Email/phone verification (OTP)** — no verify step on register | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` |

### 5.2 Natural next features (no UI or API yet)

| # | Feature | Proposed endpoint(s) |
|---|---|---|
| 7 | Reports & analytics (only the dashboard exists) | `GET /api/rx/reports/revenue?from&to`, `/reports/patients`, `/reports/treatments`, `?format=csv` |
| 8 | Notifications & reminders (plan advertises WhatsApp automation) | `GET /api/rx/notifications`, `POST /api/rx/appointments/{id}/remind` |
| 9 | Appointment ↔ patient linking (appointments store only a name) | `GET /api/rx/patients/{id}/appointments`; allow `POST /api/rx/appointments` with `patientId` |
| 10 | Inventory / stock deduction on prescription finalize | `POST /api/rx/prescriptions/{id}/dispense` |
| 11 | Full activity/audit history (dashboard shows only a sample) | `GET /api/rx/activity?page&pageSize` |
| 12 | Multi-doctor / clinic staff (Elite plan promises it) | `GET/POST /api/rx/staff`, `PUT /api/rx/staff/{id}/role` |
| 13 | Subscription billing (`upgradePlan` takes `paymentReference` but there is no checkout) | `POST /api/rx/plans/checkout`, `GET /api/rx/plans/transactions` |
| 14 | Patient portal (patients cannot view their own Rx/invoices) | `POST /api/auth/patient-login`, `GET /api/rx/me/prescriptions` |

---

## 6. Sign-off checklist

- [ ] Confirm success + error envelopes
- [ ] Confirm the paged list envelope
- [ ] Return `patientName` on prescriptions and `invoiceNumber` / `subtotal` / `total` / `paidAmount` on invoices
- [ ] Publish the `SettingsResponseDto` for `GET /api/rx/settings`
- [ ] Publish the `PlansResponseDto` + `PlanDto`
- [ ] Document the appointment status enum + what `/cancel` sets
- [ ] Document the dashboard nested shapes (`recentActivity`, `revenueTrend`, `newPatients`, `upcomingPatients`, `plan`)
- [ ] Confirm the `client` value, `reset-password userId`, and the role string
- [ ] Enable CORS for `http://localhost:5173` + a trusted dev cert
- [ ] Decide on the availability endpoint + 409 conflict handling

---

*Generated from `client/src/api.js` — every shape marked "assumed" is exactly what the current
mappers parse, so if a shape differs only the mapper needs a tweak, not the screens.*
