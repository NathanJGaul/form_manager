// import { LogIn } from "lucide-react";
import { Task } from "vitest";
import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";
import { DataTableColumn } from "../src/types/form";
// import { tr } from "@faker-js/faker";

// Helper data for JCC2 applications
const jcc2Applications = [
  { name: "A2IT", pages: "5, 6, 8, 12", pageCount: 4 },
  { name: "CAD", pages: "5, 6, 8, 12", pageCount: 4 },
  { name: "Codex", pages: "1, 5-8, 12", pageCount: 6 },
  { name: "Crucible", pages: "1, 5-8, 12", pageCount: 6 },
  { name: "Cyber 9-Line", pages: "5, 6, 8, 12", pageCount: 4 },
  { name: "Dispatch", pages: "5, 6, 8, 12, 27", pageCount: 5 },
  { name: "JCC2 Cyber-Ops", pages: "16-26, 28-31", pageCount: 15 },
  { name: "JCC2 Readiness", pages: "15, 19, 20, 23, 28, 29", pageCount: 6 },
  { name: "MADSS", pages: "2-6, 8, 10-12, 14", pageCount: 9 },
  { name: "Rally", pages: "2, 4-6, 8, 11, 12", pageCount: 7 },
  { name: "REDMAP", pages: "5, 6, 8, 12", pageCount: 4 },
  { name: "SigAct", pages: "2, 4, 5, 11, 12", pageCount: 5 },
  { name: "Threat Hub", pages: "1, 2, 5-8, 12", pageCount: 7 },
  { name: "Triage", pages: "5, 6, 8, 12", pageCount: 4 },
  { name: "Unity", pages: "1, 5-8, 12", pageCount: 6 },
];

// Applications within the TASC suite
const tascApps = [
  "A2IT",
  "CAD",
  "Codex",
  "Crucible",
  "Cyber 9-Line",
  "Dispatch",
  "Rally",
  "Redmap",
  "SigAct",
  "Threat Hub",
  "Triage",
  "Unity",
];

interface TaskQuestion {
  id: string;
  label: string;
  options: string[];
  followUpOption: string;
  followUpPrompt: string;
}

// Standard task questions
const standardTaskQuestions: TaskQuestion[] = [
  {
    id: "task_performance",
    label:
      "Task performance. The designated task was performed/completed in accordance with the relevant scenario.",
    options: ["Yes", "N/A", "No"],
    followUpOption: "No",
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_workaround",
    label:
      "Task workaround. The designated task was completed without the use of a workaround.",
    options: ["Yes", "N/A", "No"],
    followUpOption: "No",
    followUpPrompt:
      "Please concisely describe the workaround that was used and the operational impact:",
  },
  {
    id: "problem_occurrence",
    label:
      "Problem occurrence(s). The designated task was completed without the occurrence of system problems or issues.",
    options: ["Yes", "N/A", "No"],
    followUpOption: "No",
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_outcome",
    label: "Task outcome. The designated JCC2 task outcome was achieved.",
    options: ["Yes", "N/A", "No"],
    followUpOption: "No",
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
];

// MOP Section Configuration
interface ScenarioSection {
  id: string;
  title: string;
  task: string;
  apps: string[];
  columns: Array<{
    id: string;
    label: string;
    type?: "text" | "radio" | "select";
    options?: string[];
  }>;
  scenario?: string;
  appColumn: boolean;
  naable?: boolean;
  questions?: TaskQuestion[];
}

const scenarioSections: ScenarioSection[] = [
  {
    id: "MOP 1.1.1",
    title: "Integrate intelligence and operational data",
    task: "Data available to the end user is adequate for decision making and analysis.",
    apps: ["Unity", "Threat Hub", "Codex", "Crucible"],
    columns: [
      { id: "data_gathering_supported", label: "Data Gathering Supported" },
      {
        id: "impact_assessment_supported",
        label: "Impact Assessment Supported",
      },
      { id: "prioritization_supported", label: "Prioritization Supported" },
      { id: "data_sufficiency", label: "Data Sufficiency" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOS 1.1.2",
    title: "Tagging objects of interest, enabling correlation of objects",
    task: "Tagging objects of interest, enabling correlation of objects and creating categories.",
    apps: ["SigAct", "Rally", "MADSS", "Threat Hub"],
    columns: [
      { id: "tagging_execution", label: "Tagging Execution" },
      {
        id: "cross_application_correlation",
        label: "Cross-Application Correlation",
      },
      { id: "tag_consistency", label: "Tag Consistency" },
    ],
    scenario:
      "**Example Scenario:** Correlating Events Through Tagging\n\n1. **SigAct:** Tag incoming reports with a common tag to group related events or incidents for initial analysis and correlation.\n2. **Threat Hub:** Investigate and tag Indicators of Compromise (IOCs) with a relevant tag to link them to a broader threat or actor for threat intelligence and proactive defense.\n3. **Rally:** Create an incident and tag affected assets or users within the incident to track the impact of an event and manage the response workflow.\n4. **MADSS:** Tag affected mission essential assets to determine Mission Relevant Terrain impact of the event.",
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.1.3",
    title: "Identify the cause of an operational status change",
    task: "Identify the cause of an operational status change and the integration of operational status data from multiple sources.",
    apps: ["MADSS"],
    columns: [
      { id: "status_change_visibility", label: "Status Change Visibility" },
      {
        id: "detailed_information_access",
        label: "Detailed Information Access",
      },
      { id: "asi_incident_correlation", label: "ASI/Incident Correlation" },
      { id: "event_creation_capability", label: "Event Creation Capability" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.1.4",
    title: "Reporting that enable users to extract useful mission information",
    task: "Produce reports that enable users to extract useful mission information efficiently.",
    apps: ["MADSS", "Rally", "SigAct"],
    columns: [
      { id: "report_created", label: "Report Created" },
      { id: "useful", label: "Useful" },
      { id: "accurate", label: "Accurate" },
      { id: "exportable", label: "Exportable" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.1.5",
    title: "Information sharing between offensive, defensive, and DODIN forces",
    task: "Data is shared between offensive, defensive, and DODIN forces for situational awareness and unity of effort.",
    apps: ["MADSS", ...tascApps],
    columns: [
      { id: "data_origin", label: "Data Origin", type: "text" },
      { id: "data_destination", label: "Data Destination", type: "text" },
      { id: "reason", label: "Reason", type: "text" },
      { id: "successful", label: "Successful" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.2.1",
    title:
      "Threat hunting activities using signatures and correlation of events",
    task: "Threat hunting activities using signatures and correlation of events.",
    apps: tascApps,
    columns: [
      { id: "detection_method", label: "Detection Method", type: "text" },
      {
        id: "source_of_information",
        label: "Source of Information",
        type: "text",
      },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 1.2.2",
    title:
      "Decide what actions to take in response to detected malicious activity",
    task: "Decide what actions to take in response to detected malicious activity.",
    apps: ["Crucible", "Codex", "Threat Hub", "Unity"],
    columns: [
      { id: "threats_listed", label: "Threats Listed" },
      {
        id: "data_available_for_assessment",
        label: "Data available for assessment",
      },
      {
        id: "data_available_for_prioritization",
        label: "Data available for prioritization",
      },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.2.3",
    title: "Extract useful information through report generation",
    task: "Extract useful information through report generation.",
    apps: tascApps,
    columns: [
      { id: "report_created", label: "Report Created" },
      { id: "useful", label: "Useful" },
      { id: "accurate", label: "Accurate" },
      { id: "exportable", label: "Exportable" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOS 1.3.1",
    title:
      "Gain situational understanding of the area of responsibility through the information displayed in the COP",
    task: "Gain situational understanding of the area of responsibility through the information displayed in the COP.",
    apps: jcc2Applications.map((app) => app.name),
    columns: [
      {
        id: "data_provides_situational_awareness",
        label: "Data available provides situational awareness",
      },
      { id: "data_is_accurate", label: "Data is accurate" },
      { id: "data_is_relevant", label: "Data is relevant" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.3.2",
    title:
      "Dependency map to find outage, cause of outage, and responsible organization for asset",
    task: "Dependency map to find outage, cause of outage, and responsible organization for asset.",
    apps: ["MADSS"],
    columns: [
      { id: "outage_identified", label: "Outage Identified" },
      { id: "cause_of_outage_identified", label: "Cause of Outage Identified" },
      {
        id: "responsible_organization_identified",
        label: "Responsible Organization Identified",
      },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 1.3.3",
    title: "Event creation process",
    task: "Event creation process.",
    apps: ["SigAct", "Rally", "MADSS"],
    columns: [
      { id: "event_creation_successful", label: "Event Creation Successful" },
      {
        id: "provides_enough_data_to_be_actionable",
        label: "Provides enough data to be actionable",
      },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.3.4",
    title: "Create an alert to maintain situational awareness a mission",
    task: "Create an alert to maintain situational awareness a mission.",
    apps: ["SIGACT", "MADSS", "TASC"],
    columns: [
      { id: "alerts_created", label: "Alerts created" },
      { id: "type_of_alert", label: "Type of alert", type: "text" },
      { id: "alert_witnessed", label: "Alert witnessed" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 1.3.5",
    title:
      "Data flow across different security levels to support information exchange",
    task: "Data flow across different security levels to support information exchange.",
    apps: jcc2Applications.map((app) => app.name),
    columns: [
      {
        id: "record",
        label: "Record",
        type: "text",
      },
      {
        id: "environments_record_viewed",
        label: "Environments record viewed",
        type: "select",
        options: ["NIPR", "SIPR", "JWICS"],
      },
      {
        id: "completeness_of_record",
        label: "Completeness of Record for each environment",
        type: "text",
      },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 1.3.6",
    title:
      "Extraction of useful information through its reporting capabilities",
    task: "Extraction of useful information through its reporting capabilities.",
    apps: ["MADSS"],
    columns: [
      { id: "create_reports", label: "Create Reports" },
      { id: "useful", label: "Useful" },
      { id: "accurate", label: "Accurate" },
      { id: "exportable", label: "Exportable" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.1",
    title: "Perform cyber force assessments",
    task: "Perform cyber force assessments.",
    apps: ["JCC2 Readiness"],
    columns: [],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.2",
    title: "Create and manage target lists",
    task: "Create and manage target lists.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "list_created", label: "List created" },
      { id: "list_can_be_exported", label: "List can be exported" },
      { id: "annotated", label: "Annotated" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.3",
    title: "Number of users able to simultaneously edit a mission",
    task: "Number of users able to simultaneously edit a mission.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "mission", label: "Mission", type: "text" },
      { id: "number_of_users", label: "Number of users", type: "text" },
      { id: "edit_successful", label: "Edit Successful" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.4",
    title: "Number of users able to simultaneously discuss a mission",
    task: "Number of users able to simultaneously discuss a mission.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "mission", label: "Mission", type: "text" },
      { id: "number_of_users", label: "Number of users", type: "text" },
      { id: "edit_successful", label: "Edit successful" },
      {
        id: "method_used_for_discussion",
        label: "Method Used for discussion",
        type: "text",
      },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.5",
    title:
      "Percentage of times Blue Force information is integrated and viewable",
    task: "Percentage of times Blue Force information is integrated and viewable.",
    apps: ["JCC2 Readiness", "JCC2 Cyber-Ops"],
    columns: [
      { id: "data_viewed_successfully", label: "Data viewed Successfully" },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 2.1.6",
    title:
      "Percent of time Blue Force data is imported & exported with accuracy",
    task: "Percent of time Blue Force data is imported & exported with accuracy.",
    apps: ["JCC2 Readiness", "JCC2 Cyber-Ops"],
    columns: [
      { id: "data_can_be_exported", label: "Data can be exported" },
      { id: "export_is_accurate", label: "Export is Accurate" },
      { id: "data_can_be_imported", label: "Data can be imported" },
      { id: "import_is_accurate", label: "Import is accurate" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 2.1.7",
    title:
      "Prevent cyber mission forces from being assigned to different missions that would conflict with one another",
    task: "Prevent cyber mission forces from being assigned to different missions that would conflict with one another.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "force_displayed", label: "Force displayed" },
      { id: "conflict_attempted", label: "Conflict Attempted" },
      { id: "deconflict_successful", label: "Deconflict successful" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.8",
    title: "Number of authorized users able to access a mission",
    task: "Number of authorized users able to access a mission.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "able_to_access_mission", label: "Able to access Mission" },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.1.9",
    title: "Joint forces to perform collaborative planning",
    task: "Joint forces to perform collaborative planning.",
    apps: ["JCC2 Cyber-Ops", "JCC2 Readiness"],
    columns: [
      { id: "joint_planning_enabled", label: "Joint Planning Enabled" },
      { id: "joint_execution_enabled", label: "Joint Execution Enabled" },
      {
        id: "joint_force_availability_enabled",
        label: "Joint Force Availability Enabled",
      },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 2.1.10",
    title: "Number of times creating a mission fails",
    task: "Number of times creating a mission fails.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "type_of_mission", label: "Type of Mission", type: "text" },
      { id: "created_successfully", label: "Created Successfully" },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.2.1",
    title: "Number of times creating an order fails",
    task: "Number of times creating an order fails.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "order_creation_successful", label: "Order Creation Successful" },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.2.2",
    title: "Number of times displaying a mission fails",
    task: "Number of times displaying a mission fails.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "order_display_successful", label: "Order Display Successful" },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.3.1",
    title: "System enables mission change order generation",
    task: "System enables mission change order generation.",
    apps: ["Dispatch"],
    columns: [
      { id: "existing_order_cancelled", label: "Existing Order Cancelled" },
      {
        id: "previous_information_saved_and_edited",
        label:
          "Previous Information Saved and edited to be saved into new order",
      },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOP 2.3.2",
    title:
      "The system adequately enables the user to judge the availability and status of units involved in a mission",
    task: "The system adequately enables the user to judge the availability and status of units involved in a mission.",
    apps: ["JCC2 Readiness", "JCC2 Cyber-Ops"],
    columns: [],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOP 2.3.3",
    title: "Produce reports that are relevant to battle management",
    task: "Produce reports that are relevant to battle management.",
    apps: ["JCC2 Readiness", "JCC2 Cyber-Ops"],
    columns: [
      { id: "create_reports", label: "Create Reports" },
      { id: "useful", label: "Useful" },
      { id: "accurate", label: "Accurate" },
      { id: "exportable", label: "Exportable" },
    ],
    appColumn: true,
    naable: true,
  },
  {
    id: "MOP 2.3.4",
    title: "The number of missions able to be tracked at once",
    task: "The number of missions able to be tracked at once.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      {
        id: "number_of_missions_tracked_simultaneously",
        label: "Number of missions able to be tracked simultaneously",
        type: "text",
      },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOP 2.4.1",
    title:
      "The system adequately supports mission progress analysis by providing target and mission data to the user",
    task: "The system adequately supports mission progress analysis by providing target and mission data to the user.",
    apps: ["JCC2 Cyber-Ops"],
    columns: [
      { id: "type_of_mission", label: "Type of mission", type: "text" },
      {
        id: "able_to_measure_progress_of_mission",
        label: "Able to measure progress of mission",
      },
      {
        id: "target_and_mission_data_provided",
        label: "Target and Mission Data provided",
      },
      { id: "notes", label: "Notes", type: "text" },
    ],
    appColumn: false,
    naable: true,
  },
  {
    id: "MOS 3.1.1",
    title: "Operational Reliability",
    task: "Operational Reliability",
    apps: ["All Applications"],
    columns: [
      { id: "application_system", label: "Application / System", type: "text" },
      { id: "reason_for_outage", label: "Reason for Outage", type: "text" },
      {
        id: "duration_time_to_restore",
        label: "Duration / Time to restore functionality",
        type: "text",
      },
    ],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOS 3.1.2",
    title: "Operational Availability",
    task: "Operational Availability",
    apps: ["All Applications"],
    columns: [
      { id: "application_system", label: "Application / System", type: "text" },
      { id: "reason_for_outage", label: "Reason for Outage", type: "text" },
      {
        id: "duration_time_to_restore",
        label: "Duration / Time to restore functionality",
        type: "text",
      },
    ],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOS 3.2.1",
    title: "User rating of JCC2 training",
    task: "User rating of JCC2 training",
    apps: ["All Applications"],
    columns: [],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOS 3.2.2",
    title: "User rating of JCC2 documentation",
    task: "User rating of JCC2 documentation",
    apps: ["All Applications"],
    columns: [],
    appColumn: false,
    naable: false,
  },
  {
    id: "MOP 3.2.3",
    title: "User rating of JCC2 support (help desk)",
    task: "User rating of JCC2 support (help desk)",
    apps: ["All Applications"],
    columns: [
      { id: "application", label: "Application", type: "text" },
      { id: "details_of_problem", label: "Details of Problem", type: "text" },
      { id: "location", label: "Location", type: "text" },
      { id: "time_reported", label: "Time reported", type: "text" },
      { id: "time_resolved", label: "Time resolved", type: "text" },
    ],
    appColumn: false,
    naable: false,
  },
];

// MOS Section Configuration (placeholder for future implementation)
// interface MOSSection {
//   id: string;
//   title: string;
//   description: string;
//   metrics: Array<{
//     id: string;
//     label: string;
//     type: "number" | "percentage" | "time" | "select";
//     unit?: string;
//     options?: string[];
//   }>;
// }

// Helper function to convert strings to an id
function toId(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/ /g, "_");
}

// Helper function to convert app string to app experience id
function appExpId(app: string) {
  return `exp_app_${toId(app)}`;
}

// Helper function to format column labels
function formatColumnLabel(columnId: string): string {
  return columnId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Create default row for datatable
function createDefaultRow(columns: DataTableColumn[]): Record<string, any> {
  const row: Record<string, any> = {};
  columns.forEach((col) => {
    if (col.autoIndex) {
      row[col.id] = "1";
    } else if (col.type === "checkbox") {
      row[col.id] = [];
    } else {
      row[col.id] = "";
    }
  });
  return row;
}

// Helper function to create standard task questions
function addTaskQuestions(
  builder: TemplateBuilder,
  sectionId: string,
  questions: TaskQuestion[]
) {
  questions.forEach((question) => {
    builder
      .field("radio", question.label)
      .id(`${question.id}`)
      .options(question.options)
      .layout("horizontal")
      .required()
      .end();

    // Add conditional follow-up
    builder
      .field("textarea", question.followUpPrompt)
      .id(`${question.id}_details`)
      .required()
      .conditional(`${sectionId}.${question.id}`, "equals", [
        question.followUpOption,
      ])
      .end();
  });

  // Add additional observations field
  builder
    .field(
      "textarea",
      "Additional observations. Provide any additional observations (positive or negative) regarding performance/completion of the designated task and the task outcome."
    )
    .id(`additional_observations`)
    .end();
}

// Create observation table for MOP sections
function createObservationTable(
  builder: TemplateBuilder,
  scenarioSection: ScenarioSection
) {
  const sectionIdSafe = `${toId(scenarioSection.id)}`;

  // Build column definitions
  const columns: DataTableColumn[] = [
    {
      id: "run",
      label: "Run #",
      type: "number",
      required: true,
      validation: { min: 1 },
      autoIndex: true,
    },
  ];

  if (scenarioSection.appColumn) {
    columns.push({
      id: "application_used",
      label: "Application Used",
      type: "select",
      required: true,
      options: scenarioSection.apps,
    });
  }

  // Add dynamic columns based on MOP requirements
  scenarioSection.columns.forEach((col) => {
    if (col.type === "text") {
      columns.push({
        id: col.id,
        label: col.label,
        type: "text",
        required: true,
      });
    } else {
      columns.push({
        id: col.id,
        label: col.label,
        type: "radio",
        required: true,
        options: col.options || ["Yes", "No", "NA"],
      });
    }
  });

  builder
    .field("datatable", `${scenarioSection.id} Observation Runs`)
    .id(`${sectionIdSafe}_runs`)
    .columns(columns)
    .minRows(1)
    .maxRows(10)
    .defaultValue({
      columns: [],
      rows: [createDefaultRow(columns)],
    })
    .end();
}

// Create a complete MOP section
function createScenarioSection(
  builder: TemplateBuilder,
  scenarioSection: ScenarioSection
) {
  const sectionIdSafe = `${toId(scenarioSection.id)}`;
  const appConditions = scenarioSection.apps.map((app: string) => ({
    dependsOn: `applications_used.${appExpId(app)}`,
    operator: "equals",
    values: ["Yes"],
  }));
  builder
    .section(`${scenarioSection.id}: ${scenarioSection.title}`)
    .id(sectionIdSafe)
    .naable(scenarioSection.naable)
    .conditionalCompound({
      logic: "or",
      conditions: appConditions,
    });

  // Add task description
  builder.text(`JCC2 task: ${scenarioSection.task}`);

  // Add applicable apps
  builder.text(`Applicable application(s): ${scenarioSection.apps.join(", ")}`);

  // Add scenario if provided
  if (scenarioSection.scenario) {
    builder.text(`JCC2 task: ${scenarioSection.scenario}`);
  }

  // Create observation table
  if (scenarioSection.columns.length > 0) {
    createObservationTable(builder, scenarioSection);
  }

  // Add standard task questions
  if (scenarioSection.questions !== undefined) {
    addTaskQuestions(builder, sectionIdSafe, scenarioSection.questions);
  } else {
    addTaskQuestions(builder, sectionIdSafe, standardTaskQuestions);
  }
}

// Generate all MOP sections using forEach
function generateAllScenarioSections(builder: TemplateBuilder) {
  scenarioSections.forEach((scenarioSection) => {
    createScenarioSection(builder, scenarioSection);
  });
}

/**
 * Programmatic template for the JCC2 Data Collection and Interview Form v4
 *
 * Changes from v3:
 * - Complete implementation of ALL MOP sections (1.1.1 through 2.4.1)
 * - Uses advanced programmatic features (forEach, control flow)
 * - Comprehensive data structure for all sections
 * - Reusable helper functions to reduce code duplication
 * - Optimized for maintenance and extensibility
 */
export class JCC2DataCollectionFormV4 {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("JCC2 Data Collection and Interview Form v4")
      .description(
        "A comprehensive data collection form for JCC2 system testing and evaluation - Version 4 with complete MOP implementation and advanced programmatic features"
      )
      .author("Nathan Gaul")
      .version("4.0.0")
      .tags(
        "jcc2",
        "data-collection",
        "interview",
        "military",
        "testing",
        "v4",
        "complete",
        "programmatic"
      );

    // Set template-wide variables
    builder.variables({
      scenarioSections,
      jcc2Applications,
      testDate: new Date().toISOString().split("T")[0],
    });

    // Header Section - Test Participant Information
    builder
      .section("Basic Info")
      .id("basic_info")
      .field("text", "Test Participant Rank/Full Name")
      .id("participant_name")
      .required()
      .end()
      .field("text", "Test Participant Organization/Office Symbol")
      .id("participant_org")
      .required()
      .end()
      .field("date", "Event/Date/Time")
      .id("date")
      .required()
      // .defaultValue("{{variables.testDate}}")
      .end()
      .field("select", "Test Team Member")
      .id("tester_name")
      .options([
        "Andres Lopez",
        "Michelle Crawford",
        "Walter Roof",
        "Sonia Venegas",
        "Lauren Bobee",
        "Nathan Gaul",
        "Other",
      ])
      .required()
      .end()
      .field("text", "Other Test Team Member")
      .id("tester_name_other")
      .conditional("tester_name", "equals", ["Other"])
      .end();

    // Applications Used Section
    builder
      .section("Applications Used by Test Participant")
      .id("applications_used");

    // Generate application checkboxes using forEach
    jcc2Applications.forEach((app) => {
      builder
        .field("radio", `${app.name}`)
        .id(appExpId(app.name))
        .multiple()
        .options(["Yes", "No"])
        .defaultValue("No")
        .layout("horizontal")
        .grouping(true, "applications_table", "JCC2 Applications Experience")
        .end();
    });

    // Generate all MOP sections
    generateAllScenarioSections(builder);

    // MOS Sections placeholder
    // builder
    //   .section("MOS Sections")
    //   .id("mos_sections")
    //   .text(
    //     "**Note:** MOS (Measures of Success) sections would be implemented here following similar patterns as MOP sections. " +
    //       "These would include system performance metrics, availability metrics, and effectiveness measures."
    //   );

    // Test Participant Interview Section
    builder
      .section("Test Participant Interview Section")
      .id("interview_section");

    // builder
    //   .field("text", "")
    //   .id("interview_intro")
    //   .withContent(
    //     "**Interview Guidelines:** Please answer the following questions based on your experience with the JCC2 system during testing and operational use."
    //   )
    //   .end();
    builder.text(
      "**Interview Guidelines:** Please answer the following questions based on your experience with the JCC2 system during testing and operational use."
    );

    // Interview questions with conditional follow-ups
    const interviewQuestions = [
      {
        id: "interoperability",
        question:
          "Interoperability. Do you experience issues within the application and between external data sources, legacy software packages, and other JCC2 applications?",
        followUp: "Interoperability - Problems or issues",
      },
      {
        id: "info_sharing",
        question:
          "Information Sharing. Do you experience issues sharing information up the chain of command or with other teams within the JCC2?",
        followUp: "Information Sharing - Problems or issues",
      },
      {
        id: "performance",
        question:
          "Performance. Do you experience slowdowns during information exchange?",
        followUp: "Performance - Problems or issues",
      },
      {
        id: "access",
        question:
          "Access. Do you experience permissions issues when access any JCC2 database or App?",
        followUp: "Access - Problems or issues",
      },
    ];

    // Generate interview questions using forEach
    interviewQuestions.forEach((item) => {
      builder
        .field("radio", item.question)
        .id(`interview_${item.id}`)
        .options(["Yes", "N/A", "No"])
        .layout("horizontal")
        .required()
        .end()
        .field("textarea", item.followUp)
        .id(`interview_${item.id}_details`)
        .required()
        .conditional(`interview_${item.id}`, "equals", ["Yes"])
        .end();
    });

    // Additional interview questions
    builder
      .field(
        "textarea",
        "Do you find that workarounds are necessary to complete your job duties while using JCC2 applications?"
      )
      .id("interview_workarounds")
      .end()
      .field(
        "checkbox",
        "If workarounds are used, what would be the most likely reason?"
      )
      .id("interview_workaround_reasons")
      .multiple()
      .options([
        "Missing capabilities",
        "Partially functional capabilities",
        "External application works better",
        "Other",
      ])
      .end()
      .field("text", "Other workaround reason (Explain)")
      .id("interview_workaround_other")
      .conditional("interview_workaround_reasons", "contains", ["Other"])
      .end()
      .field(
        "textarea",
        "Improvements. Please list any improvements that should to be made to the App."
      )
      .id("interview_improvements")
      .end()
      .field(
        "textarea",
        "Critical Issues. Please list any critical issues you feel must be resolved to increase the App's effectiveness."
      )
      .id("interview_critical_issues")
      .end()
      .field(
        "textarea",
        "Shout Outs. Please list any features you encountered that greatly improved the speed, quality, or effectiveness of your duties."
      )
      .id("interview_shout_outs")
      .end()
      .field(
        "textarea",
        "Final Thoughts. Are there any additional items you would like to address that have not been documented yet?"
      )
      .id("interview_final_thoughts")
      .end();

    // Add closing paragraph
    builder
      .field("text", "")
      .id("closing_statement")
      .withContent(
        "**Thank you for participating in the JCC2 system evaluation. Your feedback is essential for improving the system's effectiveness and usability.**"
      )
      .end();

    // Configure form behavior
    builder
      .schema("strict")
      .requiredFields(
        "participant_name",
        "participant_org",
        "date",
        "tester_name"
      );

    return builder.build();
  }
}
