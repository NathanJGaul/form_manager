import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic/index";

// Helper data for repetitive sections
const operationalExperienceTopics = [
  'Cyber Operations', 'Your Current Role', 'JCC2 Experience'
];

const specificJcc2AppExperience = [
  'A2IT', 'CAD', 'Codex', 'Crucible', 'Cyber 9-Line', 'Dispatch', 'JCC2 Cyber Ops', 
  'JCC2-Readiness', 'MADSS', 'Rally', 'REDMAP', 'SigAct', 'Threat Hub', 'Triage', 'Unity'
];

const allJcc2Apps = [
    'JCC2 Cyber-Ops', 'JCC2 Readiness', 'A2IT', 'CAD', 'Codex', 'Crucible', 
    'Cyber 9-Line', 'Dispatch', 'MADSS', 'Rally', 'Redmap', 'SigAct', 'Threat Hub', 
    'Triage', 'Unity'
];

const effectivenessScale = [
  'Completely Ineffective', 'Moderately Ineffective', 'Slightly Ineffective', 
  'Slightly Effective', 'Moderately Effective', 'Completely Effective', 'Not Applicable'
];

const experienceLevels = { options: ['< 1 Year', '1-3 Years', '3-5 Years', '> 5 Years', 'NA'], default: 'NA' };

const frequencyOfUse = ['Never', 'Daily', 'Weekly', 'Monthly'];
const classificationOptions = ['NIPR', 'SIPR', 'JWICS'];
const yesNo = ['Yes', 'No'];

const agreementScale = [
    'Strongly Disagree', 'Disagree', 'Slightly Disagree', 'Neutral', 'Slightly Agree', 'Agree', 'Strongly Agree'
];

const usabilityScale = [ '1', '2', '3', '4', '5', '6' ];

/**
 * Helper function to convert strings to an id
 * @param str 
 * @returns str converted to id
 */
function toId(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/ /g, '_');
}

/**
 * Programmatic template for the JCC2 User Questionnaire PDF (V2).
 * This version leverages advanced features like horizontal layouts and grouping.
 */
export class JCC2UserQuestionnaireV2 {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('JCC2 User Questionnaire V2')
      .description('An improved programmatic version of the JCC2 User Questionnaire, using advanced layout features.')
      .author('Gemini')
      .version('2.0.0')
      .tags('questionnaire', 'jcc2', 'feedback', 'military', 'v2');

    // Page 1: User and Role Information
    builder.section('User Information').id('user_information')
      .field('text', 'Event').id('event').required().end()
      .field('date', 'Date').id('date').required().defaultValue(new Date().toISOString().split('T')[0]).end()
      .field('text', 'Rank/Name').id('rank_name').required().end()
      .field('text', 'Unit').id('unit').end()
      .field('email', 'Email').id('email').required().end()
      .field('tel', 'Phone').id('phone').end();

    builder.section('Role and Echelon').id('role_and_echelon')
      .field('radio', 'Status of Current Role').id('current_role_status').required().options(['Active Duty', 'Guard/Reserve', 'DoD Civilian', 'Contractor']).layout('horizontal').defaultValue('Active Duty').end()
      .field('radio', 'Current Cyber Operator').id('is_cyber_operator').required().options(yesNo).layout('horizontal').defaultValue('No').end()
      .field('text', 'Cyber Operations Division/Team').id('cyber_ops_division_team').required().conditional('is_cyber_operator', 'equals', ['Yes']).end()
      .field('radio', 'Echelon You Work Within').id('echelon').required().options(['Strategic', 'Operational', 'Tactical']).layout('horizontal').defaultValue('Operational').end()
      .field('checkbox', 'Duties You Perform').id('duties').multiple().required().options(['Offensive Cyber Operations', 'Defensive Cyber Operations', 'Mission Planning', 'Internal Defense Measures', 'Ticket Creation', 'Other(s)']).layout('horizontal').end()
      .field('text', 'Other Duties').id('other_duties').required().conditional('duties', 'contains', ['Other(s)']).end();

    // Page 1-2: Experience Grids (Grouped)
    builder.section('Operational & JCC2 Experience').id('operational_jcc2_experience');
    operationalExperienceTopics.forEach(topic => {
      builder.field('radio', topic).id(`exp_${toId(topic)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).layout('horizontal').grouping(true, 'operational_experience').required().end();
    });

    specificJcc2AppExperience.forEach(app => {
      builder.field('radio', app).id(`exp_app_${toId(app)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).layout('horizontal').grouping(true, 'jcc2_app_experience').required().end();
    });

    // Page 2: JCC2 App Usage Grid (Grouped)
    builder.section('JCC2 Application Usage').id('jcc2_application_usage');
    allJcc2Apps.forEach(app => {
        const appId = `usage_${toId(app)}`;
        builder.field('radio', `${app} - Frequency`).id(`${appId}_frequency`).options(frequencyOfUse).defaultValue(frequencyOfUse[0]).layout('horizontal').grouping(true, `usage_frequency_group`).required().end()
               .field('checkbox', `${app} - Classification`).id(`${appId}_classification`).multiple().options(classificationOptions).layout('horizontal').grouping(true, `usage_classification_group`).end()
               .field('radio', `${app} - Training`).id(`${appId}_training_received`).options(yesNo).defaultValue('No').layout('horizontal').grouping(true, `usage_training_group`).required().end()
               .field('text', 'Specify Training Type').id(`${appId}_training_type`).required().conditional(`${appId}_training_received`, 'equals', ['Yes']).end()
    });

    // MOP 1.1.1: Integrate intelligence and operational data
    builder.section('MOP 1.1.1: Integrate intelligence and operational data').id('mop_1_1_1_integrate_intelligence_operational_data');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Effectiveness of ${app} in providing intelligence data`)
            .id(`mop_1_1_1_${toId(app)}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_1_1_1_effectiveness')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOS 1.1.2: Tagging objects of interest
    builder.section('MOS 1.1.2: Tagging objects of interest and enabling correlation of objects').id('mos_1_1_2_tagging_objects_correlation')
        .conditional('exp_app_madss', 'not_equals', ['NA'])
        .field('radio', 'Rate the utility of MADSS for Object Tagging')
            .id('mos_1_1_2_madss_tagging')
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .end()
        .field('radio', 'Rate the utility of MADSS for Object Correlation')
            .id('mos_1_1_2_madss_correlation')
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .end();

    // MOP 1.1.3: Identify the cause of an operational status change (MADSS)
    builder.section('MOP 1.1.3: Identify the cause of an operational status change (MADSS)').id('mop_1_1_3_identify_operational_status_change_madss')
        .conditional('exp_app_madss', 'not_equals', ['NA']);
    const madssQuestions = [
        'MADDS has the capability to notice a change in operational change in cyber asset status.',
        'MADDS has the capability to identify the cause of the operational change in cyber asset status.',
        'MADDS has the capability to search for the cause of the operational change in cyber asset status.',
        'MADDS has the capability to manually change the status of the operational change in cyber assets.',
        'MADDS has the capability to manually identify and correct inaccurate status changes.'
    ];
    madssQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_1_1_3_madss_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export
    builder.section('MOPS 1.1.4/1.2.3/1.3.6/2.3.3: Reporting and Data Export').id('mops_1_1_4_1_2_3_1_3_6_2_3_3_reporting_data_export');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} are accurate.`)
            .id(`mop_1_1_4_${toId(app)}_accurate`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_1_1_4_accuracy')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.1.5: Information sharing among joint forces
    builder.section('MOP 1.1.5: Information sharing among joint forces').id('mop_1_1_5_information_sharing_joint_forces');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Data created in ${app} can be shared with other Joint Forces members within JCC2 without the need for external applications.`)
            .id(`mop_1_1_5_${toId(app)}_sharing`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_1_1_5_sharing')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.2.1: Threat Detection (TASC)
    builder.section('MOP 1.2.1: Threat Detection (TASC)').id('mop_1_2_1_threat_detection_tasc')
        .conditional('exp_app_tasc', 'not_equals', ['NA']);
    const tascEffectivenessQuestions = [
        'JCC2 provided applications are accurate in detecting threats.',
        'Data provided by JCC2 allows me to take action or make decisions about threats.'
    ];
    tascEffectivenessQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_1_2_1_tasc_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.2.2: Threat assessment (Crucible)
    builder.section('MOP 1.2.2: Threat assessment (Crucible)').id('mop_1_2_2_threat_assessment_crucible')
        .conditional('exp_app_crucible', 'not_equals', ['NA']);
    const crucibleEffectivenessQuestions = [
        'JCC2 provides data to fully assess cyber threats.',
        'Data provided by JCC2 allows me to identify which threats are relevant to my area of responsibility.',
        'Crucible assists threat assessment with automatic analysis.',
        'Crucible enables decisions about the prioritization of threats.'
    ];
    crucibleEffectivenessQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_1_2_2_crucible_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOS 1.3.1: Common Operating Picture (COP)
    builder.section('MOS 1.3.1: Common Operating Picture (COP)').id('mos_1_3_1_common_operating_picture_cop');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} COP displays information that is relevant to my duties.`)
            .id(`mos_1_3_1_${toId(app)}_cop_relevant`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mos_1_3_1_cop_relevance')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.3.2: Dependency map for locating downstream assets (MADSS)
    builder.section('MOP 1.3.2: Dependency map for locating downstream assets (MADSS)').id('mop_1_3_2_dependency_map_downstream_assets_madss')
        .conditional('exp_app_madss', 'not_equals', ['NA']);
    const dependencyMapQuestions = [
        'The dependency map information within MADDS is complete.',
        'The dependency map can be used for determining what services are provided by information technology and cyber assets.',
        'The dependency map simulation mode is useful for determining what assets would be affected during an outage.'
    ];
    dependencyMapQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_1_3_2_madss_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.3.3: Event creation
    builder.section('MOP 1.3.3: Event creation').id('mop_1_3_3_event_creation');
    const eventCreationApps = ['SigAct', 'Rally', 'MADSS', 'Cyber 9-Line', 'A2IT'];
    eventCreationApps.forEach(app => {
        builder.section(`MOP 1.3.3: Event creation (${app})`).id(`mop_1_3_3_event_creation_${toId(app)}`)
            .conditional(`exp_app_${toId(app)}`, 'not_equals', ['NA']);
        const eventCreationQuestions = [
            'Event creation is intuitive.',
            'The applications provide enough data elements to make detailed incident tickets.',
            'The applications provide a DISA tracking number for created incidents.'
        ];
        eventCreationQuestions.forEach((question, index) => {
            builder.field('radio', question)
                .id(`mop_1_3_3_${toId(app)}_${index + 1}`)
                .options(effectivenessScale)
                .layout('horizontal')
                .defaultValue('Not Applicable')
                .required()
                .end();
        });
    });

    // MOP 1.3.4: Alerts aid users in maintaining situational awareness
    builder.section('MOP 1.3.4: Alerts aid users in maintaining situational awareness').id('mop_1_3_4_alerts_situational_awareness');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Alerts can be customized to stay informed of changes for incidents they are following in ${app}.`)
            .id(`mop_1_3_4_${toId(app)}_customized`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_1_3_4_customization')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 1.3.5: Data flow across different security levels
    builder.section('MOP 1.3.5: Data flow across different security levels').id('mop_1_3_5_data_flow_security_levels');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Most of my work with ${app} occurs within what environment?`)
            .id(`mop_1_3_5_${toId(app)}_environment`)
            .options(['NIPR', 'SIPR', 'JWICS', 'Not Applicable'])
            .layout('horizontal')
            .grouping(true, 'mop_1_3_5_environment')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)
    builder.section('MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)').id('mop_2_1_1_cyber_force_assessment_jcc2_readiness')
        .conditional('exp_app_jcc2_readiness', 'not_equals', ['NA']);
    const readinessQuestions = [
        'JCC2 Readiness allows me to see personnel with required training.',
        'JCC2 Readiness allows me to see personnel with required abilities.',
        'JCC2 Readiness allows me to see personnel with required certifications.',
        'Information about force disposition from JCC2 Readiness is accurate.',
        'Information about force disposition from JCC2 Readiness is complete.'
    ];
    readinessQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_2_1_1_jcc2_readiness_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)
    builder.section('MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)').id('mop_2_1_2_create_manage_target_lists_jcc2_cyber_ops')
        .conditional('exp_app_jcc2_cyber_ops', 'not_equals', ['NA']);
    const cyberOpsTargetingQuestions = [
        'JCC2 Cyber-Ops enables the user to create new target lists.',
        'JCC2 Cyber-Ops enables the user to manage existing target lists.',
        'Target list data is able to be exported from JCC2 Cyber-Ops.',
        'Target can be annotated with objectives and priorities within JCC2 Cyber-Ops.',
        'Path to target can be displayed within JCC2 Cyber-Ops.',
        'Potential collateral damage risks can be viewed within JCC2 Cyber-Ops.'
    ];
    cyberOpsTargetingQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_2_1_2_jcc2_cyber_ops_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)
    builder.section('MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)').id('mop_2_1_7_force_deconfliction_jcc2_cyber_ops')
        .conditional('exp_app_jcc2_cyber_ops', 'not_equals', ['NA']);
    builder.field('radio', 'JCC2 Cyber-Ops prevents the assignment of personnel to more than one mission that would conflict.')
        .id('mop_2_1_7_jcc2_cyber_ops_deconfliction')
        .options(effectivenessScale)
        .layout('horizontal')
        .defaultValue('Not Applicable')
        .required()
        .end();

    // MOP 2.1.9: Joint forces to perform collaborative planning
    builder.section('MOP 2.1.9: Joint forces to perform collaborative planning').id('mop_2_1_9_joint_forces_collaborative_planning');
    const planningApps = ['JCC2 Cyber Ops', 'JCC2 Readiness'];
    planningApps.forEach(app => {
        builder.section(`MOP 2.1.9: Collaborative Planning (${app})`).id(`mop_2_1_9_collaborative_planning_${toId(app)}`)
            .conditional(`exp_app_${toId(app)}`, 'not_equals', ['NA']);
        builder.field('radio', `${app} provides tool for collaborative planning.`)
            .id(`mop_2_1_9_${toId(app)}_tool`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
        builder.field('radio', `${app} provided applications allow for the development of courses of action.`)
            .id(`mop_2_1_9_${toId(app)}_coa`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.3.1: Mission Change orders can be completed within Dispatch
    builder.section('MOP 2.3.1: Mission Change orders can be completed within Dispatch)').id('mop_2_3_1_mission_change_orders_dispatch')
        .conditional('exp_app_dispatch', 'not_equals', ['NA']);
    const dispatchQuestions = [
        'Dispatch enables the creation of orders.',
        'Dispatch enables changes to orders to be completed.',
        'Dispatch enables collaborative order generation.',
        'Dispatch enables compliance tracking of generated orders.',
        'Orders generated within Dispatch are accurate.'
    ];
    dispatchQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mop_2_3_1_dispatch_${index + 1}`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.3.2: JCC2 displays force disposition
    builder.section('MOP 2.3.2: JCC2 displays force disposition').id('mop_2_3_2_jcc2_displays_force_disposition');
    const dispositionApps = ['JCC2 Readiness', 'JCC2 Cyber Ops'];
    dispositionApps.forEach(app => {
        builder.field('radio', `Rate the effectiveness of ${app} facilitating the desired task.`)
            .id(`mop_2_3_2_${toId(app)}_disposition`)
            .options(effectivenessScale)
            .layout('horizontal')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops)
    builder.section('MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops)').id('mop_2_4_1_assess_mission_progress_jcc2_cyber_ops')
        .conditional('exp_app_jcc2_cyber_ops', 'not_equals', ['NA']);
    builder.field('radio', 'Mission progression can be measured within JCC2 Cyber-Ops.')
        .id('mop_2_4_1_jcc2_cyber_ops_progress')
        .options(effectivenessScale)
        .layout('horizontal')
        .defaultValue('Not Applicable')
        .required()
        .end();
    builder.field('textarea', 'Describe any workarounds used for monitoring status of missions if any workarounds are used.')
        .id('mop_2_4_1_workarounds')
        .end();
    builder.field('checkbox', 'If workarounds are used what is the reason for use of them?')
        .id('mop_2_4_1_workaround_reason')
        .multiple()
        .options(['Missing capabilities', 'Partially functional capabilities', 'External application works better'])
        .end();
    builder.field('textarea', 'Provide Details on why workaround is used:')
        .id('mop_2_4_1_workaround_details')
        .conditional('mop_2_4_1_workaround_reason', 'contains', ['Missing capabilities', 'Partially functional capabilities', 'External application works better'])
        .end();

    // MOS 3.2.1: User rating of JCC2 training
    builder.section('MOS 3.2.1: User rating of JCC2 training').id('mos_3_2_1_user_rating_jcc2_training');
    builder.field('radio', 'Did you receive any training before you used JCC2?')
        .id('mos_3_2_1_initial_training')
        .options(yesNo)
        .layout('horizontal')
        .defaultValue('No')
        .end();
    builder.field('textarea', 'No, please concisely describe any problems or issues and the operational impact:')
        .id('mos_3_2_1_initial_training_no')
        .conditional('mos_3_2_1_initial_training', 'equals', ['No'])
        .end();
    builder.field('checkbox', 'What format of training have you received?')
        .id('mos_3_2_1_training_format')
        .multiple()
        .options(['Instructor-Lead Training', 'Video-Based Training', 'On-The-Job Training', 'None'])
        .end();
    builder.field('radio', 'Did you receive any supplemental training to aid your duties?')
        .id('mos_3_2_1_supplemental_training')
        .options(yesNo)
        .layout('horizontal')
        .defaultValue('No')
        .end();
    builder.field('textarea', 'No, please concisely describe any problems or issues and the operational impact:')
        .id('mos_3_2_1_supplemental_training_no')
        .conditional('mos_3_2_1_supplemental_training', 'equals', ['No'])
        .end();
    builder.field('radio', 'Do you want (more) training?')
        .id('mos_3_2_1_request_training')
        .options(yesNo)
        .layout('horizontal')
        .defaultValue('No')
        .end();
    builder.field('textarea', 'Yes, please concisely describe any problems or issues and the operational impact:')
        .id('mos_3_2_1_request_training_yes')
        .conditional('mos_3_2_1_request_training', 'equals', ['Yes'])
        .end();
    const trainingAssessmentQuestions = [
        'All of the information covered was relevant to how I interact with the system.',
        'The training prepared me to easily use the system to accomplish my mission.',
        'Training accurately portrayed operations in the field.',
        'The training prepared me to properly interact with the system.',
        'Training prepared me to solve common problems.',
        'Training adequately covered all important ways I interact with the system.'
    ];
    trainingAssessmentQuestions.forEach((question, index) => {
        builder.field('radio', question)
            .id(`mos_3_2_1_training_assessment_${index + 1}`)
            .options(agreementScale)
            .layout('horizontal')
            .defaultValue('Neutral')
            .required()
            .end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Summative Training Rating for ${app}`)
            .id(`mos_3_2_1_${toId(app)}_training_rating`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mos_3_2_1_training_rating')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });
    builder.field('textarea', 'Additional observations. Provide any additional observations (positive or negative):')
        .id('mos_3_2_1_additional_observations')
        .end();

    // MOS 3.2.2: User rating of JCC2 documentation
    builder.section('MOS 3.2.2: User rating of JCC2 documentation').id('mos_3_2_2_user_rating_jcc2_documentation');
    builder.field('radio', 'Rate the effectiveness of any training documentation received. If none was received, select NA.')
        .id('mos_3_2_2_documentation_effectiveness')
        .options(effectivenessScale)
        .layout('horizontal')
        .defaultValue('Not Applicable')
        .end();
    builder.field('checkbox', 'What format was JCC2 documentation delivered in?')
        .id('mos_3_2_2_documentation_format')
        .multiple()
        .options(['Paper document', 'External video', 'Video embedded in application', 'Step-by-step SOP', 'Internal training document', 'None'])
        .end();
    builder.field('radio', 'Does the provided documentation meet your needs?')
        .id('mos_3_2_2_documentation_completeness')
        .options(effectivenessScale)
        .layout('horizontal')
        .defaultValue('Not Applicable')
        .end();
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Summative Documentation Rating for ${app}`)
            .id(`mos_3_2_2_${toId(app)}_documentation_rating`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mos_3_2_2_documentation_rating')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });

    // MOP 3.2.3: User rating of JCC2 support (help desk)
    builder.section('MOP 3.2.3: User rating of JCC2 support (help desk)').id('mop_3_2_3_user_rating_jcc2_support_help_desk');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Help desk tickets can be submitted for ${app}.`)
            .id(`mop_3_2_3_${toId(app)}_submit_ticket`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_3_2_3_submit_ticket')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `A confirmation of a ticket being submitted is received when contacting the help desk for ${app}.`)
            .id(`mop_3_2_3_${toId(app)}_confirm_ticket`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_3_2_3_confirm_ticket')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The help desk is able to successfully fix my issues when contacted for ${app}.`)
            .id(`mop_3_2_3_${toId(app)}_fix_issues`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_3_2_3_fix_issues')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The help desk is responsive for ${app}.`)
            .id(`mop_3_2_3_${toId(app)}_responsive`)
            .options(effectivenessScale)
            .layout('horizontal')
            .grouping(true, 'mop_3_2_3_responsive')
            .defaultValue('Not Applicable')
            .required()
            .end();
    });
    builder.field('radio', 'Summative Support Rating. Rate the effectiveness of JCC2 support.')
        .id('mop_3_2_3_summative_support_rating')
        .options(effectivenessScale)
        .layout('horizontal')
        .defaultValue('Not Applicable')
        .end();
    builder.field('textarea', 'Additional observations. Provide any additional observations (positive or negative):')
        .id('mop_3_2_3_additional_observations')
        .end();

    // Page 40: Usability Evaluation (Range Sliders)
    builder.section('User evaluation of overall system usability').id('user_evaluation_overall_system_usability');
    const usabilityItems = [
        { id: 'usability_like_to_use', label: 'I think that I would like to use JCC2 frequently' },
        { id: 'usability_unnecessarily_complex', label: 'I found JCC2 unnecessarily complex.' },
        { id: 'usability_easy_to_use', label: 'I thought JCC2 was easy to use.' },
        { id: 'usability_need_expert_support', label: 'I think that I would need the support of an expert to be able to use JCC2.' },
        { id: 'usability_functions_well_integrated', label: 'I found the various functions in JCC2 to be well integrated' },
        { id: 'usability_quick_to_learn', label: 'I would imagine most people could quickly learn to use JCC2' },
        { id: 'usability_cumbersome_to_use', label: 'I found JCC2 very cumbersome to use' },
        { id: 'usability_confident_using', label: 'I felt very confident using JCC2' },
        { id: 'usability_needed_to_learn_alot', label: 'I needed to learn a lot of things before I could effectively use JCC2' },
        { id: 'usability_liked_interface', label: 'I liked the user interface of JCC2' }
    ];
    usabilityItems.forEach(item => {
        builder.field('range', item.label).id(item.id).min(1).max(6).defaultValue(4).required().end();
    });

    // Page 41-42: Final Thoughts
    builder.section('User Evaluation of Overall System Suitability').id('user_evaluation_overall_system_suitability')
        .field('radio', 'Do you experience issues with data exchange or functional compatibility between JCC2 applications?').id('eval_internal_interop').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please describe the problems, the specific applications involved, and the operational impact:').id('eval_internal_interop_details').required().conditional('eval_internal_interop', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues integrating data from external sources into JCC2?').id('eval_external_integ').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please describe the problems, the specific data sources involved, and the operational impact:').id('eval_external_integ_details').required().conditional('eval_external_integ', 'equals', ['Yes']).end()
        .field('radio', "Do you experience issues with JCC2's compatibility with legacy software packages used in your operations?").id('eval_legacy_compat').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please describe the problems, the specific legacy systems involved, and the operational impact:').id('eval_legacy_compat_details').required().conditional('eval_legacy_compat', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues sharing information up the chain of command or with other teams within the JCC2?').id('eval_info_sharing').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please concisely describe any problems or issues and the operational impact:').id('eval_info_sharing_details').required().conditional('eval_info_sharing', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience performance slowdowns within JCC2 that negatively impact your ability to complete tasks efficiently?').id('eval_performance').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please describe the specific situations where slowdowns occur, the perceived cause (if known), and the operational impact:').id('eval_performance_details').required().conditional('eval_performance', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues accessing specific JCC2 databases or applications due to permission restrictions?').id('eval_access_control').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If yes, please describe the specific resources you are unable to access and the operational impact:').id('eval_access_control_details').required().conditional('eval_access_control', 'equals', ['Yes']).end()
        .field('radio', 'Are the current role-based access controls within JCC2 appropriate for your operational needs?').id('eval_rbac').options(yesNo).layout('horizontal').defaultValue('Yes').end()
        .field('textarea', 'If no, please explain why and suggest improvements:').id('eval_rbac_details').required().conditional('eval_rbac', 'equals', ['No']).end()
        .field('radio', 'Is it clear who to contact to request changes to access permissions?').id('eval_access_requests').options(yesNo).layout('horizontal').defaultValue('Yes').end()
        .field('textarea', 'If no, please explain the difficulties you have encountered:').id('eval_access_requests_details').required().conditional('eval_access_requests', 'equals', ['No']).end()
        .field('radio', 'Have you previously submitted change or feature requests to the JCC2 development teams or Program Office?').id('eval_feature_requests').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('radio', 'Are there any changes or improvements you would like to see implemented in JCC2?').id('eval_improvements').options(yesNo).layout('horizontal').defaultValue('No').end()
        .field('textarea', 'If you answered "Yes" to question b, please describe the desired changes or improvements in detail:').id('eval_improvements_details').required().conditional('eval_improvements', 'equals', ['Yes']).end()
        .field('textarea', 'Critical Issues. Please list any critical issues you feel must be resolved to significantly increase JCC2\'s effectiveness for your operations:').id('critical_issues').end()
        .field('textarea', 'Shout Outs. Please list any features you encountered that greatly improved the speed, quality, or effectiveness of your duties.').id('shout_outs').end()
        .field('textarea', 'Final Thoughts. Are there any additional items you would like to address that have not been documented yet?').id('final_thoughts').end();

    return builder.build();
  }
}
