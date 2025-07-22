import { TemplateBuilder } from '../src/programmatic';

new TemplateBuilder()
    .create('My Template')
    .version('1.0.0')
    .section('Basic Info')
      .field('text', 'Name')
        .required()
        .defaultValue('Testing 123')
        .end()
    .build()