import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";
import { DataTableColumn } from "../src/types/form";

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

// Standard task questions
const standardTaskQuestions = [
  {
    id: "task_performance",
    label: "Task performance. The designated task was performed/completed in accordance with the relevant scenario.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt: "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_workaround",
    label: "Task workaround. The designated task was completed without the use of a workaround.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt: "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "problem_occurrence",
    label: "Problem occurrence(s). The designated task was completed without the occurrence of system problems or issues.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt: "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_outcome",
    label: "Task outcome. The designated JCC2 task outcome was achieved.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt: "Please concisely describe the workaround that was used and the operational impact:",
  },
];

// MOP Section Configuration
interface MOPSection {
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
  includeAlignmentCheckbox?: boolean;
}

// Complete MOP sections data structure
const mopSections: MOPSection[] = [
  // MOP 1.1.x - Integration and Data Management
  {
    id: "1.1.1",
    title: "Integrate intelligence and operational data",
    task: "Data available to the end user is adequate for decision making and analysis.",
    apps: jcc2Applications.map(app => app.name),
    columns: [
      { id: "data_gathering_supported", label: "Data Gathering Supported" },
      { id: "impact_assessment_supported", label: "Impact Assessment Supported" },
      { id: "prioritization_supported", label: "Prioritization Supported" },
      { id: "data_sufficiency", label: "Data Sufficiency" }
    ],
    includeAlignmentCheckbox: false
  },
  {
    id: "1.1.2",
    title: "Tagging objects of interest, enabling correlation of objects",
    task: "Tagging objects of interest, enabling correlation of objects and creating categories.",
    apps: ["SigAct", "Rally", "MADSS", "Threat Hub"],
    columns: [
      { id: "tagging_execution", label: "Tagging Execution" },
      { id: "cross_application_correlation", label: "Cross-Application Correlation" },
      { id: "tag_consistency", label: "Tag Consistency" }
    ],
    scenario: "**Example Scenario:** Correlating Events Through Tagging\n\n1. **SigAct:** Tag incoming reports with a common tag to group related events or incidents for initial analysis and correlation.\n2. **Threat Hub:** Investigate and tag Indicators of Compromise (IOCs) with a relevant tag to link them to a broader threat or actor for threat intelligence and proactive defense.\n3. **Rally:** Create an incident and tag affected assets or users within the incident to track the impact of an event and manage the response workflow.\n4. **MADSS:** Tag affected mission essential assets to determine Mission Relevant Terrain impact of the event.",
    includeAlignmentCheckbox: true
  },
  {
    id: "1.1.3",
    title: "Identify the cause of an operational status change",
    task: "Identify the cause of an operational status change and the integration of operational status data from multiple sources.",
    apps: ["MADSS"],
    columns: [
      { id: "status_change_visibility", label: "Status Change Visibility" },
      { id: "detailed_information_access", label: "Detailed Information Access" },
      { id: "asi_incident_correlation", label: "ASI/Incident Correlation" },
      { id: "event_creation_capability", label: "Event Creation Capability" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "1.1.4",
    title: "Reporting that enable users to extract useful mission information",
    task: "Produce reports that enable users to extract useful mission information efficiently.",
    apps: ["Rally", "SigAct"],
    columns: [
      { id: "report_created", label: "Report Created" },
      { id: "useful", label: "Useful" },
      { id: "accurate", label: "Accurate" },
      { id: "exportable", label: "Exportable" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "1.1.5",
    title: "Information sharing between offensive, defensive, and DODIN forces",
    task: "Data is shared between offensive, defensive, and DODIN forces for situational awareness and unity of effort.",
    apps: ["A2IT", "CAD", "Codex", "Crucible", "Cyber 9-Line", "Dispatch", "Redmap", "Threat Hub", "Triage", "Unity"],
    columns: [
      { id: "data_origin", label: "Data Origin", type: "text" },
      { id: "data_destination", label: "Data Destination", type: "text" },
      { id: "reason", label: "Reason", type: "text" },
      { id: "successful", label: "Successful" }
    ],
    includeAlignmentCheckbox: true
  },
  // MOP 1.2.x - Mission Planning
  {
    id: "1.2.1",
    title: "Develop synchronized cyberspace operations plans",
    task: "Develop synchronized cyberspace operations plans that support the overall mission objectives.",
    apps: ["JCC2 Cyber-Ops", "Unity", "Rally"],
    columns: [
      { id: "plan_development", label: "Plan Development" },
      { id: "synchronization_achieved", label: "Synchronization Achieved" },
      { id: "mission_alignment", label: "Mission Alignment" },
      { id: "stakeholder_coordination", label: "Stakeholder Coordination" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "1.2.2",
    title: "Resource allocation and prioritization",
    task: "Efficiently allocate and prioritize cyberspace resources based on mission requirements.",
    apps: ["MADSS", "JCC2 Readiness", "Rally"],
    columns: [
      { id: "resource_identification", label: "Resource Identification" },
      { id: "priority_assignment", label: "Priority Assignment" },
      { id: "allocation_efficiency", label: "Allocation Efficiency" },
      { id: "tracking_capability", label: "Tracking Capability" }
    ],
    includeAlignmentCheckbox: true
  },
  // MOP 2.x - Operational Execution
  {
    id: "2.1.1",
    title: "Monitor cyberspace operations in real-time",
    task: "Monitor and track cyberspace operations execution in real-time for situational awareness.",
    apps: ["SigAct", "Rally", "Unity", "Dispatch"],
    columns: [
      { id: "real_time_monitoring", label: "Real-time Monitoring" },
      { id: "alert_notification", label: "Alert Notification" },
      { id: "status_updates", label: "Status Updates" },
      { id: "dashboard_effectiveness", label: "Dashboard Effectiveness" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "2.2.1",
    title: "Incident response and management",
    task: "Coordinate and manage incident response activities across cyberspace forces.",
    apps: ["Rally", "Dispatch", "Cyber 9-Line", "Triage"],
    columns: [
      { id: "incident_detection", label: "Incident Detection" },
      { id: "response_coordination", label: "Response Coordination" },
      { id: "escalation_procedures", label: "Escalation Procedures" },
      { id: "resolution_tracking", label: "Resolution Tracking" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "2.3.1",
    title: "Threat analysis and intelligence integration",
    task: "Analyze threats and integrate intelligence across multiple sources for comprehensive threat picture.",
    apps: ["Threat Hub", "Codex", "Crucible", "A2IT"],
    columns: [
      { id: "threat_identification", label: "Threat Identification" },
      { id: "intelligence_fusion", label: "Intelligence Fusion" },
      { id: "analysis_quality", label: "Analysis Quality" },
      { id: "dissemination_speed", label: "Dissemination Speed" }
    ],
    includeAlignmentCheckbox: true
  },
  {
    id: "2.4.1",
    title: "Battle damage assessment and reporting",
    task: "Assess and report battle damage from cyberspace operations for mission effectiveness evaluation.",
    apps: ["MADSS", "Rally", "SigAct", "Unity"],
    columns: [
      { id: "damage_assessment", label: "Damage Assessment" },
      { id: "impact_analysis", label: "Impact Analysis" },
      { id: "report_generation", label: "Report Generation" },
      { id: "recommendation_quality", label: "Recommendation Quality" }
    ],
    includeAlignmentCheckbox: true
  }
];

// MOS Section Configuration (placeholder for future implementation)
interface MOSSection {
  id: string;
  title: string;
  description: string;
  metrics: Array<{
    id: string;
    label: string;
    type: "number" | "percentage" | "time" | "select";
    unit?: string;
    options?: string[];
  }>;
}

// Helper function to convert strings to an id
function toId(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/ /g, "_");
}

// Helper function to format column labels
function formatColumnLabel(columnId: string): string {
  return columnId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Create default row for datatable
function createDefaultRow(columns: DataTableColumn[]): Record<string, any> {
  const row: Record<string, any> = {};
  columns.forEach(col => {
    if (col.autoIndex) {
      row[col.id] = "1";
    } else if (col.type === 'checkbox') {
      row[col.id] = [];
    } else {
      row[col.id] = "";
    }
  });
  return row;
}

// Helper function to create standard task questions
function addStandardTaskQuestions(builder: TemplateBuilder, sectionId: string) {
  standardTaskQuestions.forEach((question) => {
    builder
      .field("radio", question.label)
      .id(`${sectionId}_${question.id}`)
      .options(question.options)
      .layout("horizontal")
      .required()
      .end();

    // Add conditional follow-up for "No" answers
    if (question.options.includes("No")) {
      builder
        .field("textarea", question.followUpPrompt)
        .id(`${sectionId}_${question.id}_details`)
        .required()
        .conditional(`${sectionId}_${question.id}`, "equals", ["No"])
        .end();
    }
  });

  // Add additional observations field
  builder
    .field("textarea", "Additional observations. Provide any additional observations (positive or negative) regarding performance/completion of the designated task and the task outcome.")
    .id(`${sectionId}_additional_observations`)
    .end();
}

// Create observation table for MOP sections
function createObservationTable(builder: TemplateBuilder, mopSection: MOPSection) {
  const sectionIdSafe = `mop_${mopSection.id.replace(/\./g, '_')}`;
  
  // Build column definitions
  const columns: DataTableColumn[] = [
    {
      id: "run",
      label: "Run #",
      type: "number",
      required: true,
      validation: { min: 1 },
      autoIndex: true
    },
    {
      id: "application_used",
      label: "Application Used",
      type: "select",
      required: true,
      options: mopSection.apps
    }
  ];
  
  // Add dynamic columns based on MOP requirements
  mopSection.columns.forEach(col => {
    if (col.type === "text") {
      columns.push({
        id: col.id,
        label: col.label,
        type: "text",
        required: true
      });
    } else {
      columns.push({
        id: col.id,
        label: col.label,
        type: "radio",
        required: true,
        options: col.options || ["Yes", "No", "NA"]
      });
    }
  });
  
  builder
    .field("datatable", `MOP ${mopSection.id} Observation Runs`)
    .id(`${sectionIdSafe}_runs`)
    .columns(columns)
    .minRows(1)
    .maxRows(10)
    .defaultValue({
      columns: [],
      rows: [createDefaultRow(columns)]
    })
    .end();
}

// Create a complete MOP section
function createMOPSection(builder: TemplateBuilder, mopSection: MOPSection) {
  const sectionIdSafe = `mop_${mopSection.id.replace(/\./g, '_')}`;
  
  builder
    .section(`MOP ${mopSection.id}: ${mopSection.title}`)
    .id(sectionIdSafe)
    .naable();
    
  // Add alignment checkbox if specified
  if (mopSection.includeAlignmentCheckbox) {
    builder
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id(`${sectionIdSafe}_aligns`)
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();
  }
    
  // Add task description
  builder
    .field("text", "")
    .id(`${sectionIdSafe}_task_desc`)
    .withContent(`**JCC2 task:** ${mopSection.task}`)
    .end();
    
  // Add applicable apps
  builder
    .field("text", "")
    .id(`${sectionIdSafe}_apps`)
    .withContent(`**Applicable application(s):** ${mopSection.apps.join(", ")}`)
    .end();
  
  // Add scenario if provided
  if (mopSection.scenario) {
    builder
      .field("text", "")
      .id(`${sectionIdSafe}_scenario`)
      .withContent(mopSection.scenario)
      .end();
  }
  
  // Create observation table
  createObservationTable(builder, mopSection);
  
  // Add standard task questions
  addStandardTaskQuestions(builder, sectionIdSafe);
}

// Generate all MOP sections using forEach
function generateAllMOPSections(builder: TemplateBuilder) {
  mopSections.forEach((mopSection) => {
    createMOPSection(builder, mopSection);
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
      mopSections,
      jcc2Applications,
      testDate: new Date().toISOString().split('T')[0]
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
      .defaultValue("{{variables.testDate}}")
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
      const appId = toId(app.name);
      builder
        .field("radio", `${app.name}`)
        .id(`exp_app_${appId}`)
        .multiple()
        .options(["Yes", "No"])
        .defaultValue("No")
        .layout("horizontal")
        .grouping(true, "applications_table", "JCC2 Applications Experience")
        .end();
    });

    // Generate all MOP sections
    generateAllMOPSections(builder);

    // MOS Sections placeholder
    builder
      .section("MOS Sections")
      .id("mos_sections")
      .text(
        "**Note:** MOS (Measures of Success) sections would be implemented here following similar patterns as MOP sections. " +
        "These would include system performance metrics, availability metrics, and effectiveness measures."
      );

    // Test Participant Interview Section
    builder
      .section("Test Participant Interview Section")
      .id("interview_section");

    builder
      .field("text", "")
      .id("interview_intro")
      .withContent(
        "**Interview Guidelines:** Please answer the following questions based on your experience with the JCC2 system during testing and operational use."
      )
      .end();

    // Interview questions with conditional follow-ups
    const interviewQuestions = [
      {
        id: "interoperability",
        question: "Interoperability. Do you experience issues within the application and between external data sources, legacy software packages, and other JCC2 applications?",
        followUp: "Interoperability - Problems or issues"
      },
      {
        id: "info_sharing",
        question: "Information Sharing. Do you experience issues sharing information up the chain of command or with other teams within the JCC2?",
        followUp: "Information Sharing - Problems or issues"
      },
      {
        id: "performance",
        question: "Performance. Do you experience slowdowns during information exchange?",
        followUp: "Performance - Problems or issues"
      },
      {
        id: "access",
        question: "Access. Do you experience permissions issues when access any JCC2 database or App?",
        followUp: "Access - Problems or issues"
      }
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
      .field("textarea", "Do you find that workarounds are necessary to complete your job duties while using JCC2 applications?")
      .id("interview_workarounds")
      .end()
      .field("checkbox", "If workarounds are used, what would be the most likely reason?")
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
      .field("textarea", "Improvements. Please list any improvements that should to be made to the App.")
      .id("interview_improvements")
      .end()
      .field("textarea", "Critical Issues. Please list any critical issues you feel must be resolved to increase the App's effectiveness.")
      .id("interview_critical_issues")
      .end()
      .field("textarea", "Shout Outs. Please list any features you encountered that greatly improved the speed, quality, or effectiveness of your duties.")
      .id("interview_shout_outs")
      .end()
      .field("textarea", "Final Thoughts. Are there any additional items you would like to address that have not been documented yet?")
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
      .requiredFields("participant_name", "participant_org", "date", "tester_name");

    return builder.build();
  }
}