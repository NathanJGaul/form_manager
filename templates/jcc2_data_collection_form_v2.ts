import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";

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

// Page to section mapping
const pageToSection = {
  1: "MOP 1.1.1",
  2: "MOP 1.1.2",
  3: "MOP 1.1.3",
  4: "MOP 1.1.4",
  5: "MOP 1.1.5",
  6: "MOP 1.2.1",
  7: "MOP 1.2.2",
  8: "MOP 1.2.3",
  9: "MOS 1.3.1",
  10: "MOP 1.3.2",
  11: "MOP 1.3.3",
  12: "MOP 1.3.4",
  13: "MOP 1.3.5",
  14: "MOP 1.3.6",
  15: "MOP 2.1.1",
  16: "MOP 2.1.2",
  17: "MOP 2.1.3",
  18: "MOP 2.1.4",
  19: "MOP 2.1.5",
  20: "MOP 2.1.6",
  21: "MOP 2.1.7",
  22: "MOP 2.1.8",
  23: "MOP 2.1.9",
  24: "MOP 2.1.10",
  25: "MOP 2.2.1",
  26: "MOP 2.2.2",
  27: "MOP 2.3.1",
  28: "MOP 2.3.2",
  29: "MOP 2.3.3",
  30: "MOP 2.3.4",
  31: "MOP 2.4.1",
  32: "MOS 3.1.1",
  33: "MOS 3.1.2",
  34: "MOS 3.2.1",
  35: "MOS 3.2.2",
  36: "MOP 3.2.3",
  37: "Test Participant Interview Section",
  38: "Test Participant Interview Section (continued)",
};

// Standard task questions
const standardTaskQuestions = [
  {
    id: "task_performance",
    label:
      "Task performance. The designated task was performed/completed in accordance with the relevant scenario.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_workaround",
    label:
      "Task workaround. The designated task was completed without the use of a workaround.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "problem_occurrence",
    label:
      "Problem occurrence(s). The designated task was completed without the occurrence of system problems or issues.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt:
      "Please concisely describe any problems or issues and the operational impact:",
  },
  {
    id: "task_outcome",
    label: "Task outcome. The designated JCC2 task outcome was achieved.",
    options: ["Yes", "N/A", "No"],
    followUpPrompt:
      "Please concisely describe the workaround that was used and the operational impact:",
  },
];

/**
 * Helper function to convert strings to an id
 */
function toId(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/ /g, "_");
}

/**
 * Helper function to create standard task questions with improved structure
 */
function addStandardTaskQuestions(builder: TemplateBuilder, sectionId: string) {
  // Add a divider for visual separation
  builder
    .field("text", "")
    .id(`${sectionId}_task_questions_divider`)
    .withContent("---")
    .end();

  standardTaskQuestions.forEach((question) => {
    builder
      .field("radio", question.label)
      .id(`${sectionId}_${question.id}`)
      .options(question.options)
      .layout("horizontal")
      .required()
      .end();

    if (question.options.includes("No")) {
      builder
        .field("textarea", question.followUpPrompt)
        .id(`${sectionId}_${question.id}_details`)
        .required()
        .conditional(`${sectionId}_${question.id}`, "equals", ["No"])
        .end();
    }
  });

  builder
    .field(
      "textarea",
      "Additional observations. Provide any additional observations (positive or negative) regarding performance/completion of the designated task and the task outcome."
    )
    .id(`${sectionId}_additional_observations`)
    .end();
}

/**
 * Programmatic template for the JCC2 Data Collection and Interview Form v2
 *
 * Changes from v1:
 * - Uses new 'text' field type for instructional content
 * - Better organization of scenario descriptions
 * - Improved visual hierarchy with dividers
 * - Enhanced readability with proper informational sections
 * - Cleaner structure for test methodology descriptions
 */
export class JCC2DataCollectionFormV2 {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("JCC2 Data Collection and Interview Form v2")
      .description(
        "A comprehensive data collection form for JCC2 system testing and evaluation - Version 2 with enhanced formatting and usability improvements"
      )
      .author("Nathan Gaul")
      .version("2.0.0")
      .tags(
        "jcc2",
        "data-collection",
        "interview",
        "military",
        "testing",
        "v2"
      );

    // Header Section - Test Participant Information
    builder
      .section("Test Participant Information")
      .id("test_participant_info")
      .field("text", "Test Participant Rank/Full Name")
      .id("participant_name")
      .required()
      .end()
      .field("text", "Test Participant Organization/Office Symbol")
      .id("participant_org")
      .required()
      .end();

    // Header Section - Test Team Member Information
    builder
      .section("Test Team Member Information")
      .id("test_team_info")
      .field("text", "Event/Date/Time")
      .id("event_datetime")
      .required()
      .end()
      .field("text", "Tester Team Member")
      .id("tester_name")
      .required()
      .end();

    // Applications Used Section
    builder
      .section("Applications Used by Test Participant")
      .id("applications_used");

    // Add instructional note using text field
    builder.text(
      "*Note: The Test Team designed the following scenarios to be general and broadly applicable across the diverse range of JCC2 applications and user roles. We understand that JCC2 is a versatile suite, and the goal is to assess its core capabilities and workflows. If the scenarios presented do not align exactly with your experience and role, attempt to adapt the scenario to fit your work role and day-to-day use of the JCC2 applications, focusing on the underlying functionalities and data integration capabilities of JCC2 rather than specific task-oriented procedures you might typically employ.*"
    );

    jcc2Applications.forEach((app) => {
      const appId = toId(app.name);
      builder
        .field("checkbox", `${app.name}`)
        .id(`app_${appId}`)
        .multiple()
        .options(["Yes", "No"])
        .defaultValue(["No"])
        .layout("horizontal")
        .grouping(true, "applications_table")
        .end();
    });

    // All Applications checkbox
    builder
      .field("checkbox", "All Applications")
      .id("app_all_applications")
      .multiple()
      .options(["Yes", "No"])
      .defaultValue(["No"])
      .layout("horizontal")
      .grouping(true, "applications_table")
      .end();

    // Applicable Pages checklist
    builder.section("Applicable Pages").id("applicable_pages");

    // Create checkboxes for pages 1-40
    for (let i = 1; i <= 40; i++) {
      builder
        .field("checkbox", `Page ${i}`)
        .id(`page_${i}`)
        .multiple()
        .options(["Selected"])
        .layout("horizontal")
        .grouping(true, `pages_group_${Math.ceil(i / 10)}`)
        .end();
    }

    // MOP 1.1.1: Integrate intelligence and operational data
    builder
      .section("MOP 1.1.1: Integrate intelligence and operational data")
      .id("mop_1_1_1")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_1_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    // Add JCC2 task description using text field
    builder.text(
      "**JCC2 task:** Data available to the end user is adequate for decision making and analysis."
    );

    // Add applicable applications using text field
    builder
      .field("text", "")
      .id("mop_1_1_1_apps")
      .withContent(
        "**Applicable application(s):** Unity (search), Threat Hub (threat database integrated with Unity), Codex (single screen threat profile), and Crucible (threat prioritization)."
      )
      .end();

    // Add scenario using text field instead of textarea with defaultValue
    builder
      .field("text", "")
      .id("mop_1_1_1_scenario")
      .withContent(
        "**Example scenario:** Analyzing a Reported Service Disruption\n\nA service disruption has been reported affecting a critical DoD network. The disruption is impacting user access to a key mission-essential application. Your task is to use JCC2 to:\n\n1. Gather comprehensive data related to a real-world reported service disruption.\n2. Assess the potential impact of the service disruption.\n3. Prioritize investigative efforts based on the assessed impact."
      )
      .end();

    // MOP 1.1.1 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_1_1_run_${i}_app`)
        .grouping(true, "mop_1_1_1_runs")
        .end()
        .field("radio", `Run ${i} - Data Gathering Supported`)
        .id(`mop_1_1_1_run_${i}_data_gathering`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_1_data_gathering")
        .end()
        .field("radio", `Run ${i} - Impact Assessment Supported`)
        .id(`mop_1_1_1_run_${i}_impact_assessment`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_1_impact_assessment")
        .end()
        .field("radio", `Run ${i} - Prioritization Supported`)
        .id(`mop_1_1_1_run_${i}_prioritization`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_1_prioritization")
        .end()
        .field("radio", `Run ${i} - Data Sufficiency`)
        .id(`mop_1_1_1_run_${i}_data_sufficiency`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_1_data_sufficiency")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_1_1");

    // MOP 1.1.2: Tagging objects of interest
    builder
      .section(
        "MOP 1.1.2: Tagging objects of interest, enabling correlation of objects"
      )
      .id("mop_1_1_2")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_1_2_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    // Add task and app descriptions using text fields
    builder
      .field("text", "")
      .id("mop_1_1_2_task_desc")
      .withContent(
        "**JCC2 task:** Tagging objects of interest, enabling correlation of objects and creating categories."
      )
      .end()
      .field("text", "")
      .id("mop_1_1_2_apps")
      .withContent(
        "**Applicable application(s):** SigAct, Rally, MADSS, and Threat Hub"
      )
      .end()
      .field("text", "")
      .id("mop_1_1_2_scenario")
      .withContent(
        "**Example Scenario:** Correlating Events Through Tagging\n\n1. **SigAct:** Tag incoming reports with a common tag to group related events or incidents for initial analysis and correlation.\n2. **Threat Hub:** Investigate and tag Indicators of Compromise (IOCs) with a relevant tag to link them to a broader threat or actor for threat intelligence and proactive defense.\n3. **Rally:** Create an incident and tag affected assets or users within the incident to track the impact of an event and manage the response workflow.\n4. **MADSS:** Tag affected mission essential assets to determine Mission Relevant Terrain impact of the event."
      )
      .end();

    // MOP 1.1.2 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_1_2_run_${i}_app`)
        .grouping(true, "mop_1_1_2_runs")
        .end()
        .field("radio", `Run ${i} - Tagging Execution`)
        .id(`mop_1_1_2_run_${i}_tagging`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_2_tagging")
        .end()
        .field("radio", `Run ${i} - Cross-Application Correlation`)
        .id(`mop_1_1_2_run_${i}_correlation`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_2_correlation")
        .end()
        .field("radio", `Run ${i} - Tag Consistency`)
        .id(`mop_1_1_2_run_${i}_consistency`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_2_consistency")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_1_2");

    // MOP 1.1.3: Identify the cause of an operational status change
    builder
      .section("MOP 1.1.3: Identify the cause of an operational status change")
      .id("mop_1_1_3")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_1_3_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_1_3_task_desc")
      .withContent(
        "**JCC2 task:** Identify the cause of an operational status change and the integration of operational status data from multiple sources."
      )
      .end()
      .field("text", "")
      .id("mop_1_1_3_apps")
      .withContent(
        "**Applicable application(s):** MADSS (assets and connectivity)"
      )
      .end();

    // MOP 1.1.3 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_1_3_run_${i}_app`)
        .grouping(true, "mop_1_1_3_runs")
        .end()
        .field("radio", `Run ${i} - Status Change Visibility`)
        .id(`mop_1_1_3_run_${i}_visibility`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_3_visibility")
        .end()
        .field("radio", `Run ${i} - Detailed Information Access`)
        .id(`mop_1_1_3_run_${i}_details`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_3_details")
        .end()
        .field("radio", `Run ${i} - ASI/Incident Correlation`)
        .id(`mop_1_1_3_run_${i}_asi_correlation`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_3_asi_correlation")
        .end()
        .field("radio", `Run ${i} - Event Creation Capability`)
        .id(`mop_1_1_3_run_${i}_event_creation`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_3_event_creation")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_1_3");

    // MOP 1.1.4: Reporting
    builder
      .section(
        "MOP 1.1.4: Reporting that enable users to extract useful mission information"
      )
      .id("mop_1_1_4")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_1_4_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_1_4_task_desc")
      .withContent(
        "**JCC2 task:** Produce reports that enable users to extract useful mission information efficiently."
      )
      .end()
      .field("text", "")
      .id("mop_1_1_4_apps")
      .withContent("**Applicable application(s):** Rally, SigAct")
      .end();

    // MOP 1.1.4 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_1_4_run_${i}_app`)
        .grouping(true, "mop_1_1_4_runs")
        .end()
        .field("radio", `Run ${i} - Create Reports`)
        .id(`mop_1_1_4_run_${i}_create`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_4_create")
        .end()
        .field("radio", `Run ${i} - Useful`)
        .id(`mop_1_1_4_run_${i}_useful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_4_useful")
        .end()
        .field("radio", `Run ${i} - Accurate`)
        .id(`mop_1_1_4_run_${i}_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_4_accurate")
        .end()
        .field("radio", `Run ${i} - Exportable`)
        .id(`mop_1_1_4_run_${i}_exportable`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_4_exportable")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_1_4");

    // MOP 1.1.5: Information sharing
    builder
      .section(
        "MOP 1.1.5: Information sharing between offensive, defensive, and DODIN forces"
      )
      .id("mop_1_1_5")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_1_5_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_1_5_task_desc")
      .withContent(
        "**JCC2 task:** Data is shared between offensive, defensive, and DODIN forces for situational awareness and unity of effort."
      )
      .end()
      .field("text", "")
      .id("mop_1_1_5_apps")
      .withContent(
        "**Applicable application(s):** A2IT, CAD, Codex, Crucible, Cyber 9-Line, Dispatch, Redmap, Threat Hub, Triage, Unity"
      )
      .end();

    // MOP 1.1.5 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_1_5_run_${i}_app`)
        .grouping(true, "mop_1_1_5_runs")
        .end()
        .field("text", `Run ${i} - Data Origin`)
        .id(`mop_1_1_5_run_${i}_origin`)
        .grouping(true, "mop_1_1_5_origin")
        .end()
        .field("text", `Run ${i} - Data Destination`)
        .id(`mop_1_1_5_run_${i}_destination`)
        .grouping(true, "mop_1_1_5_destination")
        .end()
        .field("text", `Run ${i} - Reason`)
        .id(`mop_1_1_5_run_${i}_reason`)
        .grouping(true, "mop_1_1_5_reason")
        .end()
        .field("radio", `Run ${i} - Successful`)
        .id(`mop_1_1_5_run_${i}_successful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_1_5_successful")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_1_5");

    // MOP 1.2.1: Threat hunting
    builder
      .section(
        "MOP 1.2.1: Threat hunting activities using signatures and correlation of events"
      )
      .id("mop_1_2_1")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_2_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_2_1_task_desc")
      .withContent(
        "**JCC2 task:** Threat hunting activities using signatures and correlation of events derived from cyber sensors."
      )
      .end()
      .field("text", "")
      .id("mop_1_2_1_apps")
      .withContent(
        "**Applicable application(s):** Codex, Crucible, Threat Hub, Unity"
      )
      .end();

    // MOP 1.2.1 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Detection Method`)
        .id(`mop_1_2_1_run_${i}_method`)
        .grouping(true, "mop_1_2_1_method")
        .end()
        .field("text", `Run ${i} - Source of Information`)
        .id(`mop_1_2_1_run_${i}_source`)
        .grouping(true, "mop_1_2_1_source")
        .end()
        .field("text", `Run ${i} - Notes`)
        .id(`mop_1_2_1_run_${i}_notes`)
        .grouping(true, "mop_1_2_1_notes")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_2_1");

    // MOP 1.2.2: Decide what actions to take
    builder
      .section(
        "MOP 1.2.2: Decide what actions to take in response to detected malicious activity"
      )
      .id("mop_1_2_2")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_2_2_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_2_2_task_desc")
      .withContent(
        "**JCC2 task:** Decide what actions to take in response to detected malicious activity based on network and threat visibility."
      )
      .end()
      .field("text", "")
      .id("mop_1_2_2_apps")
      .withContent("**Applicable application(s):** Codex, Crucible, Unity")
      .end();

    // MOP 1.2.2 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_2_2_run_${i}_app`)
        .grouping(true, "mop_1_2_2_runs")
        .end()
        .field("text", `Run ${i} - Threats Listed`)
        .id(`mop_1_2_2_run_${i}_threats`)
        .grouping(true, "mop_1_2_2_threats")
        .end()
        .field("radio", `Run ${i} - Data available for assessment`)
        .id(`mop_1_2_2_run_${i}_assessment_data`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_2_assessment")
        .end()
        .field("radio", `Run ${i} - Data available for prioritization`)
        .id(`mop_1_2_2_run_${i}_prioritization_data`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_2_prioritization")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_2_2");

    // MOP 1.2.3: Extract useful information through report generation
    builder
      .section(
        "MOP 1.2.3: Extract useful information through report generation"
      )
      .id("mop_1_2_3")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_2_3_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_2_3_task_desc")
      .withContent(
        "**JCC2 task:** Produce reports that enable users to extract useful information efficiently."
      )
      .end()
      .field("text", "")
      .id("mop_1_2_3_apps")
      .withContent(
        "**Applicable application(s):** A2IT, CAD, Codex, Crucible, Cyber 9-Line, Dispatch, Redmap, Threat Hub, Triage, Unity"
      )
      .end();

    // MOP 1.2.3 Observation runs - using table format
    for (let i = 1; i <= 10; i++) {
      builder
        .field("radio", `Run ${i} - Report Created`)
        .id(`mop_1_2_3_run_${i}_created`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_3_created")
        .end()
        .field("radio", `Run ${i} - Useful`)
        .id(`mop_1_2_3_run_${i}_useful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_3_useful")
        .end()
        .field("radio", `Run ${i} - Accurate`)
        .id(`mop_1_2_3_run_${i}_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_3_accurate")
        .end()
        .field("radio", `Run ${i} - Exportable`)
        .id(`mop_1_2_3_run_${i}_exportable`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_2_3_exportable")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_2_3");

    // MOS 1.3.1: Common Operating Picture
    builder
      .section(
        "MOS 1.3.1: Gain situational understanding of the area of responsibility through the COP"
      )
      .id("mos_1_3_1")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mos_1_3_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mos_1_3_1_task_desc")
      .withContent(
        "**JCC2 task:** Gain situational understanding of the area of responsibility through the common operating picture."
      )
      .end()
      .field("text", "")
      .id("mos_1_3_1_apps")
      .withContent("**Applicable application(s):** All Applications")
      .end();

    // MOS 1.3.1 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application`)
        .id(`mos_1_3_1_run_${i}_app`)
        .grouping(true, "mos_1_3_1_runs")
        .end()
        .field("radio", `Run ${i} - Data provides situational awareness`)
        .id(`mos_1_3_1_run_${i}_awareness`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mos_1_3_1_awareness")
        .end()
        .field("radio", `Run ${i} - Data is accurate`)
        .id(`mos_1_3_1_run_${i}_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mos_1_3_1_accurate")
        .end()
        .field("radio", `Run ${i} - Data is relevant`)
        .id(`mos_1_3_1_run_${i}_relevant`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mos_1_3_1_relevant")
        .end();
    }

    addStandardTaskQuestions(builder, "mos_1_3_1");

    // MOP 1.3.2: Dependency map
    builder
      .section(
        "MOP 1.3.2: Dependency map to find outage, cause of outage, and responsible organization"
      )
      .id("mop_1_3_2")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_3_2_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_3_2_task_desc")
      .withContent(
        "**JCC2 task:** Use dependency mapping to identify outages, their causes, and responsible organizations."
      )
      .end()
      .field("text", "")
      .id("mop_1_3_2_apps")
      .withContent("**Applicable application(s):** MADSS, Rally")
      .end();

    // MOP 1.3.2 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("radio", `Run ${i} - Outage Identified`)
        .id(`mop_1_3_2_run_${i}_outage`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_2_outage")
        .end()
        .field("radio", `Run ${i} - Cause of Outage Identified`)
        .id(`mop_1_3_2_run_${i}_cause`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_2_cause")
        .end()
        .field("radio", `Run ${i} - Responsible Organization Identified`)
        .id(`mop_1_3_2_run_${i}_org`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_2_org")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_3_2");

    // MOP 1.3.3: Event creation process
    builder
      .section("MOP 1.3.3: Event creation process")
      .id("mop_1_3_3")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_3_3_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_3_3_task_desc")
      .withContent(
        "**JCC2 task:** Create events efficiently to track and manage incidents."
      )
      .end()
      .field("text", "")
      .id("mop_1_3_3_apps")
      .withContent("**Applicable application(s):** Rally, SigAct")
      .end();

    // MOP 1.3.3 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application`)
        .id(`mop_1_3_3_run_${i}_app`)
        .grouping(true, "mop_1_3_3_runs")
        .end()
        .field("radio", `Run ${i} - Event Creation Successful`)
        .id(`mop_1_3_3_run_${i}_successful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_3_successful")
        .end()
        .field("radio", `Run ${i} - Provides enough data to be actionable`)
        .id(`mop_1_3_3_run_${i}_actionable`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_3_actionable")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_3_3");

    // MOP 1.3.4: Create an alert
    builder
      .section(
        "MOP 1.3.4: Create an alert to maintain situational awareness a mission"
      )
      .id("mop_1_3_4")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_3_4_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_3_4_task_desc")
      .withContent(
        "**JCC2 task:** Create alerts to maintain situational awareness throughout a mission."
      )
      .end()
      .field("text", "")
      .id("mop_1_3_4_apps")
      .withContent(
        "**Applicable application(s):** A2IT, CAD, Codex, Crucible, Cyber 9-Line, Dispatch, Redmap, SigAct, Threat Hub, Triage, Unity"
      )
      .end();

    // MOP 1.3.4 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_1_3_4_run_${i}_app`)
        .grouping(true, "mop_1_3_4_runs")
        .end()
        .field("radio", `Run ${i} - Alerts created`)
        .id(`mop_1_3_4_run_${i}_created`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_4_created")
        .end()
        .field("text", `Run ${i} - Type of alert`)
        .id(`mop_1_3_4_run_${i}_type`)
        .grouping(true, "mop_1_3_4_type")
        .end()
        .field("radio", `Run ${i} - Alert witnessed`)
        .id(`mop_1_3_4_run_${i}_witnessed`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_4_witnessed")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_3_4");

    // MOP 1.3.5: Data flow across different security levels
    builder
      .section(
        "MOP 1.3.5: Data flow across different security levels to support information exchange"
      )
      .id("mop_1_3_5")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_3_5_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_3_5_task_desc")
      .withContent(
        "**JCC2 task:** Facilitate data flow across different security levels to support information exchange."
      )
      .end()
      .field("text", "")
      .id("mop_1_3_5_apps")
      .withContent("**Applicable application(s):** All Applications")
      .end();

    // MOP 1.3.5 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Record`)
        .id(`mop_1_3_5_run_${i}_record`)
        .grouping(true, "mop_1_3_5_records")
        .end()
        .field("checkbox", `Run ${i} - Environments record viewed`)
        .id(`mop_1_3_5_run_${i}_environments`)
        .multiple()
        .options(["NIPR", "SIPR", "JWICS"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_5_environments")
        .end()
        .field("text", `Run ${i} - Completeness of Record for each environment`)
        .id(`mop_1_3_5_run_${i}_completeness`)
        .grouping(true, "mop_1_3_5_completeness")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_3_5");

    // MOP 1.3.6: Extraction of useful information through reporting
    builder
      .section(
        "MOP 1.3.6: Extraction of useful information through its reporting capabilities"
      )
      .id("mop_1_3_6")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_1_3_6_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_1_3_6_task_desc")
      .withContent(
        "**JCC2 task:** Extract useful information through comprehensive reporting capabilities."
      )
      .end()
      .field("text", "")
      .id("mop_1_3_6_apps")
      .withContent("**Applicable application(s):** MADSS")
      .end();

    // MOP 1.3.6 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("radio", `Run ${i} - Create Reports`)
        .id(`mop_1_3_6_run_${i}_create`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_6_create")
        .end()
        .field("radio", `Run ${i} - Useful`)
        .id(`mop_1_3_6_run_${i}_useful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_6_useful")
        .end()
        .field("radio", `Run ${i} - Accurate`)
        .id(`mop_1_3_6_run_${i}_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_6_accurate")
        .end()
        .field("radio", `Run ${i} - Exportable`)
        .id(`mop_1_3_6_run_${i}_exportable`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_1_3_6_exportable")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_1_3_6");

    // MOP 2.1.1: Perform cyber force assessments
    builder
      .section("MOP 2.1.1: Perform cyber force assessments")
      .id("mop_2_1_1")
      .conditional("app_jcc2_readiness", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_1_task_desc")
      .withContent(
        "**JCC2 task:** Perform comprehensive cyber force assessments."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_1_apps")
      .withContent("**Applicable application(s):** JCC2 Readiness")
      .end();

    addStandardTaskQuestions(builder, "mop_2_1_1");

    // MOP 2.1.2: Create and manage target lists
    builder
      .section("MOP 2.1.2: Create and manage target lists")
      .id("mop_2_1_2")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_2_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_2_task_desc")
      .withContent("**JCC2 task:** Create and manage target lists effectively.")
      .end()
      .field("text", "")
      .id("mop_2_1_2_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end();

    // MOP 2.1.2 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("radio", `Run ${i} - List created`)
        .id(`mop_2_1_2_run_${i}_created`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_2_created")
        .end()
        .field("radio", `Run ${i} - List can be exported`)
        .id(`mop_2_1_2_run_${i}_exported`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_2_exported")
        .end()
        .field("radio", `Run ${i} - Annotated`)
        .id(`mop_2_1_2_run_${i}_annotated`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_2_annotated")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_1_2");

    // MOP 2.1.3: Number of users able to simultaneously edit a mission
    builder
      .section(
        "MOP 2.1.3: Number of users able to simultaneously edit a mission"
      )
      .id("mop_2_1_3")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_3_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_3_task_desc")
      .withContent(
        "**JCC2 task:** Support multiple users simultaneously editing a mission."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_3_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end();

    // MOP 2.1.3 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Mission`)
        .id(`mop_2_1_3_run_${i}_mission`)
        .grouping(true, "mop_2_1_3_mission")
        .end()
        .field("text", `Run ${i} - Number of users`)
        .id(`mop_2_1_3_run_${i}_users`)
        .grouping(true, "mop_2_1_3_users")
        .end()
        .field("radio", `Run ${i} - Edit Successful`)
        .id(`mop_2_1_3_run_${i}_successful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_3_successful")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_1_3");

    // MOP 2.1.4: Number of users able to simultaneously discuss a mission
    builder
      .section(
        "MOP 2.1.4: Number of users able to simultaneously discuss a mission"
      )
      .id("mop_2_1_4")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_4_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_4_task_desc")
      .withContent(
        "**JCC2 task:** Support multiple users simultaneously discussing a mission."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_4_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end();

    // MOP 2.1.4 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Mission`)
        .id(`mop_2_1_4_run_${i}_mission`)
        .grouping(true, "mop_2_1_4_mission")
        .end()
        .field("text", `Run ${i} - Number of users`)
        .id(`mop_2_1_4_run_${i}_users`)
        .grouping(true, "mop_2_1_4_users")
        .end()
        .field("radio", `Run ${i} - Edit successful`)
        .id(`mop_2_1_4_run_${i}_successful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_4_successful")
        .end()
        .field("text", `Run ${i} - Method Used for discussion`)
        .id(`mop_2_1_4_run_${i}_method`)
        .grouping(true, "mop_2_1_4_method")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_1_4");

    // MOP 2.1.5: Percentage of times Blue Force information is integrated
    builder
      .section(
        "MOP 2.1.5: Percentage of times Blue Force information is integrated and viewable"
      )
      .id("mop_2_1_5")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_5_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_5_task_desc")
      .withContent(
        "**JCC2 task:** Integrate and display Blue Force information consistently."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_5_apps")
      .withContent(
        "**Applicable application(s):** JCC2 Readiness, JCC2 Cyber-Ops"
      )
      .end();

    builder
      .field("radio", "Sensors. Can you see blue force sensor data?")
      .id("mop_2_1_5_sensors")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Sensors - Problems or issues")
      .id("mop_2_1_5_sensors_details")
      .required()
      .conditional("mop_2_1_5_sensors", "equals", ["No"])
      .end()
      .field("radio", "Remedy. Can you see STRATCOM remedy tickets?")
      .id("mop_2_1_5_remedy")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Remedy - Problems or issues")
      .id("mop_2_1_5_remedy_details")
      .required()
      .conditional("mop_2_1_5_remedy", "equals", ["No"])
      .end()
      .field("radio", "Intel. Can you see cyber threat data?")
      .id("mop_2_1_5_intel")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Intel - Problems or issues")
      .id("mop_2_1_5_intel_details")
      .required()
      .conditional("mop_2_1_5_intel", "equals", ["No"])
      .end()
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("mop_2_1_5_additional_observations")
      .end();

    // MOP 2.1.5 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_2_1_5_run_${i}_app`)
        .grouping(true, "mop_2_1_5_runs")
        .end()
        .field("radio", `Run ${i} - Data viewed Successfully`)
        .id(`mop_2_1_5_run_${i}_successful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_5_successful")
        .end()
        .field("text", `Run ${i} - Notes`)
        .id(`mop_2_1_5_run_${i}_notes`)
        .grouping(true, "mop_2_1_5_notes")
        .end();
    }

    // MOP 2.1.6: Percent of time Blue Force data is imported & exported
    builder
      .section(
        "MOP 2.1.6: Percent of time Blue Force data is imported & exported with accuracy"
      )
      .id("mop_2_1_6")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_6_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_6_task_desc")
      .withContent(
        "**JCC2 task:** Import and export Blue Force data accurately."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_6_apps")
      .withContent("**Applicable application(s):** JCC2 Readiness")
      .end();

    // MOP 2.1.6 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_2_1_6_run_${i}_app`)
        .grouping(true, "mop_2_1_6_runs")
        .end()
        .field("radio", `Run ${i} - Data can be exported`)
        .id(`mop_2_1_6_run_${i}_export`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_6_export")
        .end()
        .field("radio", `Run ${i} - Export is Accurate`)
        .id(`mop_2_1_6_run_${i}_export_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_6_export_accurate")
        .end()
        .field("radio", `Run ${i} - Data can be imported`)
        .id(`mop_2_1_6_run_${i}_import`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_6_import")
        .end()
        .field("radio", `Run ${i} - Import is accurate`)
        .id(`mop_2_1_6_run_${i}_import_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_6_import_accurate")
        .end();
    }

    builder
      .field("radio", "Import. Can you import blue force data?")
      .id("mop_2_1_6_import")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Import - Problems or issues")
      .id("mop_2_1_6_import_details")
      .required()
      .conditional("mop_2_1_6_import", "equals", ["No"])
      .end()
      .field("radio", "Export. Can you export blue force data?")
      .id("mop_2_1_6_export")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Export - Problems or issues")
      .id("mop_2_1_6_export_details")
      .required()
      .conditional("mop_2_1_6_export", "equals", ["No"])
      .end()
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("mop_2_1_6_additional_observations")
      .end();

    // MOP 2.1.7: Prevent cyber mission forces from being assigned
    builder
      .section(
        "MOP 2.1.7: Prevent cyber mission forces from being assigned to different missions that would conflict"
      )
      .id("mop_2_1_7")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_7_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_7_task_desc")
      .withContent(
        "**JCC2 task:** Prevent conflicting mission assignments for cyber forces."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_7_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end();

    // MOP 2.1.7 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("radio", `Run ${i} - Force displayed`)
        .id(`mop_2_1_7_run_${i}_displayed`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_7_displayed")
        .end()
        .field("radio", `Run ${i} - Conflict Attempted`)
        .id(`mop_2_1_7_run_${i}_conflict`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_7_conflict")
        .end()
        .field("radio", `Run ${i} - Deconflict successful`)
        .id(`mop_2_1_7_run_${i}_deconflict`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_1_7_deconflict")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_1_7");

    // MOP 2.1.8: Judge the availability and status of units
    builder
      .section(
        "MOP 2.1.8: The system adequately enables the user to judge the availability and status of units"
      )
      .id("mop_2_1_8")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_8_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_8_task_desc")
      .withContent(
        "**JCC2 task:** Provide clear visibility into unit availability and status."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_8_apps")
      .withContent(
        "**Applicable application(s):** JCC2 Cyber-Ops, JCC2 Readiness"
      )
      .end();

    addStandardTaskQuestions(builder, "mop_2_1_8");

    // MOP 2.1.9: Joint forces to perform collaborative planning
    builder
      .section("MOP 2.1.9: Joint forces to perform collaborative planning")
      .id("mop_2_1_9")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_1_9_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_1_9_task_desc")
      .withContent(
        "**JCC2 task:** Enable joint forces to collaborate effectively in planning operations."
      )
      .end()
      .field("text", "")
      .id("mop_2_1_9_apps")
      .withContent(
        "**Applicable application(s):** JCC2 Readiness, JCC2 Cyber-Ops"
      )
      .end();

    addStandardTaskQuestions(builder, "mop_2_1_9");

    // MOP 2.3.1: Mission Change orders can be completed within Dispatch
    builder
      .section(
        "MOP 2.3.1: Mission Change orders can be completed within Dispatch"
      )
      .id("mop_2_3_1")
      .conditional("app_dispatch", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_3_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_3_1_task_desc")
      .withContent(
        "**JCC2 task:** Complete mission change orders efficiently within Dispatch."
      )
      .end()
      .field("text", "")
      .id("mop_2_3_1_apps")
      .withContent("**Applicable application(s):** Dispatch")
      .end();

    addStandardTaskQuestions(builder, "mop_2_3_1");

    // MOP 2.3.2: JCC2 displays force disposition
    builder
      .section("MOP 2.3.2: JCC2 displays force disposition")
      .id("mop_2_3_2")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_3_2_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_3_2_task_desc")
      .withContent(
        "**JCC2 task:** Display force disposition clearly and accurately."
      )
      .end()
      .field("text", "")
      .id("mop_2_3_2_apps")
      .withContent(
        "**Applicable application(s):** JCC2 Readiness, JCC2 Cyber-Ops"
      )
      .end();

    addStandardTaskQuestions(builder, "mop_2_3_2");

    // MOP 2.3.3: Produce reports relevant to battle management
    builder
      .section(
        "MOP 2.3.3: Produce reports that are relevant to battle management"
      )
      .id("mop_2_3_3")
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_3_3_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_3_3_task_desc")
      .withContent(
        "**JCC2 task:** Generate reports that support effective battle management."
      )
      .end()
      .field("text", "")
      .id("mop_2_3_3_apps")
      .withContent("**Applicable application(s):** JCC2 Readiness")
      .end();

    // MOP 2.3.3 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Application Used`)
        .id(`mop_2_3_3_run_${i}_app`)
        .grouping(true, "mop_2_3_3_runs")
        .end()
        .field("radio", `Run ${i} - Create Reports`)
        .id(`mop_2_3_3_run_${i}_create`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_3_3_create")
        .end()
        .field("radio", `Run ${i} - Useful`)
        .id(`mop_2_3_3_run_${i}_useful`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_3_3_useful")
        .end()
        .field("radio", `Run ${i} - Accurate`)
        .id(`mop_2_3_3_run_${i}_accurate`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_3_3_accurate")
        .end()
        .field("radio", `Run ${i} - Exportable`)
        .id(`mop_2_3_3_run_${i}_exportable`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_3_3_exportable")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_3_3");

    // MOP 2.3.4: The number of missions able to be tracked at once
    builder
      .section("MOP 2.3.4: The number of missions able to be tracked at once")
      .id("mop_2_3_4")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_3_4_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_3_4_task_desc")
      .withContent(
        "**JCC2 task:** Track multiple missions simultaneously without performance degradation."
      )
      .end()
      .field("text", "")
      .id("mop_2_3_4_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end()
      .field("text", "")
      .id("mop_2_3_4_methodology")
      .withContent(
        "**Test Methodology:** The tester will ask the user to open 15 missions on the dashboard to see if their system functions at a useable level of performance for the user to do their normal work roles."
      )
      .end();

    // MOP 2.3.4 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field(
          "text",
          `Run ${i} - Number of missions able to be tracked simultaneously`
        )
        .id(`mop_2_3_4_run_${i}_number`)
        .grouping(true, "mop_2_3_4_number")
        .end()
        .field("text", `Run ${i} - Notes`)
        .id(`mop_2_3_4_run_${i}_notes`)
        .grouping(true, "mop_2_3_4_notes")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_3_4");

    // MOP 2.4.1: Support mission progress analysis
    builder
      .section(
        "MOP 2.4.1: The system adequately supports mission progress analysis"
      )
      .id("mop_2_4_1")
      .conditional("app_jcc2_cyberops", "contains", ["Yes"])
      .field("checkbox", "Aligns to Test Participant's Role and Duties")
      .id("mop_2_4_1_aligns")
      .multiple()
      .options(["Yes", "No"])
      .layout("horizontal")
      .end();

    builder
      .field("text", "")
      .id("mop_2_4_1_task_desc")
      .withContent(
        "**JCC2 task:** Provide comprehensive mission progress analysis capabilities."
      )
      .end()
      .field("text", "")
      .id("mop_2_4_1_apps")
      .withContent("**Applicable application(s):** JCC2 Cyber-Ops")
      .end();

    // MOP 2.4.1 Observation runs
    for (let i = 1; i <= 10; i++) {
      builder
        .field("text", `Run ${i} - Type of mission`)
        .id(`mop_2_4_1_run_${i}_type`)
        .grouping(true, "mop_2_4_1_type")
        .end()
        .field("radio", `Run ${i} - Able to measure progress of mission`)
        .id(`mop_2_4_1_run_${i}_measure`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_4_1_measure")
        .end()
        .field("radio", `Run ${i} - Target and Mission Data provided`)
        .id(`mop_2_4_1_run_${i}_data`)
        .options(["Yes", "No", "NA"])
        .layout("horizontal")
        .grouping(true, "mop_2_4_1_data")
        .end()
        .field("text", `Run ${i} - Notes`)
        .id(`mop_2_4_1_run_${i}_notes`)
        .grouping(true, "mop_2_4_1_notes")
        .end();
    }

    addStandardTaskQuestions(builder, "mop_2_4_1");

    // MOS 3.1.1: Operational Reliability
    builder.section("MOS 3.1.1: Operational Reliability").id("mos_3_1_1");

    builder
      .field("text", "")
      .id("mos_3_1_1_methodology")
      .withContent(
        "**Test Methodology:** The test team will record the duration a system is in use and the duration of any failures or outages during the test events. The test team will observe whether there is documentation available to the users which provides steps to diagnose and repair or mitigate the failure."
      )
      .end();

    // MOS 3.1.1 Outage records
    for (let i = 1; i <= 5; i++) {
      builder
        .field("text", `Outage ${i} - Application / System`)
        .id(`mos_3_1_1_outage_${i}_app`)
        .grouping(true, "mos_3_1_1_apps")
        .end()
        .field("text", `Outage ${i} - Reason for Outage`)
        .id(`mos_3_1_1_outage_${i}_reason`)
        .grouping(true, "mos_3_1_1_reasons")
        .end()
        .field("text", `Outage ${i} - Duration / Time to restore functionality`)
        .id(`mos_3_1_1_outage_${i}_duration`)
        .grouping(true, "mos_3_1_1_durations")
        .end();
    }

    builder
      .field("textarea", "How was the outage discovered?")
      .id("mos_3_1_1_how_discovered")
      .end()
      .field(
        "textarea",
        "What impact did the outage have on your mission / task?"
      )
      .id("mos_3_1_1_impact")
      .end()
      .field(
        "textarea",
        "Were regular updates provided as to the status of the recovery?"
      )
      .id("mos_3_1_1_updates")
      .end()
      .field("textarea", "Additional observations?")
      .id("mos_3_1_1_additional")
      .end();

    // MOS 3.1.2: Operational Availability
    builder.section("MOS 3.1.2: Operational Availability").id("mos_3_1_2");

    builder
      .field("text", "")
      .id("mos_3_1_2_methodology")
      .withContent(
        "**Test Methodology:** The test team will record system availability metrics during the test period."
      )
      .end();

    // MOS 3.1.2 Outage records (similar structure)
    for (let i = 1; i <= 5; i++) {
      builder
        .field("text", `Outage ${i} - Application / System`)
        .id(`mos_3_1_2_outage_${i}_app`)
        .grouping(true, "mos_3_1_2_apps")
        .end()
        .field("text", `Outage ${i} - Reason for Outage`)
        .id(`mos_3_1_2_outage_${i}_reason`)
        .grouping(true, "mos_3_1_2_reasons")
        .end()
        .field("text", `Outage ${i} - Duration / Time to restore functionality`)
        .id(`mos_3_1_2_outage_${i}_duration`)
        .grouping(true, "mos_3_1_2_durations")
        .end();
    }

    builder
      .field("textarea", "How was the outage discovered?")
      .id("mos_3_1_2_how_discovered")
      .end()
      .field(
        "textarea",
        "What impact did the outage have on your mission / task?"
      )
      .id("mos_3_1_2_impact")
      .end()
      .field(
        "textarea",
        "Were regular updates provided as to the status of the recovery?"
      )
      .id("mos_3_1_2_updates")
      .end()
      .field("textarea", "Additional observations?")
      .id("mos_3_1_2_additional")
      .end();

    // MOS 3.2.1: User rating of JCC2 training
    builder
      .section("MOS 3.2.1: User rating of JCC2 training")
      .id("mos_3_2_1")
      .field(
        "radio",
        "Initial Training. Did you receive any training before you used JCC2?"
      )
      .id("mos_3_2_1_initial_training")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Initial Training - Problems or issues")
      .id("mos_3_2_1_initial_training_details")
      .required()
      .conditional("mos_3_2_1_initial_training", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Additional Training. Did you receive any supplemental training to aid your duties?"
      )
      .id("mos_3_2_1_additional_training")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Additional Training - Problems or issues")
      .id("mos_3_2_1_additional_training_details")
      .required()
      .conditional("mos_3_2_1_additional_training", "equals", ["No"])
      .end()
      .field("radio", "Request Training. Do you want (more) training?")
      .id("mos_3_2_1_request_training")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Request Training - Details")
      .id("mos_3_2_1_request_training_details")
      .required()
      .conditional("mos_3_2_1_request_training", "equals", ["Yes", "No"])
      .end()
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("mos_3_2_1_additional_observations")
      .end();

    // MOS 3.2.2: User rating of JCC2 documentation
    builder
      .section("MOS 3.2.2: User rating of JCC2 documentation")
      .id("mos_3_2_2")
      .field(
        "radio",
        "Training Documentation. Did you receive any documentation with training?"
      )
      .id("mos_3_2_2_training_doc")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Training Documentation - Problems or issues")
      .id("mos_3_2_2_training_doc_details")
      .required()
      .conditional("mos_3_2_2_training_doc", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Online Documentation. Were you directed to online documentation?"
      )
      .id("mos_3_2_2_online_doc")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Online Documentation - Problems or issues")
      .id("mos_3_2_2_online_doc_details")
      .required()
      .conditional("mos_3_2_2_online_doc", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Completeness of Documentation. Does the provided documentation meet your needs?"
      )
      .id("mos_3_2_2_completeness")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Completeness - Problems or issues")
      .id("mos_3_2_2_completeness_details")
      .required()
      .conditional("mos_3_2_2_completeness", "equals", ["No"])
      .end()
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("mos_3_2_2_additional_observations")
      .end();

    // MOP 3.2.3: User rating of JCC2 support (help desk)
    builder
      .section("MOP 3.2.3: User rating of JCC2 support (help desk)")
      .id("mop_3_2_3");

    // Help desk tickets table
    for (let i = 1; i <= 5; i++) {
      builder
        .field("text", `Ticket ${i} - Application`)
        .id(`mop_3_2_3_ticket_${i}_app`)
        .grouping(true, "mop_3_2_3_apps")
        .end()
        .field("text", `Ticket ${i} - Details of Problem`)
        .id(`mop_3_2_3_ticket_${i}_details`)
        .grouping(true, "mop_3_2_3_details")
        .end()
        .field("text", `Ticket ${i} - Location`)
        .id(`mop_3_2_3_ticket_${i}_location`)
        .grouping(true, "mop_3_2_3_locations")
        .end()
        .field("text", `Ticket ${i} - Time reported`)
        .id(`mop_3_2_3_ticket_${i}_reported`)
        .grouping(true, "mop_3_2_3_reported")
        .end()
        .field("text", `Ticket ${i} - Time resolved`)
        .id(`mop_3_2_3_ticket_${i}_resolved`)
        .grouping(true, "mop_3_2_3_resolved")
        .end();
    }

    builder
      .field("radio", "Access. Are you able to submit a help desk ticket?")
      .id("mop_3_2_3_access")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Access - Problems or issues")
      .id("mop_3_2_3_access_details")
      .required()
      .conditional("mop_3_2_3_access", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Response. Do you receive an acknowledgment of your request for assistance within a timely manner?"
      )
      .id("mop_3_2_3_response")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Response - Problems or issues")
      .id("mop_3_2_3_response_details")
      .required()
      .conditional("mop_3_2_3_response", "equals", ["No"])
      .end()
      .field(
        "radio",
        'Decision. Is your request appropriately triaged as "fix now", "fix when able", or "enhancement request"?'
      )
      .id("mop_3_2_3_decision")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Decision - Problems or issues")
      .id("mop_3_2_3_decision_details")
      .required()
      .conditional("mop_3_2_3_decision", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Follow Through. Do you believe the appropriate corrective actions are taken?"
      )
      .id("mop_3_2_3_follow_through")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Follow Through - Problems or issues")
      .id("mop_3_2_3_follow_through_details")
      .required()
      .conditional("mop_3_2_3_follow_through", "equals", ["No"])
      .end()
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("mop_3_2_3_additional_observations")
      .end();

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

    builder
      .field(
        "radio",
        "Interoperability. Do you experience issues within the application and between external data sources, legacy software packages, and other JCC2 applications?"
      )
      .id("interview_interoperability")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Interoperability - Problems or issues")
      .id("interview_interoperability_details")
      .required()
      .conditional("interview_interoperability", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Information Sharing. Do you experience issues sharing information up the chain of command or with other teams within the JCC2?"
      )
      .id("interview_info_sharing")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Information Sharing - Problems or issues")
      .id("interview_info_sharing_details")
      .required()
      .conditional("interview_info_sharing", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Performance. Do you experience slowdowns during information exchange?"
      )
      .id("interview_performance")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Performance - Problems or issues")
      .id("interview_performance_details")
      .required()
      .conditional("interview_performance", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Access. Do you experience permissions issues when access any JCC2 database or App?"
      )
      .id("interview_access")
      .options(["Yes", "N/A", "No"])
      .layout("horizontal")
      .required()
      .end()
      .field("textarea", "Access - Problems or issues")
      .id("interview_access_details")
      .required()
      .conditional("interview_access", "equals", ["Yes"])
      .end()
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

    return builder.build();
  }
}
