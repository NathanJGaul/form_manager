import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic";

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
    builder.section('User Information')
      .field('text', 'Event').id('event').required().end()
      .field('date', 'Date').id('date').required().defaultValue(new Date().toISOString().split('T')[0]).end()
      .field('text', 'Rank/Name').id('rank_name').required().end()
      .field('text', 'Unit').id('unit').end()
      .field('email', 'Email').id('email').required().end()
      .field('tel', 'Phone').id('phone').end();

    builder.section('Role and Echelon')
      .field('radio', 'Status of Current Role').id('current_role_status').required().options(['Active Duty', 'Guard/Reserve', 'DoD Civilian', 'Contractor']).layout('horizontal').defaultValue('Active Duty').end()
      .field('radio', 'Current Cyber Operator').id('is_cyber_operator').required().options(yesNo).layout('horizontal').defaultValue('No').end()
      .field('text', 'Cyber Operations Division/Team').id('cyber_ops_division_team').required().conditional('is_cyber_operator', 'equals', ['Yes']).end()
      .field('radio', 'Echelon You Work Within').id('echelon').required().options(['Strategic', 'Operational', 'Tactical']).layout('horizontal').defaultValue('Operational').end()
      .field('checkbox', 'Duties You Perform').id('duties').multiple().required().options(['Offensive Cyber Operations', 'Defensive Cyber Operations', 'Mission Planning', 'Internal Defense Measures', 'Ticket Creation', 'Other(s)']).layout('horizontal').end()
      .field('text', 'Other Duties').id('other_duties').required().conditional('duties', 'contains', ['Other(s)']).end();

    // Page 1-2: Experience Grids (Grouped)
    builder.section('Operational & JCC2 Experience');
    operationalExperienceTopics.forEach(topic => {
      builder.field('radio', topic).id(`exp_${toId(topic)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).layout('horizontal').grouping(true, 'operational_experience').required().end();
    });

    specificJcc2AppExperience.forEach(app => {
      builder.field('radio', app).id(`exp_app_${toId(app)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).layout('horizontal').grouping(true, 'jcc2_app_experience').required().end();
    });

    // Page 2: JCC2 App Usage Grid (Grouped)
    builder.section('JCC2 Application Usage');
    allJcc2Apps.forEach(app => {
        const appId = `usage_${toId(app)}`;
        builder.field('radio', `${app} - Frequency`).id(`${appId}_frequency`).options(frequencyOfUse).defaultValue(frequencyOfUse[0]).layout('horizontal').grouping(true, `usage_frequency_group`).required().end()
               .field('checkbox', `${app} - Classification`).id(`${appId}_classification`).multiple().options(classificationOptions).layout('horizontal').grouping(true, `usage_classification_group`).end()
               .field('radio', `${app} - Training`).id(`${appId}_training_received`).options(yesNo).defaultValue('No').layout('horizontal').grouping(true, `usage_training_group`).required().end()
               .field('text', 'Specify Training Type').id(`${appId}_training_type`).required().conditional(`${appId}_training_received`, 'equals', ['Yes']).end()
    });

    // MOP/MOS Sections with Grouping
    const mopSections = {
      'MOP 1.1.1': 'Integrate intelligence and operational data',
      'MOS 1.1.2': 'Tagging objects of interest',
      'MOP 1.1.3': 'Identify the cause of an operational status change (MADSS)',
      'MOPS 1.1.4/1.2.3/1.3.6/2.3.3': 'Reporting and Data Export',
      'MOP 1.1.5': 'Information sharing among joint forces',
      'MOP 1.2.1': 'Threat Detection (TASC)',
      'MOP 1.2.2': 'Threat assessment (Crucible)',
      'MOS 1.3.1': 'Common Operating Picture (COP)',
      'MOP 1.3.2': 'Dependency map for locating downstream assets (MADSS)',
      'MOP 1.3.3': 'Event creation',
      'MOP 1.3.4': 'Alerts aid users in maintaining situational awareness',
      'MOP 1.3.5': 'Data flow across different security levels',
      'MOP 2.1.1': 'Provide data for cyber force assessment (JCC2 Readiness)',
      'MOP 2.1.2': 'Create and manage target lists (JCC2 Cyber-Ops)',
      'MOP 2.1.7': 'Perform force deconfliction (JCC2 Cyber Ops)',
      'MOP 2.1.9': 'Joint forces to perform collaborative planning',
      'MOP 2.3.1': 'Mission Change orders can be completed within Dispatch',
      'MOP 2.3.2': 'JCC2 displays force disposition',
      'MOP 2.4.1': 'Enable the user to assess mission-progress (JCC2 Cyber-Ops)',
      'MOS 3.2.1': 'User rating of JCC2 training',
      'MOS 3.2.2': 'User rating of JCC2 documentation',
      'MOP 3.2.3': 'User rating of JCC2 support (help desk)'
    };

    Object.entries(mopSections).forEach(([mop, description]) => {
        builder.section(`${mop}: ${description}`);
        // This is a simplified representation. A full implementation would require
        // specific questions for each MOP as in the original file.
        // For demonstration, we'll create one grouped question per MOP.
        allJcc2Apps.forEach(app => {
            builder.field('radio', app)
                .id(`${toId(mop)}_${toId(app)}`)
                .options(effectivenessScale)
                .layout('horizontal')
                .grouping(true, toId(mop))
                .defaultValue('Not Applicable')
                .required()
                .end();
        });
    });

    // Page 40: Usability Evaluation (Range Sliders)
    builder.section('User evaluation of overall system usability');
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
    builder.section('User Evaluation of Overall System Suitability')
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