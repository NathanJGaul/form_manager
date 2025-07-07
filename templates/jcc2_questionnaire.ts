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
  return str.toLowerCase().replace(/ /g, '_')
}

/**
 * Programmatic template for the JCC2 User Questionnaire PDF.
 */
export class JCC2UserQuestionnaire {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('JCC2 User Questionnaire')
      .description('A programmatic version of the JCC2 User Questionnaire, designed for user feedback on JCC2 applications.')
      .author('Nathan Gaul (nathan.gaul.2@us.af.mil)')
      .version('1.0.0')
      .tags('questionnaire', 'jcc2', 'feedback', 'military');

    // Page 1: User and Role Information
    builder.section('User Information')
      .field('text', 'Event').id('event').required().end()
      .field('date', 'Date').id('date').required().end()
      .field('text', 'Rank/Name').id('rank_name').required().end()
      .field('text', 'Unit').id('unit').end()
      .field('email', 'Email').id('email').required().end()
      .field('tel', 'Phone').id('phone').end();

    builder.section('Role and Echelon')
      .field('radio', 'Status of Current Role').id('current_role_status').required().options(['Active Duty', 'Guard/Reserve', 'DoD Civilian', 'Contractor']).end()
      .field('radio', 'Current Cyber Operator').id('is_cyber_operator').required().options(yesNo).end()
      .field('text', 'Cyber Operations Division/Team').id('cyber_ops_division_team').required().conditional('is_cyber_operator', 'equals', ['Yes']).end()
      .field('checkbox', 'Echelon You Work Within').id('echelon').multiple().required().options(['Strategic', 'Operational', 'Tactical']).end()
      .field('checkbox', 'Duties You Perform').id('duties').multiple().required().options(['Offensive Cyber Operations', 'Defensive Cyber Operations', 'Mission Planning', 'Internal Defense Measures', 'Ticket Creation', 'Other(s)']).end()
      .field('text', 'Other Duties').id('other_duties').required().conditional('duties', 'contains', ['Other(s)']).end();

    // Page 1-2: Experience Grids
    builder.section('Operational Experience');
    operationalExperienceTopics.forEach(topic => {
      builder.field('radio', topic).id(`exp_${toId(topic)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).required().end();
    });

    builder.section('Specific JCC2 Application Experience');
    specificJcc2AppExperience.forEach(app => {
      builder.field('radio', app).id(`exp_app_${toId(app)}`).options(experienceLevels.options).defaultValue(experienceLevels.default).required().end();
    });

    // Page 2: JCC2 App Usage Grid
    builder.section('JCC2 Application Usage');
    allJcc2Apps.forEach(app => {
        const appId = `usage_${toId(app)}`;
        builder.field('radio', `${app} - Frequency of Use`).id(`${appId}_frequency`).options(frequencyOfUse).defaultValue(frequencyOfUse[0]).required().end()
               .field('checkbox', `${app} - Classification`).id(`${appId}_classification`).multiple().options(classificationOptions).end()
               .field('radio', `${app} - Training Received`).id(`${appId}_training_received`).options(yesNo).required().end()
               .field('text', 'Specify Training Type').id(`${appId}_training_type`).required().conditional(`${appId}_training_received`, 'equals', ['Yes']).end()
    });

    // Page 4-5: MOP 1.1.1
    builder.section('MOP 1.1.1: Integrate intelligence and operational data');
    allJcc2Apps.forEach(app => {
        const appId = `mop_1_1_1_q1_${app.toLowerCase().replace(/ /g, '_')}`;
        builder.field('radio', `JCC2 provides intelligence data within ${app}`).id(appId).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        const appId = `mop_1_1_1_q2_${app.toLowerCase().replace(/ /g, '_')}`;
        builder.field('radio', `Data provided by ${app} allows for the completion of my assigned roles`).id(appId).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.1.1').id('mop_1_1_1_overall').options(effectivenessScale).required().end();

    // Page 6: MOS 1.1.2
    builder.section('MOS 1.1.2: Tagging objects of interest')
        .field('checkbox', 'Applicable Application(s)').id('mos_1_1_2_apps').multiple().options(['MADSS', 'Rally', 'SigAct', 'Threat Hub']).end();
    ['MADSS', 'Rally', 'SigAct', 'Threat Hub'].forEach(app => {
        const appId = `mos_1_1_2_tagging_${app.toLowerCase()}`;
        builder.field('radio', `Utility of ${app} for Object Tagging`).id(appId).options(effectivenessScale).required().end();
    });
    ['MADSS', 'Rally', 'SigAct', 'Threat Hub'].forEach(app => {
        const appId = `mos_1_1_2_correlation_${app.toLowerCase()}`;
        builder.field('radio', `Utility of ${app} for Object Correlation`).id(appId).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOS 1.1.2').id('mos_1_1_2_overall').options(effectivenessScale).required().end();

    // Page 7: MOP 1.1.3
    builder.section('MOP 1.1.3: Identify the cause of an operational status change (MADSS)')
        .field('radio', 'MADDS has the capability to notice a change in operational change in cyber asset status.').id('mop_1_1_3_q1').options(effectivenessScale).required().end()
        .field('radio', 'MADDS has the capability to identify the cause of the operational change in cyber asset status.').id('mop_1_1_3_q2').options(effectivenessScale).required().end()
        .field('radio', 'MADDS has the capability to search for the cause of the operational change in cyber asset status.').id('mop_1_1_3_q3').options(effectivenessScale).required().end()
        .field('radio', 'MADDS has the capability to manually change the status of the operational change in cyber assets.').id('mop_1_1_3_q4').options(effectivenessScale).required().end()
        .field('radio', 'MADDS has the capability to manually identify and correct inaccurate status changes.').id('mop_1_1_3_q5').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 1.1.3').id('mop_1_1_3_overall').options(effectivenessScale).required().end();

    // Page 8-12: MOPs 1.1.4, 1.2.3, 1.3.6, 2.3.3
    builder.section('MOPS - MOP 1.1.4, MOP 1.2.3, MOP 1.3.6, MOP 2.3.3: Reporting and Data Export');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} are accurate.`).id(`mop_1_1_4_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} can be exported to different formats.`).id(`mop_1_1_4_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} can be customized.`).id(`mop_1_1_4_q3_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} allow for data to be sorted.`).id(`mop_1_1_4_q4_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reports generated by ${app} allow for data to be filtered.`).id(`mop_1_1_4_q5_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} applications provide reports that are relevant to my job role.`).id(`mop_1_1_4_q6_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Reporting through the ${app} applications saves me time in my job role.`).id(`mop_1_1_4_q7_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for Reporting capability').id('mop_1_1_4_overall').options(effectivenessScale).required().end();

    // Page 13: MOP 1.1.5
    builder.section('MOP 1.1.5: Information sharing among joint forces');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Data created in ${app} can be shared with other Joint Forces members within JCC2 without the need for external applications.`).id(`mop_1_1_5_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.1.5').id('mop_1_1_5_overall').options(effectivenessScale).required().end();

    // Page 14: MOP 1.2.1
    const mop121Apps = ['CAD', 'Codex', 'Crucible', 'Cyber 9-Line', 'Redmap', 'SigAct', 'Threat Hub', 'Triage', 'Unity'];
    builder.section('MOP 1.2.1: Threat Detection (TASC)');
    mop121Apps.forEach(app => {
        builder.field('radio', `${app} provided applications are accurate in detecting threats.`).id(`mop_1_2_1_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    mop121Apps.forEach(app => {
        builder.field('radio', `Data provided by ${app} allows me to take action or make decisions about threats.`).id(`mop_1_2_1_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.2.1').id('mop_1_2_1_overall').options(effectivenessScale).required().end();

    // Page 15: MOP 1.2.2
    builder.section('MOP 1.2.2: Threat assessment (Crucible)')
        .field('radio', 'JCC2 provides data to fully assess cyber threats.').id('mop_1_2_2_q1').options(effectivenessScale).required().end()
        .field('radio', 'Data provided by JCC2 allows me to identify which threats are relevant to my area of responsibility.').id('mop_1_2_2_q2').options(effectivenessScale).required().end()
        .field('radio', 'Crucible assists threat assessment with automatic analysis.').id('mop_1_2_2_q3').options(effectivenessScale).required().end()
        .field('radio', 'Crucible enables decisions about the prioritization of threats.').id('mop_1_2_2_q4').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 1.2.2').id('mop_1_2_2_overall').options(effectivenessScale).required().end();

    // Page 16-20: MOS 1.3.1
    builder.section('MOS 1.3.1: Common Operating Picture (COP)');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays information that is relevant to my duties.`).id(`mos_1_3_1_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays information that is accurate.`).id(`mos_1_3_1_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays information that is Complete.`).id(`mos_1_3_1_q3_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays information that is timely.`).id(`mos_1_3_1_q4_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays information that is not visually cluttered.`).id(`mos_1_3_1_q5_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP has adequate sort, filter, and search capabilities.`).id(`mos_1_3_1_q6_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The ${app} application COP displays allow for customization.`).id(`mos_1_3_1_q7_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOS 1.3.1').id('mos_1_3_1_overall').options(effectivenessScale).required().end();

    // Page 21: MOP 1.3.2
    builder.section('MOP 1.3.2: Dependency map for locating downstream assets (MADSS)')
        .field('radio', 'The dependency map information within MADDS is complete.').id('mop_1_3_2_q1').options(effectivenessScale).required().end()
        .field('radio', 'The dependency map can be used for determining what services are provided by information technology and cyber assets.').id('mop_1_3_2_q2').options(effectivenessScale).required().end()
        .field('radio', 'The dependency map simulation mode is useful for determining what assets would be affected during an outage.').id('mop_1_3_2_q3').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 1.3.2').id('mop_1_3_2_overall').options(effectivenessScale).required().end();

    // Page 22: MOP 1.3.3
    const mop133Apps = ['SigAct', 'Rally', 'MADSS', 'Cyber 9-Line', 'A2IT'];
    builder.section('MOP 1.3.3: Event creation');
    mop133Apps.forEach(app => {
        builder.field('radio', `Event creation is intuitive for ${app}.`).id(`mop_1_3_3_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    mop133Apps.forEach(app => {
        builder.field('radio', `${app} provide enough data elements to make detailed incident tickets.`).id(`mop_1_3_3_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    mop133Apps.forEach(app => {
        builder.field('radio', `${app} provide a DISA tracking number for created incidents.`).id(`mop_1_3_3_q3_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.3.3').id('mop_1_3_3_overall').options(effectivenessScale).required().end();

    // Page 23-25: MOP 1.3.4
    builder.section('MOP 1.3.4: Alerts aid users in maintaining situational awareness');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Alerts can be customized to stay informed of changes for incidents they are following in ${app}.`).id(`mop_1_3_4_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Alerts keep the user informed about current event within their job role in ${app}.`).id(`mop_1_3_4_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Alerts received are timely in ${app}.`).id(`mop_1_3_4_q3_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The alerts received are configurable in ${app}.`).id(`mop_1_3_4_q4_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.3.4').id('mop_1_3_4_overall').options(effectivenessScale).required().end();

    // Page 26: MOP 1.3.5
    builder.section('MOP 1.3.5: Data flow across different security levels');
    allJcc2Apps.forEach(app => {
        builder.field('checkbox', `Most of my work with ${app} occurs within what environment?`).id(`mop_1_3_5_q1_${app.toLowerCase().replace(/ /g, '_')}`).multiple().options(['NIPR', 'SIPR', 'JWICS', 'Not Applicable']).end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 1.3.5').id('mop_1_3_5_overall').options(effectivenessScale).required().end();

    // Page 27: MOP 2.1.1
    builder.section('MOP 2.1.1: Provide data for cyber force assessment (JCC2 Readiness)')
        .field('radio', 'JCC2 Readiness allows me to see personnel with required training.').id('mop_2_1_1_q1').options(effectivenessScale).required().end()
        .field('radio', 'JCC2 Readiness allows me to see personnel with required abilities.').id('mop_2_1_1_q2').options(effectivenessScale).required().end()
        .field('radio', 'JCC2 Readiness allows me to see personnel with required certifications.').id('mop_2_1_1_q3').options(effectivenessScale).required().end()
        .field('radio', 'Information about force disposition from JCC2 Readiness is accurate.').id('mop_2_1_1_q4').options(effectivenessScale).required().end()
        .field('radio', 'Information about force disposition from JCC2 Readiness is complete.').id('mop_2_1_1_q5').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 2.1.1').id('mop_2_1_1_overall').options(effectivenessScale).required().end();

    // Page 28: MOP 2.1.2
    builder.section('MOP 2.1.2: Create and manage target lists (JCC2 Cyber-Ops)')
        .field('radio', 'JCC2 Cyber-Ops enables the user to create new target lists.').id('mop_2_1_2_q1').options(effectivenessScale).required().end()
        .field('radio', 'JCC2 Cyber-Ops enables the user to manage existing target lists.').id('mop_2_1_2_q2').options(effectivenessScale).required().end()
        .field('radio', 'Target list data is able to be exported from JCC2 Cyber-Ops.').id('mop_2_1_2_q3').options(effectivenessScale).required().end()
        .field('radio', 'Target can be annotated with objectives and priorities within JCC2 Cyber-Ops.').id('mop_2_1_2_q4').options(effectivenessScale).required().end()
        .field('radio', 'Path to target can be displayed within JCC2 Cyber-Ops.').id('mop_2_1_2_q5').options(effectivenessScale).required().end()
        .field('radio', 'Potential collateral damage risks can be viewed within JCC2 Cyber-Ops.').id('mop_2_1_2_q6').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 2.1.2').id('mop_2_1_2_overall').options(effectivenessScale).required().end();

    // Page 29: MOP 2.1.7
    builder.section('MOP 2.1.7: Perform force deconfliction (JCC2 Cyber Ops)')
        .field('radio', 'JCC2 Cyber-Ops prevents the assignment of personnel to more than one mission that would conflict.').id('mop_2_1_7_q1').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 2.1.7').id('mop_2_1_7_overall').options(effectivenessScale).required().end();

    // Page 30: MOP 2.1.9
    builder.section('MOP 2.1.9: Joint forces to perform collaborative planning (JCC2 Cyber Ops, JCC2 Readiness)')
        .field('radio', 'JCC2 provides tool for collaborative planning.').id('mop_2_1_9_q1').options(effectivenessScale).required().end()
        .field('radio', 'JCC2 provided applications allow for the development of courses of action.').id('mop_2_1_9_q2').options(effectivenessScale).required().end();
    ['NIPR', 'SIPR', 'JWICS'].forEach(env => {
        builder.field('radio', `When using JCC2 for planning, actions with the application occur with low latency on ${env}`).id(`mop_2_1_9_q3_${env.toLowerCase()}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Overall Effectiveness rating for MOP 2.1.9').id('mop_2_1_9_overall').options(effectivenessScale).required().end();

    // Page 31: MOP 2.3.1
    builder.section('MOP 2.3.1: Mission Change orders can be completed within Dispatch')
        .field('radio', 'Dispatch enables the creation of orders.').id('mop_2_3_1_q1').options(effectivenessScale).required().end()
        .field('radio', 'Dispatch enables changes to orders to be completed.').id('mop_2_3_1_q2').options(effectivenessScale).required().end()
        .field('radio', 'Dispatch enables collaborative order generation.').id('mop_2_3_1_q3').options(effectivenessScale).required().end()
        .field('radio', 'Dispatch enables compliance tracking of generated orders.').id('mop_2_3_1_q4').options(effectivenessScale).required().end()
        .field('radio', 'Orders generated within Dispatch are accurate.').id('mop_2_3_1_q5').options(effectivenessScale).required().end()
        .field('radio', 'Overall Effectiveness rating for MOP 2.3.1').id('mop_2_3_1_overall').options(effectivenessScale).required().end();

    // Page 32: MOP 2.3.2
    builder.section('MOP 2.3.2: JCC2 displays force disposition (JCC2 Readiness, JCC2 Cyber Ops)')
        .field('radio', 'Effectiveness rating for JCC2 facilitating the desired task.').id('mop_2_3_2_q1').options(effectivenessScale).required().end();

    // Page 33: MOP 2.4.1
    builder.section('MOP 2.4.1: Enable the user to assess mission-progress (JCC2 Cyber-Ops)')
        .field('radio', 'Mission progression can be measured within JCC2 Cyber-Ops.').id('mop_2_4_1_q1').options(effectivenessScale).required().end()
        .field('textarea', 'Describe any workarounds used for monitoring status of missions if any workarounds are used.').id('mop_2_4_1_q2').end()
        .field('checkbox', 'If workarounds are used what is the reason for use of them?').id('mop_2_4_1_q3').multiple().options(['Missing capabilities', 'Partially functional capabilities', 'External application works better']).end()
        .field('textarea', 'Provide Details on why workaround is used:').id('mop_2_4_1_q3_details').end()
        .field('radio', 'Overall Effectiveness rating for MOP 2.4.1').id('mop_2_4_1_overall').options(effectivenessScale).required().end();

    // Page 34: MOS 3.2.1 Training Assessment
    builder.section('MOS 3.2.1: User rating of JCC2 training')
        .field('radio', 'Did you receive any training before you used JCC2?').id('training_initial').options(['Yes', 'N/A', 'No']).required().end()
        .field('textarea', 'Please concisely describe any problems or issues and the operational impact:').id('training_initial_issues').required().conditional('training_initial', 'equals', ['No']).end()
        .field('checkbox', 'What format of training have you received?').id('training_format').multiple().options(['Instructor-Lead Training', 'Video-Based Training', 'On-The-Job Training', 'None']).end()
        .field('radio', 'Did you receive any supplemental training to aid your duties?').id('training_supplemental').options(['Yes', 'N/A', 'No']).required().end()
        .field('textarea', 'Please concisely describe any problems or issues and the operational impact:').id('training_supplemental_issues').required().conditional('training_supplemental', 'equals', ['No']).end()
        .field('radio', 'Do you want (more) training?').id('training_request').options(['Yes', 'N/A', 'No']).required().end()
        .field('textarea', 'Please concisely describe any problems or issues and the operational impact:').id('training_request_issues').required().conditional('training_request', 'equals', ['No', 'Yes']).end();
    
    const trainingAssessmentItems = [
        { id: 'training_assessment_info_relevant', label: 'All of the information covered was relevant to how I interact with the system.' },
        { id: 'training_assessment_prepared_easy', label: 'The training prepared me to easily use the system to accomplish my mission.' },
        { id: 'training_assessment_portrayed_ops', label: 'Training accurately portrayed operations in the field.' },
        { id: 'training_assessment_prepared_interact', label: 'The training prepared me to properly interact with the system.' },
        { id: 'training_assessment_prepared_solve', label: 'Training prepared me to solve common problems.' },
        { id: 'training_assessment_covered_important', label: 'Training adequately covered all important ways I interact with the system.' }
    ];
    trainingAssessmentItems.forEach(item => {
        builder.field('radio', item.label).id(item.id).options(agreementScale).required().end();
    });
    builder.section('Summative Training Rating');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Rate the effectiveness of ${app} training.`).id(`training_summative_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('textarea', 'Additional observations (positive or negative):').id('training_additional_observations').end();

    // Page 36: MOS 3.2.2 Documentation Rating
    builder.section('MOS 3.2.2: User rating of JCC2 documentation')
        .field('radio', 'Rate the effectiveness of any training documentation received. If none was received, select NA.').id('doc_rating').options(effectivenessScale).required().end()
        .field('checkbox', 'What format was JCC2 documentation delivered in?').id('doc_format').multiple().options(['Paper document', 'External video', 'Video embedded in application', 'Step-by-step SOP', 'Internal training document', 'None']).end()
        .field('radio', 'Does the provided documentation meet your needs?').id('doc_completeness').options(effectivenessScale).required().end();
    builder.section('Summative Documentation Rating');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Rate the effectiveness of ${app} documentation.`).id(`doc_summative_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });

    // Page 37-39: MOP 3.2.3 Help Desk Rating
    builder.section('MOP 3.2.3: User rating of JCC2 support (help desk)');
    allJcc2Apps.forEach(app => {
        builder.field('radio', `Help desk tickets can be submitted for ${app}.`).id(`helpdesk_q1_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `A confirmation of a ticket being submitted is received when contacting the help desk for ${app}?`).id(`helpdesk_q2_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The help desk is able to successfully fix my issues when contacted for ${app}.`).id(`helpdesk_q3_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    allJcc2Apps.forEach(app => {
        builder.field('radio', `The help desk is responsive for ${app}.`).id(`helpdesk_q4_${app.toLowerCase().replace(/ /g, '_')}`).options(effectivenessScale).required().end();
    });
    builder.field('radio', 'Summative Support Rating. Rate the effectiveness of JCC2 support.').id('helpdesk_summative').options(effectivenessScale).required().end()
        .field('textarea', 'Additional observations. Provide any additional observations (positive or negative):').id('helpdesk_additional_observations').end();

    // Page 40: Usability Evaluation
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
        builder.field('radio', item.label).id(item.id).options(usabilityScale).required().end();
    });

    // Page 41-42: Final Thoughts
    builder.section('User Evaluation of Overall System Suitability')
        .field('radio', 'Do you experience issues with data exchange or functional compatibility between JCC2 applications?').id('eval_internal_interop').options(yesNo).end()
        .field('textarea', 'If yes, please describe the problems, the specific applications involved, and the operational impact:').id('eval_internal_interop_details').required().conditional('eval_internal_interop', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues integrating data from external sources into JCC2?').id('eval_external_integ').options(yesNo).end()
        .field('textarea', 'If yes, please describe the problems, the specific data sources involved, and the operational impact:').id('eval_external_integ_details').required().conditional('eval_external_integ', 'equals', ['Yes']).end()
        .field('radio', "Do you experience issues with JCC2's compatibility with legacy software packages used in your operations?").id('eval_legacy_compat').options(yesNo).end()
        .field('textarea', 'If yes, please describe the problems, the specific legacy systems involved, and the operational impact:').id('eval_legacy_compat_details').required().conditional('eval_legacy_compat', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues sharing information up the chain of command or with other teams within the JCC2?').id('eval_info_sharing').options(yesNo).end()
        .field('textarea', 'If yes, please concisely describe any problems or issues and the operational impact:').id('eval_info_sharing_details').required().conditional('eval_info_sharing', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience performance slowdowns within JCC2 that negatively impact your ability to complete tasks efficiently?').id('eval_performance').options(yesNo).end()
        .field('textarea', 'If yes, please describe the specific situations where slowdowns occur, the perceived cause (if known), and the operational impact:').id('eval_performance_details').required().conditional('eval_performance', 'equals', ['Yes']).end()
        .field('radio', 'Do you experience issues accessing specific JCC2 databases or applications due to permission restrictions?').id('eval_access_control').options(yesNo).end()
        .field('textarea', 'If yes, please describe the specific resources you are unable to access and the operational impact:').id('eval_access_control_details').required().conditional('eval_access_control', 'equals', ['Yes']).end()
        .field('radio', 'Are the current role-based access controls within JCC2 appropriate for your operational needs?').id('eval_rbac').options(yesNo).end()
        .field('textarea', 'If no, please explain why and suggest improvements:').id('eval_rbac_details').required().conditional('eval_rbac', 'equals', ['No']).end()
        .field('radio', 'Is it clear who to contact to request changes to access permissions?').id('eval_access_requests').options(yesNo).end()
        .field('textarea', 'If no, please explain the difficulties you have encountered:').id('eval_access_requests_details').required().conditional('eval_access_requests', 'equals', ['No']).end()
        .field('radio', 'Have you previously submitted change or feature requests to the JCC2 development teams or Program Office?').id('eval_feature_requests').options(yesNo).end()
        .field('radio', 'Are there any changes or improvements you would like to see implemented in JCC2?').id('eval_improvements').options(yesNo).end()
        .field('textarea', 'If you answered "Yes" to question b, please describe the desired changes or improvements in detail:').id('eval_improvements_details').required().conditional('eval_improvements', 'equals', ['Yes']).end()
        .field('textarea', 'Critical Issues. Please list any critical issues you feel must be resolved to significantly increase JCC2\'s effectiveness for your operations:').id('critical_issues').end()
        .field('textarea', 'Shout Outs. Please list any features you encountered that greatly improved the speed, quality, or effectiveness of your duties.').id('shout_outs').end()
        .field('textarea', 'Final Thoughts. Are there any additional items you would like to address that have not been documented yet?').id('final_thoughts').end();

    return builder.build();
  }
}