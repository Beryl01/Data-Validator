// catches obviously broken emails - must have content, then @, then domain.tld
// [^\s@] means "any character except whitespace or @"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// these two are required for every contractor - everything else is situational
const REQUIRED_REGS: RegulationType[] = ["QualityStandards", "EnvironmentalPermit"];

// new Date() returns NaN for strings it can't parse (like "invalid-date")
// getTime() gives us that NaN as a number so we can check it
function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// Compares against today's date. Expired declarations don't fail validation -
// they show as a warning because the contractor might be mid-renewal.
function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

// Validates the dates on a single declaration. Returns an array of error strings
// so they can be collected alongside other errors on the parent contractor.
function checkDeclaration(dec: ComplianceDeclaration, i: number): string[] {
  const errors: string[] = [];

  if (!isValidDate(dec.submittedDate)) {
    errors.push(`Declaration ${i + 1}: submittedDate is not a real date`);
  }

  if (!isValidDate(dec.expiryDate)) {
    errors.push(`Declaration ${i + 1}: expiryDate is not a real date`);
  }

  return errors;
}

// The main validation function. Runs all checks on a contractor and returns
// a result object with hard errors and softer warnings separated out.
function validateContractor(contractor: Contractor): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field checks - .trim() so we don't accept whitespace-only values
  if (!contractor.id.trim()) errors.push("Contractor ID is required");
  if (!contractor.name.trim()) errors.push("Contractor name is required");
  if (!contractor.county.trim()) errors.push("County is required");
  if (!EMAIL_REGEX.test(contractor.email)) errors.push("Email address is not valid");

  if (contractor.declarations.length === 0) {
    errors.push("Contractor needs at least one compliance declaration");
  } else {
    contractor.declarations.forEach((dec, i) => {
      // Date format errors go into hard errors
      errors.push(...checkDeclaration(dec, i));

      // Expiry and non-compliant status are warnings - the data is technically
      // present and valid, it just needs follow-up
      if (isValidDate(dec.expiryDate) && isExpired(dec.expiryDate)) {
        warnings.push(`Declaration ${i + 1} (${dec.regulationType}) expired on ${dec.expiryDate}`);
      }

      if (dec.status === "non-compliant") {
        warnings.push(`Declaration ${i + 1} (${dec.regulationType}) is non-compliant - needs review`);
      }
    });

    // check that both required categories are covered
    // a contractor with HazardousSubstances but no QualityStandards still gets warned here
    const coveredRegs = contractor.declarations.map((d) => d.regulationType);
    for (const reg of REQUIRED_REGS) {
      if (!coveredRegs.includes(reg)) {
        warnings.push(`Missing required declaration: ${reg}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
