// Three sample Kenyan contractors - one clean pass, one with multiple errors,
// one that's valid but missing the required declarations.
// New contractors added through the form get pushed onto this array.
let contractors: Contractor[] = [
  {
    // CON-001: all fields valid, both required categories covered, EthicalSourcing as a bonus.
    // Should render as Passed.
    id: "CON-001",
    name: "Kirinyaga Construction Ltd",
    county: "Kirinyaga, Kenya",
    email: "compliance@kirinyagaconstruction.co.ke",
    isActive: true,
    declarations: [
      { regulationType: "QualityStandards", status: "compliant", submittedDate: "2024-06-01", expiryDate: "2026-06-01", notes: "Quality management screening completed" },
      { regulationType: "EnvironmentalPermit", status: "compliant", submittedDate: "2024-06-01", expiryDate: "2026-06-01" },
      { regulationType: "EthicalSourcing", status: "compliant", submittedDate: "2024-01-15", expiryDate: "2027-01-15" },
    ],
  },
  {
    // CON-002: intentionally broken - missing id and county, bad email, invalid date.
    // Tests that all error paths fire. Should render as Failed.
    id: "",
    name: "Nakuru Builders Co",
    county: "",
    email: "not-an-email",
    isActive: true,
    declarations: [
      { regulationType: "QualityStandards", status: "non-compliant", submittedDate: "invalid-date", expiryDate: "2026-01-01" },
    ],
  },
  {
    // CON-003: fields are valid but only has HazardousSubstances - missing both required categories.
    // Should render as Warnings.
    id: "CON-003",
    name: "Thika Engineering Ltd",
    county: "Kiambu, Kenya",
    email: "qa@thikaengineering.co.ke",
    isActive: true,
    declarations: [
      { regulationType: "HazardousSubstances", status: "pending", submittedDate: "2025-03-01", expiryDate: "2026-03-01" },
    ],
  },
];

// counter for generating unique IDs for form declaration rows
let decRowCounter = 0;

// fill color per compliance status - used in the declaration table inside each card
const STATUS_COLORS: Record<ComplianceStatus, string> = {
  compliant: "#15803d",
  "non-compliant": "#b91c1c",
  pending: "#a16207",
  unknown: "#6b7280",
};

// renders the summary bar - passed / warnings / failed counts across all contractors
function renderSummary(): void {
  const el = document.getElementById("summary");
  if (!el) return;

  let passed = 0;
  let warned = 0;
  let failed = 0;

  for (const c of contractors) {
    const r = validateContractor(c);
    if (!r.isValid) failed++;
    else if (r.warnings.length > 0) warned++;
    else passed++;
  }

  const total = contractors.length;
  el.innerHTML = `
    <span class="stat-passed">${passed} Passed</span>
    <span class="stat-sep">&middot;</span>
    <span class="stat-warned">${warned} Warnings</span>
    <span class="stat-sep">&middot;</span>
    <span class="stat-failed">${failed} Failed</span>
    <span class="stat-total">${total} contractor${total !== 1 ? "s" : ""} total</span>
  `;
}

// builds the declaration table shown inside each card -
// one row per declaration, showing category, status, and expiry date
function buildDeclarationTable(declarations: ComplianceDeclaration[]): string {
  if (declarations.length === 0) return "";

  const rows = declarations.map((dec) => {
    const color = STATUS_COLORS[dec.status];
    return `
      <tr>
        <td class="dec-type">${dec.regulationType}</td>
        <td class="dec-status" style="color:${color}">&#9679; ${dec.status}</td>
        <td class="dec-expiry">${dec.expiryDate}</td>
      </tr>
    `;
  }).join("");

  return `
    <div class="section dec-section">
      <p class="label">Declarations</p>
      <table class="dec-table">
        <thead>
          <tr><th>Category</th><th>Status</th><th>Expires</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// builds the HTML for a single contractor card.
// colour and badge come entirely from the validation result.
function buildCard(contractor: Contractor): string {
  const result = validateContractor(contractor);
  const displayName = contractor.name || "Unnamed Contractor";

  // meta line shows id and county only if they have values
  const metaParts = [contractor.id, contractor.county].filter((v) => v.trim() !== "");
  const meta = metaParts.length > 0
    ? `<span class="meta">${metaParts.join(" &middot; ")}</span>`
    : "";

  let badge: string;
  let cardClass: string;

  if (!result.isValid) {
    badge = "Failed";
    cardClass = "card invalid";
  } else if (result.warnings.length > 0) {
    badge = "Warnings";
    cardClass = "card warning";
  } else {
    badge = "Passed";
    cardClass = "card valid";
  }

  // only render each section if it has content - avoids empty blocks
  const errorsBlock = result.errors.length > 0
    ? `<div class="section errors">
         <p class="label">Errors</p>
         <ul>${result.errors.map((e) => `<li>${e}</li>`).join("")}</ul>
       </div>`
    : "";

  const warningsBlock = result.warnings.length > 0
    ? `<div class="section warnings">
         <p class="label">Warnings</p>
         <ul>${result.warnings.map((w) => `<li>${w}</li>`).join("")}</ul>
       </div>`
    : "";

  // all clear message only shows when both arrays are empty
  const allClear = result.errors.length === 0 && result.warnings.length === 0
    ? `<div class="section ok">All checks passed</div>`
    : "";

  return `
    <div class="${cardClass}">
      <div class="card-header">
        <div class="card-title">
          <span class="name">${displayName}</span>
          ${meta}
        </div>
        <span class="badge">${badge}</span>
      </div>
      ${buildDeclarationTable(contractor.declarations)}
      ${errorsBlock}
      ${warningsBlock}
      ${allClear}
    </div>
  `;
}

// adds a blank declaration row to the form
function addDeclarationRow(): void {
  const container = document.getElementById("dec-rows");
  if (!container) return;

  const id = decRowCounter++;
  const row = document.createElement("div");
  row.className = "dec-row";
  row.dataset["id"] = String(id);

  row.innerHTML = `
    <select name="regulationType" class="dec-field">
      <option value="QualityStandards">QualityStandards</option>
      <option value="EnvironmentalPermit">EnvironmentalPermit</option>
      <option value="HazardousSubstances">HazardousSubstances</option>
      <option value="EthicalSourcing">EthicalSourcing</option>
      <option value="OccupationalHealth">OccupationalHealth</option>
      <option value="WasteManagement">WasteManagement</option>
    </select>
    <select name="status" class="dec-field">
      <option value="compliant">Compliant</option>
      <option value="pending">Pending</option>
      <option value="non-compliant">Non-Compliant</option>
      <option value="unknown">Unknown</option>
    </select>
    <input type="date" name="submittedDate" class="dec-field" />
    <input type="date" name="expiryDate" class="dec-field" />
    <button type="button" class="btn-remove-dec" onclick="removeDecRow(${id})">&#10005;</button>
  `;

  container.appendChild(row);
}

// removes a declaration row from the form by its ID
function removeDecRow(id: number): void {
  const row = document.querySelector(`.dec-row[data-id="${id}"]`);
  if (row) row.remove();
}

// shows the add contractor panel and resets the form to a clean state
function openForm(): void {
  const panel = document.getElementById("form-panel");
  if (!panel) return;
  panel.hidden = false;

  // reset any values left from a previous submission
  const form = document.getElementById("contractor-form") as HTMLFormElement | null;
  if (form) form.reset();

  // clear old declaration rows and start with one fresh blank row
  const decRows = document.getElementById("dec-rows");
  if (decRows) decRows.innerHTML = "";
  addDeclarationRow();

  panel.scrollIntoView({ behavior: "smooth" });
}

// hides the add contractor panel
function closeForm(): void {
  const panel = document.getElementById("form-panel");
  if (panel) panel.hidden = true;
}

// reads all declaration rows out of the form DOM and returns them as an array
function collectDeclarations(): ComplianceDeclaration[] {
  const rows = document.querySelectorAll(".dec-row");
  const decs: ComplianceDeclaration[] = [];

  rows.forEach((row) => {
    // grab the value of a named input or select within this specific row
    const get = (name: string): string => {
      const el = row.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement | null;
      return el ? el.value : "";
    };

    decs.push({
      regulationType: get("regulationType") as RegulationType,
      status: get("status") as ComplianceStatus,
      submittedDate: get("submittedDate"),
      expiryDate: get("expiryDate"),
    });
  });

  return decs;
}

// handles form submit - builds the contractor object, adds it to the list, re-renders
function submitForm(e: Event): void {
  e.preventDefault();

  // read a text input by element id and strip whitespace
  const get = (id: string): string => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    return el ? el.value.trim() : "";
  };

  const contractor: Contractor = {
    id: get("f-id"),
    name: get("f-name"),
    county: get("f-county"),
    email: get("f-email"),
    isActive: true,
    declarations: collectDeclarations(),
  };

  contractors.push(contractor);
  closeForm();
  render();
}

// entry point - renders the summary bar and all contractor cards
function render(): void {
  const container = document.getElementById("results");
  if (!container) return;
  container.innerHTML = contractors.map(buildCard).join("");
  renderSummary();
}

// wire up the form submit handler, then do the first render on page load
const contractorForm = document.getElementById("contractor-form");
if (contractorForm) contractorForm.addEventListener("submit", submitForm);

render();
