import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';
import { DataTableColumn } from '../../types/form';

/**
 * Example template demonstrating DataTable functionality with default values
 */
export class DataTableExample {
  static create(): ProgrammaticTemplate {
    const teamMemberColumns: DataTableColumn[] = [
      {
        id: 'index',
        label: '#',
        type: 'text',
        autoIndex: true
      },
      {
        id: 'name',
        label: 'Full Name',
        type: 'text',
        required: true
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        required: true
      },
      {
        id: 'role',
        label: 'Role',
        type: 'select',
        options: ['Developer', 'Designer', 'Manager', 'QA Engineer', 'DevOps'],
        required: true
      },
      {
        id: 'experience',
        label: 'Years of Experience',
        type: 'number',
        validation: { min: 0, max: 50 }
      },
      {
        id: 'skills',
        label: 'Skills',
        type: 'checkbox',
        options: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker'],
      }
    ];

    const contactColumns: DataTableColumn[] = [
      {
        id: 'name',
        label: 'Contact Name',
        type: 'text',
        required: true
      },
      {
        id: 'company',
        label: 'Company',
        type: 'text'
      },
      {
        id: 'phone',
        label: 'Phone',
        type: 'tel'
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        required: true
      },
      {
        id: 'type',
        label: 'Contact Type',
        type: 'radio',
        options: ['Client', 'Vendor', 'Partner', 'Other']
      }
    ];

    return new TemplateBuilder()
      .create('DataTable Example Form')
      .description('Demonstrates DataTable functionality with default values and mock data generation')
      .author('Claude')
      .version('1.0.0')
      .tags('example', 'datatable', 'mock-data')
      
      .section('Basic Information')
        .field('text', 'Project Name')
          .id('project_name')
          .defaultValue('New Project')
          .required()
          .end()
        .field('date', 'Start Date')
          .id('start_date')
          .defaultValue(new Date().toISOString().split('T')[0])
          .required()
          .end()
        .field('select', 'Project Status')
          .id('status')
          .options(['Planning', 'In Progress', 'Review', 'Completed'])
          .defaultValue('Planning')
          .end()
          
      .section('Team Members')
        .field('datatable', 'Team Member List')
          .id('team_members')
          .columns(teamMemberColumns)
          .minRows(2)
          .maxRows(10)
          .defaultValue({
            columns: teamMemberColumns,
            rows: [
              {
                index: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'Developer',
                experience: 5,
                skills: ['JavaScript', 'React']
              },
              {
                index: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'Designer',
                experience: 3,
                skills: ['TypeScript', 'React']
              }
            ]
          })
          .required()
          .end()
          
      .section('Contacts')
        .field('datatable', 'Contact List')
          .id('contacts')
          .columns(contactColumns)
          .minRows(1)
          .maxRows(20)
          .allowAddRows()
          .allowDeleteRows()
          .end()
          
      .section('Additional Information')
        .field('textarea', 'Project Description')
          .id('description')
          .defaultValue('This project aims to...')
          .maxLength(500)
          .end()
        .field('checkbox', 'Technologies Used')
          .id('technologies')
          .options(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'])
          .multiple()
          .defaultValue(['React', 'TypeScript'])
          .end()
          
      .build();
  }
}