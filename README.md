# Form Manager

A flexible, TypeScript-based dynamic form management system with programmatic templating, advanced conditional logic, and comprehensive export capabilities.

## 🚀 Features

- **Dynamic Form Templates** - Create complex forms with programmatic API or visual builder
- **Advanced Conditional Logic** - Show/hide fields and sections based on compound conditions (AND/OR)
- **Multiple Export Formats** - Export forms as PDF, CSV, or JSON
- **Responsive Design** - Mobile-friendly forms with modern UI components
- **Persistent Storage** - Auto-save functionality with localStorage
- **Developer Tools** - Mock data generation and CSV integrity verification
- **Section Management** - N/A functionality and multi-section forms
- **Type-Safe** - Full TypeScript support with strict typing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/form_manager.git
cd form_manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
form_manager/
├── src/
│   ├── components/         # React components
│   ├── programmatic/       # Programmatic template API
│   ├── routes/            # Route components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── templates/             # Example form templates
├── tests/                 # E2E test suite
└── docs/                  # Documentation
```

## 🎯 Quick Start

### Creating a Form Template Programmatically

```typescript
import { TemplateBuilder } from './src/programmatic';

const template = new TemplateBuilder()
  .id('survey-form')
  .title('Customer Survey')
  .description('Please share your feedback')
  .section('basic-info')
    .title('Basic Information')
    .field('name')
      .type('text')
      .label('Your Name')
      .required()
      .build()
    .field('email')
      .type('email')
      .label('Email Address')
      .required()
      .build()
    .build()
  .section('feedback')
    .title('Feedback')
    .field('rating')
      .type('radio')
      .label('How would you rate our service?')
      .options(['Excellent', 'Good', 'Average', 'Poor'])
      .required()
      .build()
    .field('comments')
      .type('textarea')
      .label('Additional Comments')
      .conditional({
        dependsOn: 'rating',
        values: ['Average', 'Poor'],
        operator: 'equals'
      })
      .build()
    .build()
  .build();
```

### Using the Form Builder UI

1. Navigate to the Dashboard
2. Click "Form Builder"
3. Add sections and fields using the visual interface
4. Configure conditional logic for dynamic behavior
5. Save your template

### Filling Out Forms

1. From the Dashboard, click on any template
2. Complete the form fields
3. Navigate between sections
4. Submit or save progress

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with UI
- `npm run build:inline` - Create single-file HTML build

### Testing

The project uses Playwright for end-to-end testing:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test tests/dashboard.spec.ts
```

### Developer Tools

Access developer tools in development mode:
- **Mock Data Generator** - Fill forms with realistic test data
- **CSV Integrity Checker** - Verify CSV export accuracy
- **Form Dev Tools** - Access via dropdown menu in form view

## 📚 Documentation

- [Project Structure](docs/ai-context/project-structure.md) - Complete tech stack and file organization
- [Programmatic API](docs/FIELD_TYPES_AND_PROGRAMMATIC_API.md) - Template creation API reference
- [Conditional Logic](docs/compound-conditionals-implementation.md) - Advanced conditional patterns
- [CSV Export](docs/CSV_EXPORT_IMPROVEMENTS.md) - Export functionality details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- PDF generation powered by [pdf-lib](https://pdf-lib.js.org/)