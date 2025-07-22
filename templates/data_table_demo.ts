import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";

/**
 * Demonstration template for DataTable field functionality
 * 
 * This template showcases various ways to use the DataTable field type,
 * including different column types, validation, and dynamic row management.
 */
export class DataTableDemo {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("DataTable Demonstration Form")
      .description(
        "A comprehensive demonstration of the DataTable field type, showing various column types, validation rules, and configurations"
      )
      .author("Nathan Gaul")
      .version("1.0.0")
      .tags("demo", "datatable", "example");

    // Section 1: Basic DataTable
    builder
      .section("Basic Employee Information")
      .id("basic_info")
      .text(
        "This section demonstrates a basic DataTable with common column types for employee data entry."
      );

    builder
      .field("datatable", "Team Members")
      .id("team_members")
      .columns([
        {
          id: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Enter name",
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          id: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "email@example.com"
        },
        {
          id: "role",
          label: "Role",
          type: "select",
          required: true,
          options: ["Developer", "Designer", "Manager", "QA Engineer", "DevOps"]
        },
        {
          id: "experience",
          label: "Years of Experience",
          type: "number",
          validation: { min: 0, max: 50 }
        },
        {
          id: "start_date",
          label: "Start Date",
          type: "date"
        }
      ])
      .minRows(1)
      .maxRows(10)
      .defaultValue({
        columns: [], // Will be populated from field definition
        rows: [
          {
            name: "John Doe",
            email: "john.doe@example.com",
            role: "Developer",
            experience: "5",
            start_date: "2019-03-15"
          }
        ]
      })
      .required()
      .end();

    // Section 2: Product Inventory
    builder
      .section("Product Inventory Management")
      .id("inventory")
      .text(
        "Track product inventory with various data types including checkboxes for features."
      );

    builder
      .field("datatable", "Product Catalog")
      .id("products")
      .columns([
        {
          id: "sku",
          label: "SKU",
          type: "text",
          required: true,
          validation: { pattern: "^[A-Z]{3}-[0-9]{4}$" },
          placeholder: "ABC-1234"
        },
        {
          id: "name",
          label: "Product Name",
          type: "text",
          required: true
        },
        {
          id: "category",
          label: "Category",
          type: "select",
          required: true,
          options: ["Electronics", "Clothing", "Food", "Books", "Other"]
        },
        {
          id: "price",
          label: "Price ($)",
          type: "number",
          required: true,
          validation: { min: 0.01, max: 99999.99 }
        },
        {
          id: "quantity",
          label: "Quantity in Stock",
          type: "number",
          required: true,
          validation: { min: 0 }
        },
        {
          id: "features",
          label: "Features",
          type: "checkbox",
          options: ["New", "Featured", "On Sale", "Limited Edition"]
        }
      ])
      .minRows(1)
      .allowDeleteRows(false) // Don't allow deletion of products
      .end();

    // Section 3: Research Data Collection
    builder
      .section("Research Data Collection")
      .id("research_data")
      .text(
        "This section simulates the JCC2-style data collection with runs/iterations."
      );

    builder
      .field("datatable", "Test Run Results")
      .id("test_runs")
      .columns([
        {
          id: "run_number",
          label: "Run #",
          type: "number",
          required: true,
          validation: { min: 1 }
        },
        {
          id: "application",
          label: "Application Used",
          type: "select",
          required: true,
          options: ["App A", "App B", "App C", "App D"]
        },
        {
          id: "data_gathering",
          label: "Data Gathering Supported",
          type: "radio",
          required: true,
          options: ["Yes", "No", "N/A"]
        },
        {
          id: "successful",
          label: "Test Successful",
          type: "radio",
          required: true,
          options: ["Yes", "No", "Partial"]
        },
        {
          id: "notes",
          label: "Notes",
          type: "textarea",
          placeholder: "Enter any observations..."
        }
      ])
      .minRows(1)
      .maxRows(20)
      .defaultValue({
        columns: [], // Will be populated from field definition
        rows: [
          {
            run_number: "1",
            application: "",
            data_gathering: "",
            successful: "",
            notes: ""
          }
        ]
      })
      .end();

    // Section 4: Contact Information
    builder
      .section("Emergency Contacts")
      .id("contacts")
      .text(
        "Maintain a list of emergency contacts with phone and relationship information."
      );

    builder
      .field("datatable", "Contact List")
      .id("emergency_contacts")
      .columns([
        {
          id: "name",
          label: "Contact Name",
          type: "text",
          required: true
        },
        {
          id: "relationship",
          label: "Relationship",
          type: "select",
          required: true,
          options: ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]
        },
        {
          id: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          placeholder: "(555) 123-4567"
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "contact@example.com"
        },
        {
          id: "primary",
          label: "Primary Contact",
          type: "checkbox",
          options: ["Yes"]
        }
      ])
      .minRows(1)
      .maxRows(5)
      .validation({ minRows: 1 }) // At least one emergency contact required
      .required()
      .end();

    // Section 5: Advanced Configuration
    builder
      .section("Advanced DataTable Features")
      .id("advanced")
      .text(
        "Demonstrates advanced features like conditional display and validation."
      );

    builder
      .field("radio", "Enable Advanced Table?")
      .id("enable_advanced")
      .options(["Yes", "No"])
      .defaultValue("No")
      .required()
      .end();

    builder
      .field("datatable", "Configuration Settings")
      .id("config_settings")
      .conditional("enable_advanced", "equals", ["Yes"])
      .columns([
        {
          id: "setting_name",
          label: "Setting Name",
          type: "text",
          required: true
        },
        {
          id: "value",
          label: "Value",
          type: "text",
          required: true
        },
        {
          id: "type",
          label: "Type",
          type: "select",
          required: true,
          options: ["String", "Number", "Boolean", "JSON"]
        },
        {
          id: "description",
          label: "Description",
          type: "textarea"
        }
      ])
      .allowAddRows(true)
      .allowDeleteRows(true)
      .end();

    // Summary section
    builder
      .section("Form Summary")
      .id("summary")
      .text(
        "This form demonstrates the versatility of DataTable fields for collecting structured, tabular data. DataTables support:"
      )
      .text(
        "• Multiple column types (text, number, select, checkbox, radio, etc.)\n" +
        "• Column-level validation and requirements\n" +
        "• Dynamic row addition and deletion\n" +
        "• Min/max row constraints\n" +
        "• Default values\n" +
        "• Conditional display\n" +
        "• CSV export with proper serialization"
      );

    return builder.build();
  }
}