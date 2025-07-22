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
 * Helper function to create standard task questions
 */
function addStandardTaskQuestions(builder: TemplateBuilder, sectionId: string) {
  // Add a divider for visual separation
  // builder
  //   .field("text", "")
  //   .id(`${sectionId}_task_questions_divider`)
  //   .withContent("---")
  //   .end();

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
 * Programmatic template for the JCC2 Data Collection and Interview Form v3
 *
 * Changes from v2:
 * - Uses DataTable fields for all observation runs instead of individual fields
 * - Significantly reduces form complexity and improves user experience
 * - Makes data entry more intuitive and table-like as shown in the PDF
 * - Improves CSV export structure for better data analysis
 */
export class JCC2DataCollectionFormV3 {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("JCC2 Data Collection and Interview Form v3")
      .description(
        "A comprehensive data collection form for JCC2 system testing and evaluation - Version 3 with DataTable implementation for improved data entry and organization"
      )
      .author("Nathan Gaul")
      .version("3.0.0")
      .tags(
        "jcc2",
        "data-collection",
        "interview",
        "military",
        "testing",
        "v3",
        "datatable"
      );

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
      .end();

    // Header Section - Test Team Member Information
    builder
      // .section("Test Team Member Information")
      // .id("test_team_info")
      .field("date", "Event/Date/Time")
      .id("date")
      .required()
      .end()
      // .field("text", "Tester Team Member")
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

    jcc2Applications.forEach((app) => {
      const appId = toId(app.name);
      builder
        .field("radio", `${app.name}`)
        .id(`exp_app_${appId}`)
        .multiple()
        .options(["Yes", "No"])
        .defaultValue("No")
        .layout("horizontal")
        .grouping(true, "applications_table")
        .end();
    });

    // MOP 1.1.1: Integrate intelligence and operational data
    builder
      .section("MOP 1.1.1: Integrate intelligence and operational data")
      .id("mop_1_1_1")
      .naable();

    // builder.text(
    //   "**JCC2 task:** Data available to the end user is adequate for decision making and analysis."
    // );

    // MOP 1.1.1 Observation runs - Using DataTable
    builder
      .field("datatable", "MOP 1.1.1 Observation Runs")
      .id("data")
      .columns([
        {
          id: "run",
          label: "Run",
          type: "number",
          required: true,
          validation: { min: 1 },
          autoIndex: true,
        },
        {
          id: "application_used",
          label: "Application Used",
          type: "select",
          required: true,
          options: jcc2Applications.map((app) => app.name),
        },
        {
          id: "data_gathering_supported",
          label: "Data Gathering Supported",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "impact_assessment_supported",
          label: "Impact Assessment Supported",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "prioritization_supported",
          label: "Prioritization Supported",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "data_sufficiency",
          label: "Data Sufficiency",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [],
        rows: [
          {
            run: "1",
            application_used: "",
            data_gathering_supported: "",
            impact_assessment_supported: "",
            prioritization_supported: "",
            data_sufficiency: "",
          },
        ],
      })
      .end();

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

    // MOP 1.1.2 Observation runs - Using DataTable
    builder
      .field("datatable", "MOP 1.1.2 Observation Runs")
      .id("mop_1_1_2_runs")
      .columns([
        {
          id: "run",
          label: "Run",
          type: "number",
          required: true,
          validation: { min: 1 },
          autoIndex: true,
        },
        {
          id: "application_used",
          label: "Application Used",
          type: "text",
          required: true,
        },
        {
          id: "tagging_execution",
          label: "Tagging Execution",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "cross_application_correlation",
          label: "Cross-Application Correlation",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "tag_consistency",
          label: "Tag Consistency",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [],
        rows: [
          {
            run: "1",
            application_used: "",
            tagging_execution: "",
            cross_application_correlation: "",
            tag_consistency: "",
          },
        ],
      })
      .end();

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

    // MOP 1.1.3 Observation runs - Using DataTable
    builder
      .field("datatable", "MOP 1.1.3 Observation Runs")
      .id("mop_1_1_3_runs")
      .columns([
        {
          id: "run",
          label: "Run",
          type: "number",
          required: true,
          validation: { min: 1 },
          autoIndex: true,
        },
        {
          id: "application_used",
          label: "Application Used",
          type: "text",
          required: true,
        },
        {
          id: "status_change_visibility",
          label: "Status Change Visibility",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "detailed_information_access",
          label: "Detailed Information Access",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "asi_incident_correlation",
          label: "ASI/Incident Correlation",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "event_creation_capability",
          label: "Event Creation Capability",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [],
        rows: [
          {
            run: "1",
            application_used: "",
            status_change_visibility: "",
            detailed_information_access: "",
            asi_incident_correlation: "",
            event_creation_capability: "",
          },
        ],
      })
      .end();

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

    // MOP 1.1.4 Observation runs - Using DataTable
    builder
      .field("datatable", "MOP 1.1.4 Observation Runs")
      .id("mop_1_1_4_runs")
      .columns([
        {
          id: "run",
          label: "Run #",
          type: "number",
          required: true,
          validation: { min: 1 },
          autoIndex: true,
        },
        {
          id: "application_used",
          label: "Application Used",
          type: "text",
          required: true,
        },
        {
          id: "report_created",
          label: "Report Created",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "useful",
          label: "Useful",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "accurate",
          label: "Accurate",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
        {
          id: "exportable",
          label: "Exportable",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [],
        rows: [
          {
            run: "1",
            application_used: "",
            report_created: "",
            useful: "",
            accurate: "",
            exportable: "",
          },
        ],
      })
      .end();

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

    // MOP 1.1.5 Observation runs - Using DataTable
    builder
      .field("datatable", "MOP 1.1.5 Observation Runs")
      .id("mop_1_1_5_runs")
      .columns([
        {
          id: "run",
          label: "Run #",
          type: "number",
          required: true,
          validation: { min: 1 },
          autoIndex: true,
        },
        {
          id: "application_used",
          label: "Application Used",
          type: "text",
          required: true,
        },
        {
          id: "data_origin",
          label: "Data Origin",
          type: "text",
          required: true,
        },
        {
          id: "data_destination",
          label: "Data Destination",
          type: "text",
          required: true,
        },
        {
          id: "reason",
          label: "Reason",
          type: "text",
          required: true,
        },
        {
          id: "successful",
          label: "Successful",
          type: "radio",
          required: true,
          options: ["Yes", "No", "NA"],
        },
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [],
        rows: [
          {
            run: "1",
            application_used: "",
            data_origin: "",
            data_destination: "",
            reason: "",
            successful: "",
          },
        ],
      })
      .end();

    addStandardTaskQuestions(builder, "mop_1_1_5");

    // Add remaining sections summary
    builder
      .section("Additional MOP Sections")
      .id("additional_mop")
      .text(
        "**Note:** This demonstration focuses on converting the repetitive run/iteration sections to DataTable format. The remaining MOP sections (1.2.1 through 2.4.1) and MOS sections would follow the same pattern, replacing individual field rows with DataTable fields for improved data entry and organization."
      )
      .text(
        "**Benefits of DataTable Implementation:**\n" +
          "• Reduced form complexity - from hundreds of individual fields to organized tables\n" +
          "• Better matches the visual layout shown in the PDF screenshots\n" +
          "• Dynamic row addition - users can add runs as needed\n" +
          "• Improved CSV export - data is properly structured in tabular format\n" +
          "• Enhanced user experience - familiar table interface for data entry"
      );

    // Test Participant Interview Section (keeping original format)
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
