import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";

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
  "JCC2 Cyber Ops",
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
const yesNaNo = ["Yes", "NA", "No"];

const agreementScale = [
  "Strongly Disagree",
  "Disagree",
  "Slightly Disagree",
  "Neutral",
  "Slightly Agree",
  "Agree",
  "Strongly Agree",
];

const usabilityScale = [
  "Strongly Disagree",
  "Moderately Disagree",
  "Slightly Disagree",
  "Slightly Agree",
  "Moderately Agree",
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
      // .defaultValue(new Date().toISOString().split("T")[0])
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
      // .defaultValue("No")
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
        .grouping(true, "operational_experience", "Operational Experience")
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
        .grouping(true, "jcc2_app_experience", "JCC2 Application Experience")
        .required()
        .end();
    });

    // Page 2: JCC2 App Usage Grid (Grouped)
    builder.section("JCC2 Application Usage").id("jcc2_application_usage");
    allJcc2Apps.forEach((app) => {
      const appId = `${toId(app)}`;
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", `${app}`)
        .id(`frequency_${appId}`)
        .options(frequencyOfUse)
        .layout("horizontal")
        .grouping(
          true,
          "usage_frequency_group",
          "JCC2 Application Frequency of Use"
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("checkbox", `${app}`)
        .id(`classification_${appId}`)
        .multiple()
        .options(classificationOptions)
        .layout("horizontal")
        .grouping(
          true,
          `usage_classification_group`,
          "JCC2 Application Classification(s) Used"
        )
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("radio", `${app}`)
        .id(`training_received_${appId}`)
        .options(yesNo)
        .layout("horizontal")
        .grouping(
          true,
          `usage_training_group`,
          "JCC2 Application Training Received"
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("text", `Specify ${app} Training Type`)
        .id(`training_type_${appId}`)
        .required()
        .conditional(`training_received_${appId}`, "equals", ["Yes"])
        .end();
    });

    // MOP 1.1.1: Integrate intelligence and operational data
    builder
      .section("MOP 1.1.1: Integrate intelligence and operational data")
      .id("mop_1_1_1")
      .naable();
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`intelligence_data_provided_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "intelligence_data_provided",
          "JCC2 provides intelligence data within the applications."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
      builder
        .field("radio", app)
        .id(`intelligence_data_completion_of_role_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "intelligence_data_completion_of_role",
          "Data provided by JCC2 applications allows for the completion of my assigned roles."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("intelligence_data_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "overall_intelligence_data",
        "Overall JCC2 Effectiveness Rating - Intelligence Data"
      )
      .required()
      .end();

    // MOS 1.1.2: Tagging objects of interest
    builder
      .section(
        "MOS 1.1.2: Tagging objects of interest and enabling correlation of objects"
      )
      .id("mos_1_1_2")
      .naable();

    ["MADSS", "Rally", "SigAct", "Threat Hub"].forEach((app) => {
      const appId = `${toId(app)}`;
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`object_tagging_${appId}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "tagging",
          "Rate the utility of the application for Object Tagging"
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end()

        .field("radio", app)
        .id(`object_correlation_${appId}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "correlation",
          "Rate the utility of the application for Object Correlation"
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    builder
      .field("radio", "JCC2 Overall")
      .id("tagging_correlation_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "tagging_correlation_overall",
        "Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability"
      )
      .required()
      .end();

    // MOP 1.1.3: Identify the cause of an operational status change (MADSS)
    builder
      .section(
        "MOP 1.1.3: Identify the cause of an operational status change (MADSS)"
      )
      .id("mop_1_1_3")
      .conditional("exp_app_madss", "not_equals", ["NA"])
      .naable();
    const madssQuestions = [
      [
        "MADSS has the capability to notice a change in operational change in cyber asset status.",
        "notice_operational_status_change",
      ],
      [
        "MADSS has the capability to identify the cause of the operational change in cyber asset status.",
        "cause_operational_status_change",
      ],
      [
        "MADSS has the capability to search for the cause of the operational change in cyber asset status.",
        "search_operational_status_change",
      ],
      [
        "MADSS has the capability to manually change the status of the operational change in cyber assets.",
        "manually_change_operational_status",
      ],
      [
        "MADSS has the capability to manually identify and correct inaccurate status changes.",
        "manually_idenify_inaccurate_status_change",
      ],
    ];
    madssQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`${question[1]}_madss`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "operational_status_change")
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("operational_status_change_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "operational_status_change_overall",
        "Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability"
      )
      .required()
      .end();

    // MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export
    builder
      .section("MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export")
      .id("reporting_and_data_export")
      .naable();
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_accurate_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_accuracy",
          "Reports generated by JCC2 are accurate."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_export_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_export",
          "Reports generated by JCC2 can be exported to different formats."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_customizable_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_customization",
          "Reports generated by JCC2 can be customized."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_sortable_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_sorting",
          "Reports generated by JCC2 allow for data to be sorted."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_filtered_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_filtering",
          "Reports generated by JCC2 allow for data to be filtered."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_relevant_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_relevance",
          "The JCC2 applications provide reports that are relevant to my job role."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`reports_saves_time_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "reports_time_saving",
          "Reporting through the JCC2 applications saves me time in my job role."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("reports_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "reports_overall",
        "Overall Effectiveness rating for Reporting capability"
      )
      .required()
      .end();

    // MOP 1.1.5: Information sharing among joint forces
    builder
      .section("MOP 1.1.5: Information sharing among joint forces")
      .id("mop_1_1_5")
      .naable();
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`info_sharing_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "info_sharing",
          "Data created in JCC2 can be shared with other Joint Forces members within JCC2 without the need for external applications."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("info_sharing_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "info_sharing_overall",
        "Overall Effectiveness rating. Rate the effectiveness of JCC2 facilitating the capability."
      )
      .required()
      .end();

    // MOP 1.2.1: Threat Detection (TASC)
    builder.section("MOP 1.2.1: Threat Detection").id("mop_1_2_1").naable();
    tascApps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`threat_detection_accuracy_${toId(app)}`)
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

        .field("radio", app)
        .id(`threat_detection_action_${toId(app)}`)
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
      .field("radio", "JCC2 Overall")
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
      .conditional("exp_app_crucible", "not_equals", ["NA"])
      .naable();
    const crucibleEffectivenessQuestions = [
      [
        "JCC2 provides data to fully assess cyber threats.",
        "fully_assess_threats",
      ],
      [
        "Data provided by JCC2 allows me to identify which threats are relevant to my area of responsibility.",
        "identify_relevant_threats",
      ],
      [
        "Crucible assists threat assessment with automatic analysis.",
        "automatic_analysis",
      ],
      [
        "Crucible enables decisions about the prioritization of threats.",
        "threat_prioritization",
      ],
    ];
    crucibleEffectivenessQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`${question[1]}_crucible`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "threat_assessment")
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
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
      .id("mos_1_3_1")
      .naable();

    // COP Relevance
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_relevant_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_relevance",
          "The JCC2 COP displays information that is relevant to my duties."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Accuracy
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_accurate_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_accuracy",
          "The JCC2 COP displays information that is accurate."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Completeness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_complete_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_completeness",
          "The JCC2 COP displays information that is complete."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Timeliness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_timely_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_timeliness",
          "The JCC2 COP displays information that is timely."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Visual Clarity
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_not_cluttered_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_visual_clarity",
          "The JCC2 COP displays information that is not visually cluttered."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Search/Filter/Sort Capabilities
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_search_capabilities_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_search_filter_sort",
          "The JCC2 COP has adequate sort, filter, and search capabilities."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Customization
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`cop_customizable_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "cop_customization",
          "The JCC2 COP displays allow for customization."
        )
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // COP Overall Effectiveness
    builder
      .field("radio", "JCC2 Overall")
      .id("cop_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "cop_overall", "Overall COP Effectiveness Rating")
      .required()
      .end();

    // MOP 1.3.2: Dependency map for locating downstream assets (MADSS)
    builder
      .section(
        "MOP 1.3.2: Dependency map for locating downstream assets (MADSS)"
      )
      .id("mop_1_3_2")
      .conditional("exp_app_madss", "not_equals", ["NA"])
      .naable();
    const dependencyMapQuestions = [
      [
        "The dependency map information within MADSS is complete.",
        "dependency_map_complete",
      ],
      [
        "The dependency map can be used for determining what services are provided by information technology and cyber assets.",
        "dependency_map_services",
      ],
      [
        "The dependency map simulation mode is useful for determining what assets would be affected during an outage.",
        "dependency_map_simulation",
      ],
    ];
    dependencyMapQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`${question[1]}_madss`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "dependency_map")
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("dependency_map_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "dependency_map_overall",
        "Overall Dependency Map Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 1.3.3: Event creation
    builder.section("MOP 1.3.3: Event creation").id("mop_1_3_3").naable();
    const eventCreationApps = [
      "A2IT",
      "Cyber 9-Line",
      "MADSS",
      "SigAct",
      "Rally",
    ];
    const eventCreationQuestions = [
      ["Event creation is intuitive.", "intuitive"],
      [
        "The applications provide enough data elements to make detailed incident tickets.",
        "enough_data",
      ],
      [
        "The applications provide a DISA tracking number for created incidents.",
        "disa_number",
      ],
    ];
    eventCreationQuestions.forEach((question) => {
      eventCreationApps.forEach((app) => {
        builder
          .field("radio", `${app}`)
          .id(`${question[1]}_${toId(app)}`)
          .options(effectivenessScale.options)
          .conditional(`operational_jcc2_experience.exp_app_${toId(app)}`, "not_equals", ["NA"])
          .required()
          .layout("horizontal")
          .grouping(true, question[1], question[0])
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
      .id("mop_1_3_4")
      .naable();

    // Alert Customization
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`alerts_customized_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "alerts_customization",
          "Alerts can be customized to stay informed of changes for incidents they are following."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Current Event Awareness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`alerts_current_events_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "alerts_current_events",
          "Alerts keep users informed about current events within their job role."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Timeliness
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`alerts_timely_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "alerts_timeliness", "Alerts received are timely.")
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alert Configurability
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`alerts_configurable_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "alerts_configurability",
          "Alerts received are configurable."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Alerts Overall Effectiveness
    builder
      .field("radio", "JCC2 Overall")
      .id("alerts_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "alerts_overall", "Overall Alerts Effectiveness Rating")
      .required()
      .end();

    // MOP 1.3.5: Data flow across different security levels
    builder
      .section("MOP 1.3.5: Data flow across different security levels")
      .id("mop_1_3_5")
      .naable();

    // Environment usage
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`environment_${toId(app)}`)
        .options(["NIPR", "SIPR", "JWICS", "Not Applicable"])
        .layout("horizontal")
        .grouping(
          true,
          "security_environment_usage",
          "Most of my work with JCC2 occurs within what environment?"
        )
        // .defaultValue("Not Applicable")
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // Data flow effectiveness across security levels
    // Doesn't exist within the physical document but may need to be added
    // allJcc2Apps.forEach((app) => {
    //   const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
    //   builder
    //     .field("radio", app)
    //     .id(`data_flow_security_effectiveness_${toId(app)}`)
    //     .options(effectivenessScale.options)
    //     .layout("horizontal")
    //     .grouping(
    //       true,
    //       "data_flow_security_effectiveness",
    //       "Data flows appropriately across different security levels within JCC2 applications."
    //     )
    //     .required()
    //     .conditional(appConditionId, "not_equals", ["NA"])
    //     .end();
    // });

    builder
      .field("radio", "JCC2 Overall")
      .id("data_flow_security_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "data_flow_security_overall",
        "Overall Data Flow Security Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)
    builder
      .section(
        "MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)"
      )
      .id("mop_2_1_1")
      .conditional("exp_app_jcc2readiness", "not_equals", ["NA"])
      .naable();
    const readinessQuestions = [
      [
        "JCC2 Readiness allows me to see personnel with required training.",
        "see_personnel_training",
      ],
      [
        "JCC2 Readiness allows me to see personnel with required abilities.",
        "see_personnel_abilities",
      ],
      [
        "JCC2 Readiness allows me to see personnel with required certifications.",
        "see_personnel_certifications",
      ],
      [
        "Information about force disposition from JCC2 Readiness is accurate.",
        "force_disposition_accurate",
      ],
      [
        "Information about force disposition from JCC2 Readiness is complete.",
        "force_disposition_complete",
      ],
    ];
    readinessQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`${question[1]}_readiness`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "cyber_force_assessment")
        // .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("cyber_force_assessment_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "cyber_force_assessment_overall",
        "Overall Cyber Force Assessment Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)
    builder
      .section("MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)")
      .id("mop_2_1_2")
      .conditional("exp_app_jcc2cyberops", "not_equals", ["NA"])
      .naable();
    const cyberOpsTargetingQuestions = [
      [
        "JCC2 Cyber-Ops enables the user to create new target lists.",
        "create_new_target_lists",
      ],
      [
        "JCC2 Cyber-Ops enables the user to manage existing target lists.",
        "manage_existing_target_lists",
      ],
      [
        "Target list data is able to be exported from JCC2 Cyber-Ops.",
        "export_target_list_data",
      ],
      [
        "Target can be annotated with objectives and priorities within JCC2 Cyber-Ops.",
        "annotate_target_objectives",
      ],
      [
        "Path to target can be displayed within JCC2 Cyber-Ops.",
        "display_path_to_target",
      ],
      [
        "Potential collateral damage risks can be viewed within JCC2 Cyber-Ops.",
        "view_collateral_damage_risks",
      ],
    ];
    cyberOpsTargetingQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`${question[1]}_cyberops`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "target_lists")
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("target_lists_overall_effectiveness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "target_lists_overall",
        "Overall Target List Management Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)
    builder
      .section("MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)")
      .id("mop_2_1_7")
      .conditional("exp_app_jcc2cyberops", "not_equals", ["NA"])
      .naable();
    builder
      .field("radio", "JCC2 Cyber Ops")
      .id("force_deconfliction_cyberops")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "force_deconfliction",
        "JCC2 Cyber-Ops prevents the assignment of personnel to more than one mission that would conflict."
      )
      .defaultValue(effectivenessScale.default)
      .required()
      .end();
    builder
      .field("radio", "JCC2 Overall")
      .id("force_deconfliction_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "force_deconfliction_overall",
        "Overall Force Deconfliction Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 2.1.9: Joint forces to perform collaborative planning - COMPLETE IMPLEMENTATION
    // builder
    //   .section("MOP 2.1.9: Joint forces to perform collaborative planning")
    //   .id("mop_2_1_9")
    //   .naable();
    const planningApps = ["JCC2 Cyber Ops", "JCC2 Readiness"];

    // MOP 2.1.9 displays when user has experience with EITHER
    // "JCC2 Cyber Ops" OR "JCC2 Readiness"
    builder
      .section("MOP 2.1.9: Joint forces to perform collaborative planning")
      .id(`mop_2_1_9`)
      .conditionalOr([
        {
          dependsOn: `exp_app_${toId(planningApps[0])}`,
          operator: "not_equals",
          values: ["NA"],
        },
        {
          dependsOn: `exp_app_${toId(planningApps[1])}`,
          operator: "not_equals",
          values: ["NA"],
        },
      ])
      .naable();

    // Collaborative planning tools
    builder
      .field("radio", `JCC2 provides tool for collaborative planning.`)
      .id(`collaborative_planning_tool`)
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, `collaborative_planning_tool`)
      // .defaultValue(effectivenessScale.default)
      .required()
      .end();

    // Courses of action development
    builder
      .field(
        "radio",
        `JCC2 provided applications allow for the development of courses of action.`
      )
      .id(`courses_of_action`)
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, `courses_of_action`)
      // .defaultValue(effectivenessScale.default)
      .required()
      .end();

    // Low latency performance across security environments
    securityEnvironments.forEach((env) => {
      builder
        .field(
          "radio",
          `When using JCC2 for planning, actions with the application occur with low latency in ${env}.`
        )
        .id(`low_latency_${toId(env)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, `latency_environments`)
        // .defaultValue(effectivenessScale.default)
        .required()
        .end();
    });
    builder
      .field("radio", "JCC2 Overall")
      .id("collaborative_planning_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "collaborative_planning_overall",
        "Overall Collaborative Planning Effectiveness Rating"
      )
      .required()
      .end();

    // MOP 2.3.1: Mission Change orders can be completed within Dispatch
    builder
      .section(
        "MOP 2.3.1: Mission Change orders can be completed within Dispatch"
      )
      .id("mop_2_3_1")
      .conditional("exp_app_dispatch", "not_equals", ["NA"])
      .naable();
    const dispatchQuestions = [
      ["Dispatch enables the creation of orders.", "creation_of_orders"],
      [
        "Dispatch enables changes to orders to be completed.",
        "changes_to_orders",
      ],
      [
        "Dispatch enables collaborative order generation.",
        "collaborative_order_generation",
      ],
      [
        "Dispatch enables compliance tracking of generated orders.",
        "compliance_tracking",
      ],
      ["Orders generated within Dispatch are accurate.", "orders_accurate"],
    ];
    dispatchQuestions.forEach((question) => {
      builder
        .field("radio", "Dispatch")
        .id(`${question[1]}_dispatch`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, question[1], question[0])
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
    const dispositionApps = ["JCC2 Readiness", "JCC2 Cyber Ops"];
    builder
      .section("MOP 2.3.2: JCC2 displays force disposition")
      .id("mop_2_3_2")
      .conditionalOr([
        {
          dependsOn: `exp_app_${toId(dispositionApps[0])}`,
          operator: "not_equals",
          values: ["NA"],
        },
        {
          dependsOn: `exp_app_${toId(dispositionApps[1])}`,
          operator: "not_equals",
          values: ["NA"],
        },
      ])
      .naable();
    builder
      .field(
        "radio",
        "Rate the effectiveness of JCC2's force disposition capability."
      )
      .id(`force_disposition_display`)
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(true, "force_disposition_display")
      // .defaultValue(effectivenessScale.default)
      .required()
      // .conditional(appConditionId, "not_equals", ["NA"])
      .end();

    // MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops) - COMPLETE IMPLEMENTATION
    builder
      .section(
        "MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops)"
      )
      .id("mop_2_4_1")
      .conditional("exp_app_jcc2cyberops", "not_equals", ["NA"])
      .naable();
    builder
      .field(
        "radio",
        "Mission progression can be measured within JCC2 Cyber-Ops."
      )
      .id("mission_progress_assessment")
      .options(effectivenessScale.options)
      .layout("horizontal")
      // .grouping(true, "mission_progress_assessment")
      // .defaultValue(effectivenessScale.default)
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
      .field("radio", "JCC2 Overall")
      .id("mission_progress_assessment_overall")
      .options(effectivenessScale.options)
      .layout("horizontal")
      .grouping(
        true,
        "mission_progress_assessment_overall",
        "Overall Mission Progress Assessment Effectiveness Rating"
      )
      .required()
      .end();

    // MOS 3.2.1: User rating of JCC2 training
    builder.section("MOS 3.2.1: User rating of JCC2 training").id("mos_3_2_1");
    builder
      .field("radio", "Did you receive any training before you used JCC2?")
      .id("initial_training")
      .options(yesNo)
      .layout("horizontal")
      // .defaultValue("No")
      .required()
      .end();
    builder
      .field(
        "textarea",
        "If no, please concisely describe any problems or issues and the operational impact:"
      )
      .id("no_initial_training_operational_impact")
      .conditional("initial_training", "equals", ["No"])
      .required()
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
      .required()
      .end();
    builder
      .field(
        "radio",
        "Did you receive any supplemental training to aid your duties?"
      )
      .id("supplemental_training")
      .options(yesNo)
      .layout("horizontal")
      .required()
      // .defaultValue("No")
      .end();
    builder
      .field(
        "textarea",
        "No, please concisely describe any problems or issues and the operational impact:"
      )
      .id("supplemental_training_no")
      .conditional("supplemental_training", "equals", ["No"])
      .required()
      .end();
    builder
      .field("radio", "Do you want (more) training?")
      .id("request_training")
      .options(yesNo)
      .layout("horizontal")
      // .defaultValue("No")
      .required()
      .end();
    // builder
    //   .field(
    //     "textarea",
    //     "Yes, please concisely describe any problems or issues and the operational impact:"
    //   )
    //   .id("request_training_yes")
    //   .conditional("request_training", "equals", ["Yes"])
    //   .end();
    const trainingAssessmentQuestions = [
      [
        "All of the information covered was relevant to how I interact with the system.",
        "relavancy",
      ],
      [
        "The training prepared me to easily use the system to accomplish my mission.",
        "preparation_mission",
      ],
      ["Training accurately portrayed operations in the field.", "accuracy"],
      [
        "The training prepared me to properly interact with the system.",
        "system_interaction",
      ],
      [
        "Training prepared me to solve common problems.",
        "preparation_problems",
      ],
      [
        "Training adequately covered all important ways I interact with the system.",
        "system_interaction_important",
      ],
    ];
    trainingAssessmentQuestions.forEach((question) => {
      builder
        .field("radio", question[0])
        .id(`training_assessment_${question[1]}`)
        .options(agreementScale)
        .layout("horizontal")
        // .defaultValue("Neutral")
        .grouping(
          true,
          "training_assessment_questions",
          "Operational Assessment of Training Received"
        )
        .required()
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`training_rating_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "training_rating", "Summative Training Rating")
        // .defaultValue(effectivenessScale.default)
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
      // .defaultValue(effectivenessScale.default)
      .required()
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
      .required()
      .end();
    builder
      .field("radio", "Does the provided documentation meet your needs?")
      .id("documentation_completeness")
      .options(effectivenessScale.options)
      .layout("horizontal")
      // .defaultValue(effectivenessScale.default)
      .end();
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`documentation_rating_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "app_documentation_rating",
          "Rate the effectiveness of JCC2 Documentation"
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });

    // MOP 3.2.3: User rating of JCC2 support (help desk)
    builder
      .section("MOP 3.2.3: User rating of JCC2 support (help desk)")
      .id("mop_3_2_3");
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`submit_ticket_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "submit_ticket", "Help desk tickets can be submitted.")
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`confirm_ticket_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "confirm_ticket",
          "A confirmation of a ticket being submitted is received when contacting the help desk"
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`fix_issues_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(
          true,
          "fix_issues",
          "The help desk is able to successfully fix my issues when contacted."
        )
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    allJcc2Apps.forEach((app) => {
      const appConditionId = `operational_jcc2_experience.exp_app_${toId(app)}`;
      builder
        .field("radio", app)
        .id(`responsive_${toId(app)}`)
        .options(effectivenessScale.options)
        .layout("horizontal")
        .grouping(true, "responsive", "The help desk is responsive.")
        // .defaultValue(effectivenessScale.default)
        .required()
        .conditional(appConditionId, "not_equals", ["NA"])
        .end();
    });
    builder
      .field(
        "radio",
        "Summative Support Rating. Rate the overall effectiveness of JCC2 support."
      )
      .id("summative_support_rating")
      .options(effectivenessScale.options)
      .layout("horizontal")
      // .defaultValue(effectivenessScale.default)
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
      .id("overall_system_usability");
    const usabilityItems = [
      {
        id: "like_to_use",
        label: "I think that I would like to use JCC2 frequently",
      },
      {
        id: "unnecessarily_complex",
        label: "I found JCC2 unnecessarily complex.",
      },
      { id: "easy_to_use", label: "I thought JCC2 was easy to use." },
      {
        id: "need_expert_support",
        label:
          "I think that I would need the support of an expert to be able to use JCC2.",
      },
      {
        id: "functions_well_integrated",
        label: "I found the various functions in JCC2 to be well integrated",
      },
      {
        id: "quick_to_learn",
        label: "I would imagine most people could quickly learn to use JCC2",
      },
      {
        id: "cumbersome_to_use",
        label: "I found JCC2 very cumbersome to use",
      },
      {
        id: "confident_using",
        label: "I felt very confident using JCC2",
      },
      {
        id: "needed_to_learn_alot",
        label:
          "I needed to learn a lot of things before I could effectively use JCC2",
      },
      {
        id: "liked_interface",
        label: "I liked the user interface of JCC2",
      },
    ];
    usabilityItems.forEach((item) => {
      builder
        .field("radio", item.label)
        .id(item.id)
        .options(usabilityScale)
        .layout("horizontal")
        .grouping(true, "overall_system_usability", "Overall System Usability")
        // .defaultValue(4)
        .required()
        .end();
    });

    // User Evaluation of Overall System Suitability
    builder
      .section("User Evaluation of Overall System Suitability")
      .id("overall_system_suitability_eval")
      .field(
        "radio",
        "Do you experience issues with data exchange or functional compatibility between JCC2 applications?"
      )
      .id("internal_interop")
      .options(yesNaNo)
      .layout("horizontal")
      // .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific applications involved, and the operational impact:"
      )
      .id("internal_interop_details")
      .required()
      .conditional("internal_interop", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues integrating data from external sources into JCC2?"
      )
      .id("external_integration")
      .required()
      .options(yesNaNo)
      .layout("horizontal")
      // .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific data sources involved, and the operational impact:"
      )
      .id("external_integ_details")
      .required()
      .conditional("external_integration", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues with JCC2's compatibility with legacy software packages used in your operations?"
      )
      .id("legacy_compatibility")
      .options(yesNaNo)
      .required()
      .layout("horizontal")
      // .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the problems, the specific legacy systems involved, and the operational impact:"
      )
      .id("eval_legacy_compat_details")
      .required()
      .conditional("legacy_compatibility", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues sharing information up the chain of command or with other teams within the JCC2?"
      )
      .id("info_sharing")
      .options(yesNaNo)
      .layout("horizontal")
      .required()
      // .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please concisely describe any problems or issues and the operational impact:"
      )
      .id("info_sharing_details")
      .required()
      .conditional("info_sharing", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience performance slowdowns within JCC2 that negatively impact your ability to complete tasks efficiently?"
      )
      .id("performance")
      .options(yesNaNo)
      .layout("horizontal")
      // .defaultValue("No")
      .required()
      .end()
      .field(
        "textarea",
        "If yes, please describe the specific situations where slowdowns occur, the perceived cause (if known), and the operational impact:"
      )
      .id("performance_details")
      .required()
      .conditional("performance", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Do you experience issues accessing specific JCC2 databases or applications due to permission restrictions?"
      )
      .id("access_control")
      .options(yesNaNo)
      .required()
      .layout("horizontal")
      // .defaultValue("No")
      .end()
      .field(
        "textarea",
        "If yes, please describe the specific resources you are unable to access and the operational impact:"
      )
      .id("access_control_details")
      .required()
      .conditional("access_control", "equals", ["Yes"])
      .end()
      .field(
        "radio",
        "Are the current role-based access controls within JCC2 appropriate for your operational needs?"
      )
      .id("rbac")
      .options(yesNaNo)
      .layout("horizontal")
      // .defaultValue("Yes")
      .required()
      .end()
      .field("textarea", "If no, please explain why and suggest improvements:")
      .id("rbac_details")
      .required()
      .conditional("rbac", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Is it clear who to contact to request changes to access permissions?"
      )
      .id("access_requests")
      .options(yesNaNo)
      .layout("horizontal")
      // .defaultValue("Yes")
      .required()
      .end()
      .field(
        "textarea",
        "If no, please explain the difficulties you have encountered:"
      )
      .id("access_requests_details")
      .required()
      .conditional("access_requests", "equals", ["No"])
      .end()
      .field(
        "radio",
        "Have you previously submitted change or feature requests to the JCC2 development teams or Program Office?"
      )
      .id("feature_requests")
      .options(yesNo)
      .layout("horizontal")
      .required()
      .end()
      .field(
        "radio",
        "Are there any changes or improvements you would like to see implemented in JCC2?"
      )
      .id("improvements")
      .options(yesNo)
      .layout("horizontal")
      // .defaultValue("No")
      .required()
      .end()
      .field(
        "textarea",
        "If yes, please describe the desired changes or improvements in detail:"
      )
      .id("improvements_details")
      .required()
      .conditional("improvements", "equals", ["Yes"])
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
