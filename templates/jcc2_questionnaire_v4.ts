import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/index";

// Helper data for repetitive sections
const operationalExperienceTopics = [
  "Cyber Operations",
  "Your Current Role",
  "JCC2 Experience",
];

const specificJcc2AppExperience = [
  "A2IT",
  "CAD",
  "Codex",
  "Crucible",
  "Cyber 9-Line",
  "Dispatch",
  "JCC2 Cyber Ops",
  "JCC2-Readiness",
  "MADSS",
  "Rally",
  "REDMAP",
  "SigAct",
  "Threat Hub",
  "Triage",
  "Unity",
];

const allJcc2Apps = [
  "JCC2 Cyber-Ops",
  "JCC2 Readiness",
  "A2IT",
  "CAD",
  "Codex",
  "Crucible",
  "Cyber 9-Line",
  "Dispatch",
  "MADSS",
  "Rally",
  "Redmap",
  "SigAct",
  "Threat Hub",
  "Triage",
  "Unity",
];

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

const effectivenessScale = {
  options: [
    "Completely Ineffective",
    "Moderately Ineffective",
    "Slightly Ineffective",
    "Slightly Effective",
    "Moderately Effective",
    "Completely Effective",
    "Not Applicable",
  ],
  default: "Not Applicable",
};

const experienceLevels = {
  options: ["< 1 Year", "1-3 Years", "3-5 Years", "> 5 Years", "NA"],
  default: "NA",
};

const frequencyOfUse = ["Never", "Daily", "Weekly", "Monthly"];
const classificationOptions = ["NIPR", "SIPR", "JWICS"];
const yesNo = ["Yes", "No"];

const agreementScale = [
  "Strongly Disagree",
  "Disagree",
  "Slightly Disagree",
  "Neutral",
  "Slightly Agree",
  "Agree",
  "Strongly Agree",
];

// Security environment options for collaborative planning
const securityEnvironments = ["NIPR", "SIPR", "JWICS"];

/**
 * Helper function to convert strings to an id
 * @param str
 * @returns str converted to id
 */
function toId(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/ /g, "_");
}

/**
 * Programmatic template for the JCC2 User Questionnaire PDF (V4).
 * This is a comprehensive version that includes ALL sections from the original questionnaire.
 */
export class JCC2UserQuestionnaireV4 {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("JCC2 User Questionnaire V4")
      .description(
        "A comprehensive programmatic version of the JCC2 User Questionnaire, including all sections from the original PDF."
      )
      .author("Nathan Gaul")
      .version("4.0.0")
      .tags("questionnaire", "jcc2", "feedback", "military", "v4", "complete");

    // Page 1: User and Role Information
    builder
      .section("User Information")
      .id("user_information")
      .field("text", "Event")
      .id("event")
      .required()
      .end()
      .field("date", "Date")
      .id("date")
      .required()
      .defaultValue(new Date().toISOString().split("T")[0])
      .end()
      .field("text", "Rank/Name")
      .id("rank_name")
      .required()
      .end()
      .field("text", "Unit")
      .id("unit")
      .end()
      .field("email", "Email")
      .id("email")
      .end()
      .field("tel", "Phone")
      .id("phone")
      .end();

    builder
      .section("Role and Echelon")
      .id("role_and_echelon")
      .field("radio", "Status of Current Role")
      .id("current_role_status")
      .required()
      .options(["Active Duty", "Guard/Reserve", "DoD Civilian", "Contractor"])
      .layout("horizontal")
      .end()
      .field("radio", "Current Cyber Operator")
      .id("is_cyber_operator")
      .required()
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field("text", "Cyber Operations Division/Team")
      .id("cyber_ops_division_team")
      .required()
      .conditional("is_cyber_operator", "equals", ["Yes"])
      .end()
      .field("checkbox", "Echelon You Work Within")
      .id("echelon")
      .multiple()
      .required()
      .options(["Strategic", "Operational", "Tactical"])
      .layout("horizontal")
      .end()
      .field("checkbox", "Duties You Perform")
      .id("duties")
      .multiple()
      .required()
      .options([
        "Offensive Cyber Operations",
        "Defensive Cyber Operations",
        "Mission Planning",
        "Internal Defense Measures",
        "Ticket Creation",
        "Other(s)",
      ])
      .layout("horizontal")
      .end()
      .field("text", "Other Duties")
      .id("other_duties")
      .required()
      .conditional("duties", "contains", ["Other(s)"])
      .end();

    // Page 1-2: Experience Grids (Grouped)
    builder
      .section("Operational & JCC2 Experience")
      .id("operational_jcc2_experience");
    operationalExperienceTopics.forEach((topic) => {
      builder
        .field("radio", topic)
        .id(`exp_${toId(topic)}`)
        .options(experienceLevels.options)
        .defaultValue(experienceLevels.default)
        .layout("horizontal")
        .grouping(true, "operational_experience")
        .required()
        .end();
    });

    specificJcc2AppExperience.forEach((app) => {
      builder
        .field("radio", app)
        .id(`exp_app_${toId(app)}`)
        .options(experienceLevels.options)
        .defaultValue(experienceLevels.default)
        .layout("horizontal")
        .grouping(true, "jcc2_app_experience")
        .required()
        .end();
    });

    // Page 2: JCC2 App Usage Grid (Grouped)
    builder.section("JCC2 Application Usage").id("jcc2_application_usage");
    allJcc2Apps.forEach((app) => {
      const appId = `usage_${toId(app)}`;
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `${app} - Frequency`)
        .id(`${appId}_frequency`)
        .options(frequencyOfUse)
        .layout("horizontal")
        .grouping(true, `usage_frequency_group`)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("checkbox", `${app} - Classification`)
        .id(`${appId}_classification`)
        .multiple()
        .options(classificationOptions)
        .layout("horizontal")
        .grouping(true, `usage_classification_group`)
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("radio", `${app} - Training`)
        .id(`${appId}_training_received`)
        .options(yesNo)
        .layout("horizontal")
        .grouping(true, `usage_training_group`)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("text", `Specify ${app} Training Type`)
        .id(`${appId}_training_type`)
        .required()
        .conditional(`${appId}_training_received`, "equals", ["Yes"])
        .end();
    });

    // MOP 1.1.1: Integrate intelligence and operational data
    builder
      .section("MOP 1.1.1: Integrate intelligence and operational data")
      .id("mop_1_1_1");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Effectiveness of ${app} in providing intelligence data`
        )
        .id(`${toId(app)}_intelligence_data_provided`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "intelligence_data_provided")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
      builder
        .field(
          "radio",
          `Effectiveness of ${app} intelligence data for completion of my role`
        )
        .id(`${toId(app)}_intelligence_data_completion_of_role`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "intelligence_data_completion_of_role")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", `Overall JCC2 Effectiveness Rating - Intelligence Data`)
      .id("intelligence_data_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "overall_intelligence_data")
      .required()
      .end();

    // MOS 1.1.2: Tagging objects of interest
    builder
      .section(
        "MOS 1.1.2: Tagging objects of interest and enabling correlation of objects"
      )
      .id("mos_1_1_2");

    ["MADSS", "Rally", "SigAct", "Threat Hub"].forEach((app) => {
      const appId = `tagging_${toId(app)}`;
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Rate the utility of ${app} for Object Tagging`)
        .id(`${appId}_tagging`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "tagging")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("radio", `Rate the utility of ${app} for Object Correlation`)
        .id(`${appId}_correlation`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "correlation")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    builder
      .field(
        "radio",
        "Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability"
      )
      .id("tagging_correlation_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "tagging_correlation_overall")
      .required()
      .end();

    // MOP 1.1.3: Identify the cause of an operational status change (MADSS)
    builder
      .section(
        "MOP 1.1.3: Identify the cause of an operational status change (MADSS)"
      )
      .id("mop_1_1_3")
      .conditional("exp_app_madss", "not_equals", ["NA"]);
    const madssQuestions = [
      "MADSS has the capability to notice a change in operational change in cyber asset status.",
      "MADSS has the capability to identify the cause of the operational change in cyber asset status.",
      "MADSS has the capability to search for the cause of the operational change in cyber asset status.",
      "MADSS has the capability to manually change the status of the operational change in cyber assets.",
      "MADSS has the capability to manually identify and correct inaccurate status changes.",
    ];
    madssQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`madss_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "operational_status_change")
        .required()
        .end();
    });
    builder
      .field(
        "radio",
        "Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability"
      )
      .id("operational_status_change_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "operational_status_change_overall")
      .required()
      .end();

    // MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export
    builder
      .section("MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export")
      .id("mops_1_1_4_1_2_3_1_3_6_2_3_3");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Reports generated by ${app} are accurate.`)
        .id(`${toId(app)}_reports_accurate`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_accuracy")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Reports generated by ${app} can be exported to different formats.`
        )
        .id(`${toId(app)}_reports_export`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_export")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Reports generated by ${app} can be customized.`)
        .id(`${toId(app)}_reports_customized`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_customization")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Reports generated by ${app} allow for data to be sorted.`
        )
        .id(`${toId(app)}_reports_sorted`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_sorting")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Reports generated by ${app} allow for data to be filtered.`
        )
        .id(`${toId(app)}_reports_filtered`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_filtering")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} applications provide reports that are relevant to my job role.`
        )
        .id(`${toId(app)}_reports_relevant`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_relevance")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Reporting through the ${app} applications saves me time in my job role.`
        )
        .id(`${toId(app)}_reports_saves_time`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "reports_time_saving")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "Overall Effectiveness rating for Reporting capability")
      .id("reports_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "reports_overall")
      .required()
      .end();

    // MOP 1.1.5: Information sharing among joint forces
    builder
      .section("MOP 1.1.5: Information sharing among joint forces")
      .id("mop_1_1_5");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Data created in ${app} can be shared with other Joint Forces members within JCC2 without the need for external applications.`
        )
        .id(`${toId(app)}_info_sharing`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "info_sharing")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field(
        "radio",
        `Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability.`
      )
      .id("info_sharing_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "info_sharing_overall")
      .required()
      .end();

    // MOP 1.2.1: Threat Detection (TASC)
    builder.section("MOP 1.2.1: Threat Detection").id("mop_1_2_1");
    tascApps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `${app}`)
        .id(`${toId(app)}_threat_detection_accuracy`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "threat_detection_accuracy",
          "JCC2 provided applications are accurate in detecting threats."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("radio", `${app}`)
        .id(`${toId(app)}_threat_detection_action`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "threat_detection_action",
          "Data provided by JCC2 allows me to take action or make decisions about threats."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", `JCC2 Overall`)
      .id("threat_detection_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "threat_detection_overall",
        "Overall Effectiveness rating: Rate the effectiveness of JCC2 facilitating the capability."
      )
      .required()
      .end();

    // MOP 1.2.2: Threat assessment (Crucible)
    builder
      .section("MOP 1.2.2: Threat assessment (Crucible)")
      .id("mop_1_2_2")
      .conditional("exp_app_crucible", "not_equals", ["NA"]);
    const crucibleEffectivenessQuestions = [
      "JCC2 provides data to fully assess cyber threats.",
      "Data provided by JCC2 allows me to identify which threats are relevant to my area of responsibility.",
      "Crucible assists threat assessment with automatic analysis.",
      "Crucible enables decisions about the prioritization of threats.",
    ];
    crucibleEffectivenessQuestions.forEach((question, index) => {
      builder
        .field("radio", "Crucible")
        .id(`threat_assessment_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, `threat_assessment_${index + 1}`, question)
        .required()
        .end();
    });
    builder
      .field("radio", `JCC2 Overall`)
      .id("threat_assessment_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "threat_assessment_overall",
        "Overall Effectiveness Rating. Rate the effectiveness of JCC2 facilitating the capability."
      )
      .required()
      .end();

    // MOS 1.3.1: Common Operating Picture (COP) - COMPLETE IMPLEMENTATION
    builder
      .section("MOS 1.3.1: Common Operating Picture (COP)")
      .id("mos_1_3_1");
    
    // COP Relevance
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays information that is relevant to my duties.`
        )
        .id(`${toId(app)}_cop_relevant`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_relevance")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Accuracy  
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays information that is accurate.`
        )
        .id(`${toId(app)}_cop_accurate`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_accuracy")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Completeness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays information that is complete.`
        )
        .id(`${toId(app)}_cop_complete`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_completeness")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Timeliness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays information that is timely.`
        )
        .id(`${toId(app)}_cop_timely`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_timeliness")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Visual Clarity
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays information that is not visually cluttered.`
        )
        .id(`${toId(app)}_cop_not_cluttered`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_visual_clarity")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Search/Filter/Sort Capabilities
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP has adequate sort, filter, and search capabilities.`
        )
        .id(`${toId(app)}_cop_search_capabilities`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_search_filter_sort")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Customization
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The ${app} COP displays allow for customization.`
        )
        .id(`${toId(app)}_cop_customizable`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cop_customization")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Overall Effectiveness
    builder
      .field("radio", "Overall COP Effectiveness Rating")
      .id("cop_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "cop_overall")
      .required()
      .end();

    // MOP 1.3.2: Dependency map for locating downstream assets (MADSS)
    builder
      .section(
        "MOP 1.3.2: Dependency map for locating downstream assets (MADSS)"
      )
      .id("mop_1_3_2")
      .conditional("exp_app_madss", "not_equals", ["NA"]);
    const dependencyMapQuestions = [
      "The dependency map information within MADSS is complete.",
      "The dependency map can be used for determining what services are provided by information technology and cyber assets.",
      "The dependency map simulation mode is useful for determining what assets would be affected during an outage.",
    ];
    dependencyMapQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`dependency_map_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "Overall Dependency Map Effectiveness Rating")
      .id("dependency_map_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "dependency_map_overall")
      .required()
      .end();

    // MOP 1.3.3: Event creation
    builder.section("MOP 1.3.3: Event creation").id("mop_1_3_3");
    const eventCreationApps = [
      "SigAct",
      "Rally", 
      "MADSS",
      "Cyber 9-Line",
      "A2IT",
    ];
    eventCreationApps.forEach((app) => {
      builder
        .section(`MOP 1.3.3: Event creation (${app})`)
        .id(`mop_1_3_3_${toId(app)}`)
        .conditional(`exp_app_${toId(app)}`, "not_equals", ["NA"]);
      const eventCreationQuestions = [
        "Event creation is intuitive.",
        "The applications provide enough data elements to make detailed incident tickets.",
        "The applications provide a DISA tracking number for created incidents.",
      ];
      eventCreationQuestions.forEach((question, index) => {
        builder
          .field("radio", question)
          .id(`event_creation_${toId(app)}_${index + 1}`)
          .options(effectivenessScale.options)
          .layout("horizontal")
          .defaultValue(effectivenessScale.default)
          .required()
          .end();
      });
    });
    builder
      .field("radio", "Overall Event Creation Effectiveness Rating")
      .id("event_creation_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "event_creation_overall")
      .required()
      .end();

    // MOP 1.3.4: Alerts aid users in maintaining situational awareness - COMPLETE IMPLEMENTATION
    builder
      .section(
        "MOP 1.3.4: Alerts aid users in maintaining situational awareness"
      )
      .id("mop_1_3_4");
    
    // Alert Customization
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Alerts can be customized to stay informed of changes for incidents they are following in ${app}.`
        )
        .id(`${toId(app)}_alerts_customized`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "alerts_customization")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Current Event Awareness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Alerts keep users informed about current events within their job role in ${app}.`
        )
        .id(`${toId(app)}_alerts_current_events`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "alerts_current_events")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Timeliness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Alerts received from ${app} are timely.`
        )
        .id(`${toId(app)}_alerts_timely`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "alerts_timeliness")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Configurability
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Alerts received from ${app} are configurable.`
        )
        .id(`${toId(app)}_alerts_configurable`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "alerts_configurability")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alerts Overall Effectiveness
    builder
      .field("radio", "Overall Alerts Effectiveness Rating")
      .id("alerts_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "alerts_overall")
      .required()
      .end();

    // MOP 1.3.5: Data flow across different security levels
    builder
      .section("MOP 1.3.5: Data flow across different security levels")
      .id("mop_1_3_5");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Most of my work with ${app} occurs within what environment?`
        )
        .id(`${toId(app)}_environment`)
        .options(["NIPR", "SIPR", "JWICS", "Not Applicable"])
        .layout("horizontal")
        .grouping(true, "environment")
        .defaultValue("Not Applicable")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "Overall Data Flow Security Effectiveness Rating")
      .id("data_flow_security_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "data_flow_security_overall")
      .required()
      .end();

    // MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)
    builder
      .section(
        "MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)"
      )
      .id("mop_2_1_1")
      .conditional("exp_app_jcc2readiness", "not_equals", ["NA"]);
    const readinessQuestions = [
      "JCC2 Readiness allows me to see personnel with required training.",
      "JCC2 Readiness allows me to see personnel with required abilities.",
      "JCC2 Readiness allows me to see personnel with required certifications.",
      "Information about force disposition from JCC2 Readiness is accurate.",
      "Information about force disposition from JCC2 Readiness is complete.",
    ];
    readinessQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`cyber_force_assessment_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "Overall Cyber Force Assessment Effectiveness Rating")
      .id("cyber_force_assessment_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "cyber_force_assessment_overall")
      .required()
      .end();

    // MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)
    builder
      .section("MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)")
      .id("mop_2_1_2")
      .conditional("exp_app_jcc2_cyber_ops", "not_equals", ["NA"]);
    const cyberOpsTargetingQuestions = [
      "JCC2 Cyber-Ops enables the user to create new target lists.",
      "JCC2 Cyber-Ops enables the user to manage existing target lists.",
      "Target list data is able to be exported from JCC2 Cyber-Ops.",
      "Target can be annotated with objectives and priorities within JCC2 Cyber-Ops.",
      "Path to target can be displayed within JCC2 Cyber-Ops.",
      "Potential collateral damage risks can be viewed within JCC2 Cyber-Ops.",
    ];
    cyberOpsTargetingQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`target_lists_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "Overall Target List Management Effectiveness Rating")
      .id("target_lists_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "target_lists_overall")
      .required()
      .end();

    // MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)
    builder
      .section("MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)")
      .id("mop_2_1_7")
      .conditional("exp_app_jcc2_cyber_ops", "not_equals", ["NA"]);
    builder
      .field(
        "radio",
        "JCC2 Cyber-Ops prevents the assignment of personnel to more than one mission that would conflict."
      )
      .id("force_deconfliction")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .defaultValue(effectivenessScale.default)
      .required()
      .end();
    builder
      .field("radio", "Overall Force Deconfliction Effectiveness Rating")
      .id("force_deconfliction_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "force_deconfliction_overall")
      .required()
      .end();

    // MOP 2.1.9: Joint forces to perform collaborative planning - COMPLETE IMPLEMENTATION
    builder
      .section("MOP 2.1.9: Joint forces to perform collaborative planning")
      .id("mop_2_1_9");
    const planningApps = ["JCC2 Cyber Ops", "JCC2 Readiness"];
    planningApps.forEach((app) => {
      builder
        .section(`MOP 2.1.9: Collaborative Planning (${app})`)
        .id(`mop_2_1_9_${toId(app)}`)
        .conditional(`exp_app_${toId(app)}`, "not_equals", ["NA"]);
      
      // Collaborative planning tools
      builder
        .field("radio", `${app} provides tool for collaborative planning.`)
        .id(`${toId(app)}_collaborative_planning_tool`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();
      
      // Courses of action development
      builder
        .field(
          "radio",
          `${app} provided applications allow for the development of courses of action.`
        )
        .id(`${toId(app)}_courses_of_action`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();

      // Low latency performance across security environments
      securityEnvironments.forEach((env) => {
        builder
          .field(
            "radio",
            `When using ${app} for planning, actions with the application occur with low latency in ${env}.`
          )
          .id(`${toId(app)}_low_latency_${toId(env)}`)
          .options(effectivenessScale.options)
          .layout("horizontal")
          .grouping(true, `${toId(app)}_latency_environments`)
          .defaultValue(effectivenessScale.default)
          .required()
          .end();
      });
    });
    builder
      .field("radio", "Overall Collaborative Planning Effectiveness Rating")
      .id("collaborative_planning_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "collaborative_planning_overall")
      .required()
      .end();

    // MOP 2.3.1: Mission Change orders can be completed within Dispatch
    builder
      .section(
        "MOP 2.3.1: Mission Change orders can be completed within Dispatch"
      )
      .id("mop_2_3_1")
      .conditional("exp_app_dispatch", "not_equals", ["NA"]);
    const dispatchQuestions = [
      "Dispatch enables the creation of orders.",
      "Dispatch enables changes to orders to be completed.",
      "Dispatch enables collaborative order generation.",
      "Dispatch enables compliance tracking of generated orders.",
      "Orders generated within Dispatch are accurate.",
    ];
    dispatchQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`mission_change_orders_${index + 1}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "Overall Mission Change Orders Effectiveness Rating")
      .id("mission_change_orders_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "mission_change_orders_overall")
      .required()
      .end();

    // MOP 2.3.2: JCC2 displays force disposition
    builder
      .section("MOP 2.3.2: JCC2 displays force disposition")
      .id("mop_2_3_2");
    const dispositionApps = ["JCC2 Readiness", "JCC2 Cyber Ops"];
    dispositionApps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `Rate the effectiveness of ${app} facilitating the desired task.`
        )
        .id(`${toId(app)}_force_disposition`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "Overall Force Disposition Display Effectiveness Rating")
      .id("force_disposition_display_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "force_disposition_display_overall")
      .required()
      .end();

    // MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops) - COMPLETE IMPLEMENTATION
    builder
      .section(
        "MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops)"
      )
      .id("mop_2_4_1")
      .conditional("exp_app_jcc2_cyber_ops", "not_equals", ["NA"]);
    builder
      .field(
        "radio",
        "Mission progression can be measured within JCC2 Cyber-Ops."
      )
      .id("mission_progress_assessment")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .defaultValue(effectivenessScale.default)
      .required()
      .end();
    builder
      .field(
        "textarea",
        "Describe any workarounds used for monitoring status of missions if any workarounds are used."
      )
      .id("workarounds")
      .end();
    builder
      .field(
        "checkbox",
        "If workarounds are used what is the reason for use of them?"
      )
      .id("workaround_reason")
      .multiple()
      .options([
        "Missing capabilities",
        "Partially functional capabilities",
        "External application works better",
      ])
      .end();
    builder
      .field("textarea", "Provide Details on why workaround is used:")
      .id("workaround_details")
      .conditional("workaround_reason", "contains", [
        "Missing capabilities",
        "Partially functional capabilities",
        "External application works better",
      ])
      .end();
    // ADDED: Missing overall effectiveness rating
    builder
      .field("radio", "Overall Mission Progress Assessment Effectiveness Rating")
      .id("mission_progress_assessment_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "mission_progress_assessment_overall")
      .required()
      .end();

    // MOS 3.2.1: User rating of JCC2 training
    builder.section("MOS 3.2.1: User rating of JCC2 training").id("mos_3_2_1");
    builder
      .field("radio", "Did you receive any training before you used JCC2?")
      .id("initial_training")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end();
    builder
      .field(
        "textarea",
        "No, please concisely describe any problems or issues and the operational impact:"
      )
      .id("initial_training_no")
      .conditional("initial_training", "equals", ["No"])
      .end();
    builder
      .field("checkbox", "What format of training have you received?")
      .id("training_format")
      .multiple()
      .options([
        "Instructor-Lead Training",
        "Video-Based Training",
        "On-The-Job Training",
        "None",
      ])
      .end();
    builder
      .field(
        "radio",
        "Did you receive any supplemental training to aid your duties?"
      )
      .id("supplemental_training")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end();
    builder
      .field(
        "textarea",
        "No, please concisely describe any problems or issues and the operational impact:"
      )
      .id("supplemental_training_no")
      .conditional("supplemental_training", "equals", ["No"])
      .end();
    builder
      .field("radio", "Do you want (more) training?")
      .id("request_training")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end();
    builder
      .field(
        "textarea",
        "Yes, please concisely describe any problems or issues and the operational impact:"
      )
      .id("request_training_yes")
      .conditional("request_training", "equals", ["Yes"])
      .end();
    const trainingAssessmentQuestions = [
      "All of the information covered was relevant to how I interact with the system.",
      "The training prepared me to easily use the system to accomplish my mission.",
      "Training accurately portrayed operations in the field.",
      "The training prepared me to properly interact with the system.",
      "Training prepared me to solve common problems.",
      "Training adequately covered all important ways I interact with the system.",
    ];
    trainingAssessmentQuestions.forEach((question, index) => {
      builder
        .field("radio", question)
        .id(`training_assessment_${index + 1}`)
        .options(agreementScale)
        .layout("horizontal")
        .defaultValue("Neutral")
        .required()
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Summative Training Rating for ${app}`)
        .id(`${toId(app)}_training_rating`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "training_rating")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("training_additional_observations")
      .end();

    // MOS 3.2.2: User rating of JCC2 documentation
    builder
      .section("MOS 3.2.2: User rating of JCC2 documentation")
      .id("mos_3_2_2");
    builder
      .field(
        "radio",
        "Rate the effectiveness of any training documentation received. If none was received, select NA."
      )
      .id("documentation_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .defaultValue(effectivenessScale.default)
      .end();
    builder
      .field("checkbox", "What format was JCC2 documentation delivered in?")
      .id("documentation_format")
      .multiple()
      .options([
        "Paper document",
        "External video",
        "Video embedded in application",
        "Step-by-step SOP",
        "Internal training document",
        "None",
      ])
      .end();
    builder
      .field("radio", "Does the provided documentation meet your needs?")
      .id("documentation_completeness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .defaultValue(effectivenessScale.default)
      .end();
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Summative Documentation Rating for ${app}`)
        .id(`${toId(app)}_documentation_rating`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "documentation_rating")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // MOP 3.2.3: User rating of JCC2 support (help desk)
    builder
      .section("MOP 3.2.3: User rating of JCC2 support (help desk)")
      .id("mop_3_2_3");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `Help desk tickets can be submitted for ${app}.`)
        .id(`${toId(app)}_submit_ticket`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "submit_ticket")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `A confirmation of a ticket being submitted is received when contacting the help desk for ${app}.`
        )
        .id(`${toId(app)}_confirm_ticket`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "confirm_ticket")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field(
          "radio",
          `The help desk is able to successfully fix my issues when contacted for ${app}.`
        )
        .id(`${toId(app)}_fix_issues`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "fix_issues")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `exp_app_${toId(app)}`;
      builder
        .field("radio", `The help desk is responsive for ${app}.`)
        .id(`${toId(app)}_responsive`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "responsive")
        .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field(
        "radio",
        "Summative Support Rating. Rate the effectiveness of JCC2 support."
      )
      .id("summative_support_rating")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .defaultValue(effectivenessScale.default)
      .end();
    builder
      .field(
        "textarea",
        "Additional observations. Provide any additional observations (positive or negative):"
      )
      .id("support_additional_observations")
      .end();

    // User evaluation of overall system usability (SUS Questionnaire)
    builder
      .section("User evaluation of overall system usability")
      .id("user_evaluation_overall_system_usability");
    const usabilityItems = [
      {
        id: "usability_like_to_use",
        label: "I think that I would like to use JCC2 frequently",
      },
      {
        id: "usability_unnecessarily_complex",
        label: "I found JCC2 unnecessarily complex.",
      },
      { id: "usability_easy_to_use", label: "I thought JCC2 was easy to use." },
      {
        id: "usability_need_expert_support",
        label:
          "I think that I would need the support of an expert to be able to use JCC2.",
      },
      {
        id: "usability_functions_well_integrated",
        label: "I found the various functions in JCC2 to be well integrated",
      },
      {
        id: "usability_quick_to_learn",
        label: "I would imagine most people could quickly learn to use JCC2",
      },
      {
        id: "usability_cumbersome_to_use",
        label: "I found JCC2 very cumbersome to use",
      },
      {
        id: "usability_confident_using",
        label: "I felt very confident using JCC2",
      },
      {
        id: "usability_needed_to_learn_alot",
        label:
          "I needed to learn a lot of things before I could effectively use JCC2",
      },
      {
        id: "usability_liked_interface",
        label: "I liked the user interface of JCC2",
      },
    ];
    usabilityItems.forEach((item) => {
      builder
        .field("range", item.label)
        .id(item.id)
        .min(1)
        .max(6)
        .defaultValue(4)
        .required()
        .end();
    });

    // User Evaluation of Overall System Suitability
    builder
      .section("User Evaluation of Overall System Suitability")
      .id("user_evaluation_overall_system_suitability")
      .field(
        "radio",
        "Do you experience issues with data exchange or functional compatibility between JCC2 applications?"
      )
      .id("eval_internal_interop")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific applications involved, and the operational impact:"
      )
      .id("eval_internal_interop_details")
      .required()
      .conditional("eval_internal_interop", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues integrating data from external sources into JCC2?"
      )
      .id("eval_external_integ")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific data sources involved, and the operational impact:"
      )
      .id("eval_external_integ_details")
      .required()
      .conditional("eval_external_integ", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues with JCC2's compatibility with legacy software packages used in your operations?"
      )
      .id("eval_legacy_compat")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific legacy systems involved, and the operational impact:"
      )
      .id("eval_legacy_compat_details")
      .required()
      .conditional("eval_legacy_compat", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues sharing information up the chain of command or with other teams within the JCC2?"
      )
      .id("eval_info_sharing")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please concisely describe any problems or issues and the operational impact:"
      )
      .id("eval_info_sharing_details")
      .required()
      .conditional("eval_info_sharing", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience performance slowdowns within JCC2 that negatively impact your ability to complete tasks efficiently?"
      )
      .id("eval_performance")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the specific situations where slowdowns occur, the perceived cause (if known), and the operational impact:"
      )
      .id("eval_performance_details")
      .required()
      .conditional("eval_performance", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues accessing specific JCC2 databases or applications due to permission restrictions?"
      )
      .id("eval_access_control")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the specific resources you are unable to access and the operational impact:"
      )
      .id("eval_access_control_details")
      .required()
      .conditional("eval_access_control", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Are the current role-based access controls within JCC2 appropriate for your operational needs?"
      )
      .id("eval_rbac")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("Yes")
      .end()
      .field("textarea", "If no, please explain why and suggest improvements:")
      .id("eval_rbac_details")
      .required()
      .conditional("eval_rbac", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Is it clear who to contact to request changes to access permissions?"
      )
      .id("eval_access_requests")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("Yes")
      .end()
      .field(
        "textarea",
        "If no, please explain the difficulties you have encountered:"
      )
      .id("eval_access_requests_details")
      .required()
      .conditional("eval_access_requests", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Have you previously submitted change or feature requests to the JCC2 development teams or Program Office?"
      )
      .id("eval_feature_requests")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "radio",
        "Are there any changes or improvements you would like to see implemented in JCC2?"
      )
      .id("eval_improvements")
      .options(yesNo)
      .layout("horizontal")
      .defaultValue("No")
      .end()
      .field(
        "textarea",
        'If you answered "Yes" to question b, please describe the desired changes or improvements in detail:'
      )
      .id("eval_improvements_details")
      .required()
      .conditional("eval_improvements", "equals", ["Yes"])
      .end()
      .field(
        "textarea",
        "Critical Issues. Please list any critical issues you feel must be resolved to significantly increase JCC2's effectiveness for your operations:"
      )
      .id("critical_issues")
      .end()
      .field(
        "textarea",
        "Shout Outs. Please list any features you encountered that greatly improved the speed, quality, or effectiveness of your duties."
      )
      .id("shout_outs")
      .end()
      .field(
        "textarea",
        "Final Thoughts. Are there any additional items you would like to address that have not been documented yet?"
      )
      .id("final_thoughts")
      .end();

    return builder.build();
  }
}