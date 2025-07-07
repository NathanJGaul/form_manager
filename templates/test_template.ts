import { TemplateBuilder } from '../src/programmatic';

new TemplateBuilder()
    .create('My Template')
    .section('Basic Info')
      .field('text', 'Name')
        .required()
        .defaultValue('Testing 123')
        .end()
    .build()