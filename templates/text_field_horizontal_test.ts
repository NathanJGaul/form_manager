import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/core";

/**
 * Test template for horizontal layout and grouping with text fields
 */
export class TextFieldHorizontalTest {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("Text Field Horizontal Layout Test")
      .description("Test template for horizontal layout and grouping with text fields")
      .author("Test")
      .version("1.0.0")
      .tags("test", "horizontal", "text", "grouping");

    // Section 1: Individual horizontal text fields
    builder
      .section("Individual Horizontal Text Fields")
      .id("individual_horizontal")
      .field("text", "First Name")
      .id("first_name")
      .required()
      .layout("horizontal")
      .end()
      .field("text", "Last Name")
      .id("last_name")
      .required()
      .layout("horizontal")
      .end()
      .field("email", "Email Address")
      .id("email")
      .required()
      .layout("horizontal")
      .end()
      .field("tel", "Phone Number")
      .id("phone")
      .layout("horizontal")
      .end()
      .field("number", "Age")
      .id("age")
      .layout("horizontal")
      .end()
      .field("date", "Birth Date")
      .id("birth_date")
      .layout("horizontal")
      .end();

    // Section 2: Grouped horizontal text fields
    builder
      .section("Grouped Horizontal Text Fields")
      .id("grouped_horizontal")
      .field("text", "Street Address")
      .id("street_address")
      .required()
      .layout("horizontal")
      .grouping(true, "address_group")
      .end()
      .field("text", "City")
      .id("city")
      .required()
      .layout("horizontal")
      .grouping(true, "address_group")
      .end()
      .field("text", "State")
      .id("state")
      .required()
      .layout("horizontal")
      .grouping(true, "address_group")
      .end()
      .field("text", "ZIP Code")
      .id("zip_code")
      .required()
      .layout("horizontal")
      .grouping(true, "address_group")
      .end();

    // Section 3: Mixed types grouped
    builder
      .section("Mixed Types Grouped")
      .id("mixed_grouped")
      .field("text", "Company Name")
      .id("company_name")
      .required()
      .layout("horizontal")
      .grouping(true, "company_info")
      .end()
      .field("email", "Company Email")
      .id("company_email")
      .required()
      .layout("horizontal")
      .grouping(true, "company_info")
      .end()
      .field("tel", "Company Phone")
      .id("company_phone")
      .layout("horizontal")
      .grouping(true, "company_info")
      .end()
      .field("number", "Years in Business")
      .id("years_in_business")
      .layout("horizontal")
      .grouping(true, "company_info")
      .end();

    // Section 4: Regular vertical layout for comparison
    builder
      .section("Regular Vertical Layout")
      .id("vertical_layout")
      .field("text", "Additional Notes")
      .id("notes")
      .end()
      .field("text", "Comments")
      .id("comments")
      .end();

    return builder.build();
  }
}