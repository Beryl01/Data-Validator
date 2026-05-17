// Possible states a compliance declaration can be in.
// "unknown" covers cases where the contractor submitted something but hasn't
// confirmed the outcome yet - useful to track rather than treating as missing.
type ComplianceStatus = "compliant" | "non-compliant" | "pending" | "unknown";

// The Kenya compliance categories we support.
// QualityStandards and EnvironmentalPermit are required for every contractor.
// The rest are situational depending on the contractor's scope and operations.
type RegulationType =
  | "QualityStandards"
  | "EnvironmentalPermit"
  | "HazardousSubstances"
  | "EthicalSourcing"
  | "OccupationalHealth"
  | "WasteManagement";

// A single compliance declaration tied to one regulation category.
// Each contractor can have multiple of these - one per category they cover.
interface ComplianceDeclaration {
  regulationType: RegulationType;
  status: ComplianceStatus;
  submittedDate: string;  // ISO date string - validated at runtime
  expiryDate: string;     // ISO date string - flagged if already in the past
  notes?: string;         // optional, used for screening notes or extra context
}

// The contractor record we validate against.
// id and name are the minimum we need to identify who this is.
// declarations can be an empty array - that itself gets flagged as an error.
interface Contractor {
  id: string;
  name: string;
  county: string;
  email: string;
  declarations: ComplianceDeclaration[];
  isActive: boolean;
}

// What comes back from validateContractor().
// isValid is false if there are any hard errors (missing fields, bad dates).
// Warnings don't block isValid - they're things that need attention but aren't
// technically broken data.
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
