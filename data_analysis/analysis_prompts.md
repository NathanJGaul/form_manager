# JCC2 section ratings across all applications

Explore the creation of a visual or table by creating a new notebook in the notebooks directory to explore the data (using the same method in @notebooks/jcc2_executive_summary.ipynb to import the data). The sections below ask the user to rate the applications applicable to each section in addition to the overall stystem (JCC2). Create tables and visuals when the applications (and overall JCC2) on the y axis and sections on the x axis. If the application is not applicable to that section display an 'x' and if an application is applicable to that section but there is no data indicate that with '*' character. Otherwise, the average score should 

- mop_1_1_1
- mos_1_1_2
- mop_1_1_3
- reporting_and_data_export
- mop_1_1_5
- mop_1_2_1
- mop_1_2_2
- mos_1_3_1
- mop_1_3_2
- mop_1_3_3
- mop_1_3_4
- mop_1_3_5
- mop_2_1_1
- mop_2_1_2
- mop_2_1_7
- mop_2_1_9
- mop_2_3_1
- mop_2_3_2
- mop_2_4_1
- mos_3_2_1
- mos_3_2_2
- mop_3_2_3

Data Explanation and Interpretation Notes:

- 'NA' or 'N/A' or 'Not Applicable': This indicates the user was presented with that question but chose the Not Applicable option (they did not find the question or task applicable to their use of the application)
- 'null': This indicates the user wasn't presented with this particular question as they do not use the application it is applicable to.
- Each section is applicable to one or more or all applications. Each column (feature) id ends with the application id if it is applicable to a single application, if otherwise it is applicable to JCC2 overall
  - for example: mop_1_1_1.intelligence_data_provided_threathub -> User rating of the Intelligence Data Provided within Threathub, mop_1_1_1.intelligence_data_overall_effectiveness -> User rating of the Intelligence Data Provided by JCC2 overall

Incomplete Table Example

|                | MOP 1.1.1 | MOS 1.1.2 | MOP 1.1.3 | Reporting and Data Export | MOP 1.1.5 | ... |   |   |   |   |   |   |   |   |   |
|----------------|-----------|-----------|-----------|---------------------------|-----------|-----|---|---|---|---|---|---|---|---|---|
| A2IT           | *         |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| CAD            | 3.8       |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Codex          |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Crucible       |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Cyber 9-Line   |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Dispatch       |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| JCC2 Cyber Ops |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| JCC2 Readiness |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| MADSS          |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Rally          |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| REDMAP         |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| SigAct         |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Threat Hub     |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Triage         |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| Unity          |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |
| JCC2 Overall   |           |           |           |                           |           |     |   |   |   |   |   |   |   |   |   |