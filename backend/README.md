# Backend Project Documentation (Continued)

---

## Shared & Modular Components (Backend Architecture)

The backend design divides system logic into cohesive, reusable architectural blocks, utility modules, and role-scoped services. This modular layout prevents code duplication, simplifies maintenance, and ensures uniform behavior across all system endpoints.

### Core Architectural Building Blocks

| Component / Layer | Location / Module | Purpose |
| --- | --- | --- |
| **Custom Auth Classes** | `users/authentication.py` | Scoped token authentication classes (`JobSeekerAuthToken`, Company, Admin) reading from unique request headers. |
| **Permission Classes** | `users/permissions.py` | Role-based and state-based access guards (`IsJobSeekerAuthenticated`, `IsApprovedCompany`, `IsAdminUser`). |
| **OTP Service** | `users/services/otp.py` | Cryptographic OTP generation, encryption, expiration tracking, and rate-limiting enforcement. |
| **Email Service** | `users/services/email.py` | Shared utility handling dynamic transactional emails (verification, status notifications, recovery links). |
| **Recommendation Pipeline** | `recommendations/services.py` | Batch text aggregation, embedding generation via Sentence-Transformers, and Cosine Similarity calculation. |
| **Exception Handler** | `jobportal/exceptions.py` | Centralized exception mapping ensuring uniform JSON error responses across all API endpoints. |

### Role-Specific Backend Modules

| Role / Domain | Core Apps & Services | Purpose |
| --- | --- | --- |
| **Job Seeker** | `users`, `seeker_profiles`, `applications` | Handles seeker registration, portfolio file validation (CV/image), tracking job applications, and personalized recommendations. |
| **Company** | `company_profile`, `jobs` | Manages corporate profiles, multi-step pending approvals, job posting ownership control, and applicant management. |
| **Admin** | `admin_dashboard` | Implements administrative controls for company account approvals/rejections and system-wide data management via Django Admin. |

---

## Forms, Validation & Data Sanitization

The backend utilizes Django REST Framework Serializers alongside native Django validators to enforce strict data integrity before database persistence.

### Validation Strategies & Layers

1. **Serializer-Level Validation:** Ensures incoming JSON payloads match expected field types, structural constraints, and uniqueness rules (such as cross-table email availability checks).
2. **Field-Specific Custom Validators:** Custom logic enforces strict formatting rules for complex data attributes.
3. **Database Constraints:** Relies on unique constraints (e.g., `unique_together` on `JobApplication`) to prevent duplicate records at the storage level.

### Validation Utilities & Rules

| Input / Field | Validation Rules & Sanitization Approach |
| --- | --- |
| **Email Address** | Regex format verification combined with DNS MX record checks to ensure the domain can receive emails. |
| **Phone Number** | Strict international format validation starting with `+` followed by numerical strings within a defined length range. |
| **Password** | Enforces minimum length constraints, rejects empty values, and applies default Django security rules. |
| **Experience / Education** | Requires a valid end date unless marked as current; validates academic years within a logical range ($1950\text{--}2100$). |
| **File Uploads (CV)** | Restricted strictly to PDF format with a maximum size limit of $5\text{ MB}$. |
| **File Uploads (Images)** | Accepted formats include JPG, JPEG, and PNG, capped at a maximum size of $2\text{ MB}$. |

---

## Error Handling and User Feedback

The backend communicates failures and successful operations through structured HTTP status codes and consistent error response formats.

* **Centralized Exception Handler:** Intercepts standard DRF and Django exceptions to return uniform error keys.
* **Validation Error Mapping:** Field-specific errors return descriptive keys mapped directly to form input fields.
* **Http Status Codes:** Standardized usage of status codes ($200\text{ OK}$, $201\text{ Created}$, $400\text{ Bad Request}$, $401\text{ Unauthorized}$, $403\text{ Forbidden}$, $404\text{ Not Found}$).

---

## Authentication & Authorization Flow

### Authentication Process

The backend processes authentication requests by inspecting role-specific records. Credentials are verified against passwords and account statuses (active for job seekers, admin-approved for companies). Upon success, a role-scoped token is issued.

### Token Management & Security Headers

* **Job Seekers:** Uses custom tokens stored in dedicated header structures (`JobSeekerAuthToken`).
* **Companies & Admins:** Uses dedicated authentication headers for session identification.
* **Token Expiration & Security:** Tokens are securely stored and validated per request cycle by custom authentication classes.

### Role-Based Access Control (RBAC)

Access control is enforced via custom permission classes:

* `IsJobSeekerAuthenticated`: Grants access exclusively to verified job seekers.
* `IsCompanyAuthenticated`: Restricts access to company dashboard and profile endpoints.
* `IsApprovedCompany`: Prevents unapproved companies from publishing or editing jobs.
* `IsAdminUser`: Restricts access exclusively to administrative accounts.

### Account Lifecycle & Verification Flow

* **Job Seekers:** Instant account generation and activation upon successful OTP code verification.
* **Companies:** Registration data is stored as a pending verification record. Following OTP confirmation, the account undergoes manual administrative review. Approval creates the official company entry; rejection purges the record and triggers a notification email.


## Shared & Modular Components (Backend Architecture)

The backend design divides system logic into cohesive, reusable architectural blocks, utility modules, and role-scoped services. This modular layout prevents code duplication, simplifies maintenance, and ensures uniform behavior across all system endpoints.

### Core Architectural Building Blocks

| Component / Layer | Location / Module | Purpose |
| --- | --- | --- |
| **Custom Auth Classes** | `users/authentication.py` | Scoped token authentication classes (`JobSeekerAuthToken`, Company, Admin) reading from unique request headers. |
| **Permission Classes** | `users/permissions.py` | Role-based and state-based access guards (`IsJobSeekerAuthenticated`, `IsApprovedCompany`, `IsAdminUser`). |
| **OTP Service** | `users/services/otp.py` | Cryptographic OTP generation, encryption, expiration tracking, and rate-limiting enforcement. |
| **Email Service** | `users/services/email.py` | Shared utility handling dynamic transactional emails (verification, status notifications, recovery links). |
| **Recommendation Pipeline** | `recommendations/services.py` | Batch text aggregation, embedding generation via Sentence-Transformers, and Cosine Similarity calculation. |
| **Exception Handler** | `jobportal/exceptions.py` | Centralized exception mapping ensuring uniform JSON error responses across all API endpoints. |

### Role-Specific Backend Modules

| Role / Domain | Core Apps & Services | Purpose |
| --- | --- | --- |
| **Job Seeker** | `users`, `seeker_profiles`, `applications` | Handles seeker registration, portfolio file validation (CV/image), tracking job applications, and personalized recommendations. |
| **Company** | `company_profile`, `jobs` | Manages corporate profiles, multi-step pending approvals, job posting ownership control, and applicant management. |
| **Admin** | `admin_dashboard` | Implements administrative controls for company account approvals/rejections and system-wide data management via Django Admin. |

---

## Forms, Validation & Data Sanitization

The backend utilizes Django REST Framework Serializers alongside native Django validators to enforce strict data integrity before database persistence.

### Validation Strategies & Layers

1. **Serializer-Level Validation:** Ensures incoming JSON payloads match expected field types, structural constraints, and uniqueness rules (such as cross-table email availability checks).
2. **Field-Specific Custom Validators:** Custom logic enforces strict formatting rules for complex data attributes.
3. **Database Constraints:** Relies on unique constraints (e.g., `unique_together` on `JobApplication`) to prevent duplicate records at the storage level.

### Validation Utilities & Rules

| Input / Field | Validation Rules & Sanitization Approach |
| --- | --- |
| **Email Address** | Regex format verification combined with DNS MX record checks to ensure the domain can receive emails. |
| **Phone Number** | Strict international format validation starting with `+` followed by numerical strings within a defined length range. |
| **Password** | Enforces minimum length constraints, rejects empty values, and applies default Django security rules. |
| **Experience / Education** | Requires a valid end date unless marked as current; validates academic years within a logical range ($1950\text{--}2100$). |
| **File Uploads (CV)** | Restricted strictly to PDF format with a maximum size limit of $5\text{ MB}$. |
| **File Uploads (Images)** | Accepted formats include JPG, JPEG, and PNG, capped at a maximum size of $2\text{ MB}$. |

---

## Error Handling and User Feedback

The backend communicates failures and successful operations through structured HTTP status codes and consistent error response formats.

* **Centralized Exception Handler:** Intercepts standard DRF and Django exceptions to return uniform error keys.
* **Validation Error Mapping:** Field-specific errors return descriptive keys mapped directly to form input fields.
* **Http Status Codes:** Standardized usage of status codes ($200\text{ OK}$, $201\text{ Created}$, $400\text{ Bad Request}$, $401\text{ Unauthorized}$, $403\text{ Forbidden}$, $404\text{ Not Found}$).

---

## Authentication & Authorization Flow

### Authentication Process

The backend processes authentication requests by inspecting role-specific records. Credentials are verified against passwords and account statuses (active for job seekers, admin-approved for companies). Upon success, a role-scoped token is issued.

### Token Management & Security Headers

* **Job Seekers:** Uses custom tokens stored in dedicated header structures (`JobSeekerAuthToken`).
* **Companies & Admins:** Uses dedicated authentication headers for session identification.
* **Token Expiration & Security:** Tokens are securely stored and validated per request cycle by custom authentication classes.

### Role-Based Access Control (RBAC)

Access control is enforced via custom permission classes:

* `IsJobSeekerAuthenticated`: Grants access exclusively to verified job seekers.
* `IsCompanyAuthenticated`: Restricts access to company dashboard and profile endpoints.
* `IsApprovedCompany`: Prevents unapproved companies from publishing or editing jobs.
* `IsAdminUser`: Restricts access exclusively to administrative accounts.

### Account Lifecycle & Verification Flow

* **Job Seekers:** Instant account generation and activation upon successful OTP code verification.
* **Companies:** Registration data is stored as a pending verification record. Following OTP confirmation, the account undergoes manual administrative review. Approval creates the official company entry; rejection purges the record and triggers a notification email.