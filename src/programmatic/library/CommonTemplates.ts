import { TemplateBuilder } from "../builder/TemplateBuilder";
import { ProgrammaticTemplate } from "../types";
import { JCC2UserQuestionnaireV3 } from "../../../templates/jcc2_questionnaire_v3";
import { JCC2UserQuestionnaireV4 } from "../../../templates/jcc2_questionnaire_v4";

/**
 * Library of common template patterns and pre-built templates
 */
export class CommonTemplates {
  /**
   * Create a basic contact form template
   */
  static createContactForm(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create("Contact Form")
      .description("Basic contact form with name, email, and message")
      .tags("contact", "basic", "common")
      .section("Contact Information")
      .field("text", "Full Name")
      .id("full_name")
      .required()
      .placeholder("Enter your full name")
      .end()
      .field("email", "Email Address")
      .id("email")
      .required()
      .placeholder("Enter your email address")
      .pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
      .end()
      .field("tel", "Phone Number")
      .id("phone")
      .optional()
      .placeholder("Enter your phone number")
      .end()
      .field("textarea", "Message")
      .id("message")
      .required()
      .placeholder("Enter your message")
      .minLength(10)
      .maxLength(1000)
      .end()
      .autoSave(2000)
      .showProgress()
      .build();
  }

  /**
   * Create a multi-category survey template
   */
  static createSurveyTemplate(): ProgrammaticTemplate {
    const categories = ["product", "service", "support"];

    return new TemplateBuilder()
      .create("Customer Satisfaction Survey")
      .description("Multi-category customer satisfaction survey")
      .tags("survey", "satisfaction", "rating")
      .variables({ categories })
      .section("User Information")
      .field("select", "Customer Type")
      .id("customer_type")
      .required()
      .options(["new", "existing", "premium"])
      .end()
      .forEach(categories, (category: string, index: number, builder: TemplateBuilder) => {
        builder
          .section(
            `${category.charAt(0).toUpperCase() + category.slice(1)} Feedback`
          )
          .field("radio", `Rate our ${category}`)
          .id(`${category}_rating`)
          .required()
          .options(["1", "2", "3", "4", "5"])
          .layout("horizontal")
          .end()
          .field("textarea", `What can we improve in ${category}?`)
          .id(`${category}_improvement`)
          .optional()
          .minLength(10)
          .end();
      })
      .section("Overall Feedback")
      .field("textarea", "Additional Comments")
      .id("additional_comments")
      .optional()
      .placeholder("Any additional feedback?")
      .end()
      .autoSave(3000)
      .showProgress()
      .build();
  }

  /**
   * Create a user registration form template
   */
  static createRegistrationForm(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create("User Registration Form")
      .description("Complete user registration with account details")
      .tags("registration", "user", "account")
      .section("Personal Information")
      .field("text", "First Name")
      .id("first_name")
      .required()
      .end()
      .field("text", "Last Name")
      .id("last_name")
      .required()
      .end()
      .field("date", "Date of Birth")
      .id("date_of_birth")
      .required()
      .end()
      .field("select", "Gender")
      .id("gender")
      .optional()
      .options(["male", "female", "other", "prefer_not_to_say"])
      .end()
      .section("Account Details")
      .field("text", "Username")
      .id("username")
      .required()
      .minLength(3)
      .maxLength(20)
      .end()
      .field("email", "Email Address")
      .id("email")
      .required()
      .pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
      .end()
      .field("text", "Password")
      .id("password")
      .required()
      .minLength(8)
      .end()
      .field("text", "Confirm Password")
      .id("confirm_password")
      .required()
      .end()
      .section("Preferences")
      .field("checkbox", "Interests")
      .id("interests")
      .multiple()
      .options(["technology", "sports", "music", "travel", "reading"])
      .layout("horizontal")
      .end()
      .field("radio", "Communication Preference")
      .id("communication_preference")
      .options(["email", "sms", "phone", "mail"])
      .layout("horizontal")
      .end()
      .field("checkbox", "Newsletter Subscriptions")
      .id("newsletters")
      .multiple()
      .options(["weekly_digest", "product_updates", "promotions"])
      .layout("horizontal")
      .end()
      .section("Terms and Conditions")
      .field("checkbox", "Agreements")
      .id("agreements")
      .required()
      .options([
        "I agree to the Terms of Service",
        "I agree to the Privacy Policy",
      ])
      .end()
      .autoSave(1500)
      .showProgress()
      .build();
  }

  /**
   * Helper function to create a standard email field
   */
  static createEmailField(
    id: string,
    label: string,
    required: boolean = true
  ): ProgrammaticTemplate {
    // This would return a field configuration object
    return {
      id,
      type: "email",
      label,
      required,
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    };
  }

  /**
   * Helper function to create a rating field
   */
  static createRatingField(
    id: string,
    label: string,
    min: number = 1,
    max: number = 5
  ): ProgrammaticTemplate {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(i.toString());
    }

    return {
      id,
      type: "radio",
      label,
      required: true,
      options,
    };
  }

  /**
   * Create JCC2 User Questionnaire V3 template
   */
  static createJCC2QuestionnaireV3(): ProgrammaticTemplate {
    return JCC2UserQuestionnaireV3.create();
  }

  /**
   * Create JCC2 User Questionnaire V4 template (comprehensive version)
   */
  static createJCC2QuestionnaireV4(): ProgrammaticTemplate {
    return JCC2UserQuestionnaireV4.create();
  }

  /**
   * Get list of available templates
   */
  static listTemplates(): string[] {
    return ["contact", "survey", "registration", "jcc2-questionnaire", "jcc2-questionnaire-v4"];
  }

  /**
   * Get a specific template by name
   */
  static getTemplate(name: string): ProgrammaticTemplate {
    switch (name.toLowerCase()) {
      case "contact":
        return this.createContactForm();
      case "survey":
        return this.createSurveyTemplate();
      case "registration":
        return this.createRegistrationForm();
      case "jcc2-questionnaire":
      case "jcc2":
        return this.createJCC2QuestionnaireV4(); // Changed to V4 as default
      case "jcc2-questionnaire-v3":
      case "jcc2-v3":
        return this.createJCC2QuestionnaireV3();
      case "jcc2-questionnaire-v4":
      case "jcc2-v4":
        return this.createJCC2QuestionnaireV4();
      default:
        throw new Error(`Template '${name}' not found`);
    }
  }
}
