import {
  TemplateBuilder,
  ProgrammaticTemplate,
} from "../src/programmatic/index";

/**
 * Test template for empty section hiding functionality
 */
export class EmptySectionTest {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create("Empty Section Test")
      .description("Test template to verify that sections with no visible fields are hidden")
      .author("Test")
      .version("1.0.0")
      .tags("test", "conditional", "sections");

    // Section 1: Always visible
    builder
      .section("Always Visible Section")
      .id("always_visible")
      .field("text", "Your Name")
      .id("name")
      .required()
      .end()
      .field("radio", "Show Optional Sections?")
      .id("show_optional")
      .options(["Yes", "No"])
      .defaultValue("No")
      .layout("horizontal")
      .end();

    // Section 2: Conditionally visible (should hide when show_optional = "No")
    builder
      .section("Conditional Section A")
      .id("conditional_a")
      .conditional("show_optional", "equals", ["Yes"])
      .field("text", "Optional Field A1")
      .id("optional_a1")
      .end()
      .field("text", "Optional Field A2")
      .id("optional_a2")
      .end();

    // Section 3: Fields all conditionally hidden (should hide entire section when show_optional = "No")
    builder
      .section("Section with All Conditional Fields")
      .id("all_conditional_fields")
      .field("text", "Conditional Field B1")
      .id("conditional_b1")
      .conditional("show_optional", "equals", ["Yes"])
      .end()
      .field("text", "Conditional Field B2")
      .id("conditional_b2")
      .conditional("show_optional", "equals", ["Yes"])
      .end()
      .field("textarea", "Conditional Field B3")
      .id("conditional_b3")
      .conditional("show_optional", "equals", ["Yes"])
      .end();

    // Section 4: Mixed conditional and non-conditional fields (should show section but only visible fields)
    builder
      .section("Mixed Conditional and Regular Fields")
      .id("mixed_fields")
      .field("text", "Always Visible Field")
      .id("always_visible_field")
      .required()
      .end()
      .field("text", "Sometimes Visible Field")
      .id("sometimes_visible")
      .conditional("show_optional", "equals", ["Yes"])
      .end();

    // Section 5: Always visible
    builder
      .section("Final Section")
      .id("final_section")
      .field("textarea", "Comments")
      .id("comments")
      .end();

    return builder.build();
  }
}