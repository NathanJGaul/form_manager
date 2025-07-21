import React, { useState } from "react";
import * as Icons from "lucide-react";
import { TDLConverter } from "../programmatic/tdl/converter";
import { JCC2UserQuestionnaire } from "../programmatic/examples/JCC2UserQuestionnaire";
import { decodeFromSharing } from "../utils/dataSharing";
import { useToast } from "../contexts/ToastContext";
import { WorkingComprehensiveTemplate } from "../programmatic/examples/WorkingComprehensiveTemplate";
import { DefaultValueExample } from "../programmatic/examples/DefaultValueExample";
import { ParagraphFieldExample } from "../programmatic/examples/ParagraphFieldExample";
import { CommonTemplates } from "../programmatic/library/CommonTemplates";
import { HorizontalGroupingDemo } from "../../templates/horizontal_grouping_demo";
import { SectionConditionalsTestTemplate } from "../../templates/section_conditionals_test";
import { JCC2DataCollectionFormV3 } from "../../templates/jcc2_data_collection_form_v3";
import { TemplateBuilder } from "../programmatic/builder/TemplateBuilder";
import * as ProgrammaticModules from "../programmatic";
import { FormTemplate, FormField } from "../types/form";
import { ProgrammaticTemplate } from "../programmatic/types";

interface ProgrammaticImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: FormTemplate) => void;
}

interface ConversionResult {
  success: boolean;
  template?: FormTemplate;
  warnings?: string[];
  errors?: string[];
}

export const ProgrammaticImportModal: React.FC<
  ProgrammaticImportModalProps
> = ({ isOpen, onClose, onImport }) => {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<
    "file" | "examples" | "code" | "share"
  >("examples");
  const [codeInput, setCodeInput] = useState("");
  const [shareInput, setShareInput] = useState("");
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const converter = new TDLConverter();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      const content = await file.text();
      setCodeInput(content);
      setConversionResult(null);
    } catch (error) {
      setConversionResult({
        success: false,
        errors: [
          `Failed to read file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      });
    }
  };

  const convertProgrammaticTemplate = (
    programmaticTemplate: ProgrammaticTemplate
  ): ConversionResult => {
    try {
      const conversionResult = converter.convertToGUI(programmaticTemplate, {
        preserveIds: true,
      });

      if (conversionResult.success && conversionResult.result) {
        // Debug: Log the conversion result to check layout and grouping properties
        // console.log('Conversion result:', conversionResult.result);

        // Transform to FormTemplate format
        const formTemplate: FormTemplate = {
          id: crypto.randomUUID(),
          name: programmaticTemplate.metadata.name,
          description: programmaticTemplate.metadata.description || "",
          sections: conversionResult.result.sections.map((section) => ({
            id: section.id,
            title: section.title,
            fields: section.fields.map((field) => ({
              id: field.id,
              type: field.type as FormField["type"],
              label: field.label,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options,
              multiple: field.multiple,
              layout: field.layout,
              grouping: field.grouping,
              validation: field.validation,
              conditional: field.conditional,
              defaultValue: field.defaultValue,
              content: field.content, // Support content field for text type
            })),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Debug: Log the final form template to check if properties are preserved
        // console.log('Final form template:', formTemplate);
        // console.log('Sample field properties:', formTemplate.sections[1]?.fields[0]);

        return {
          success: true,
          template: formTemplate,
          warnings: conversionResult.warnings,
        };
      } else {
        return {
          success: false,
          errors: conversionResult.errors?.map((err) =>
            typeof err === "string" ? err : err.message
          ) || ["Conversion failed"],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          `Conversion error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      };
    }
  };

  const handleExampleImport = (exampleName: string) => {
    try {
      let programmaticTemplate;

      switch (exampleName) {
        case "jcc2":
          programmaticTemplate = JCC2UserQuestionnaire.create();
          break;
        case "comprehensive":
          programmaticTemplate = WorkingComprehensiveTemplate.create();
          break;
        case "simple":
          programmaticTemplate = WorkingComprehensiveTemplate.createSimple();
          break;
        case "contact":
          programmaticTemplate = CommonTemplates.createContactForm();
          break;
        case "survey":
          programmaticTemplate = CommonTemplates.createSurveyTemplate();
          break;
        case "registration":
          programmaticTemplate = CommonTemplates.createRegistrationForm();
          break;
        case "defaultValues":
          programmaticTemplate = DefaultValueExample.create();
          break;
        case "textFields":
          programmaticTemplate = ParagraphFieldExample.create();
          break;
        case "horizontalGrouping":
          programmaticTemplate = HorizontalGroupingDemo.create();
          break;
        case "sectionConditionals":
          programmaticTemplate = SectionConditionalsTestTemplate.create();
          break;
        case "jcc2v3":
          programmaticTemplate = JCC2DataCollectionFormV3.create();
          break;
        default:
          throw new Error("Unknown example template");
      }

      const result = convertProgrammaticTemplate(programmaticTemplate);
      setConversionResult(result);
    } catch (error) {
      setConversionResult({
        success: false,
        errors: [
          `Failed to load example: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      });
    }
  };

  const handleCodeImport = () => {
    try {
      // Parse and resolve imports
      const { cleanCode, modules } = parseAndResolveImports(codeInput);

      // Try to parse as a class export first
      const programmaticTemplate = parseTemplateFromCode(cleanCode, modules);

      const result = convertProgrammaticTemplate(programmaticTemplate);
      setConversionResult(result);
    } catch (error) {
      setConversionResult({
        success: false,
        errors: [
          `Failed to parse code: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      });
    }
  };

  const handleShareImport = async () => {
    try {
      const decodedData = await decodeFromSharing(shareInput.trim());

      // Check if the decoded data is a FormTemplate (can be imported directly)
      if (
        decodedData &&
        typeof decodedData === "object" &&
        "sections" in decodedData &&
        "createdAt" in decodedData
      ) {
        // This is already a FormTemplate, use it directly
        setConversionResult({
          success: true,
          template: decodedData as FormTemplate,
        });
      } else {
        // This might be a ProgrammaticTemplate, try to convert it
        const result = convertProgrammaticTemplate(
          decodedData as ProgrammaticTemplate
        );
        setConversionResult(result);
      }
    } catch (error) {
      setConversionResult({
        success: false,
        errors: [
          `Failed to decode share string: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      });
    }
  };

  const parseAndResolveImports = (
    code: string
  ): { cleanCode: string; modules: Record<string, unknown> } => {
    const modules: Record<string, unknown> = {};

    // Always provide TemplateBuilder as default
    modules.TemplateBuilder = TemplateBuilder;

    // Remove import statements and collect imported modules
    let cleanCode = code.replace(
      /^import\s+.*?from\s+['"]([^'"]+)['"];?\s*$/gm,
      (match, modulePath) => {
        // Handle all programmatic imports
        if (
          modulePath.includes("programmatic") ||
          modulePath.startsWith("./") ||
          modulePath.startsWith("../")
        ) {
          try {
            // Extract import specifiers
            const importMatch = match.match(/^import\s+(.+?)\s+from/);
            if (importMatch) {
              const importSpec = importMatch[1].trim();

              // Handle different import types
              if (importSpec.startsWith("{") && importSpec.endsWith("}")) {
                // Named imports: { TemplateBuilder }
                const namedImports = importSpec
                  .slice(1, -1)
                  .split(",")
                  .map((s) => s.trim());
                namedImports.forEach((importName) => {
                  const cleanName = importName
                    .replace(/\s+as\s+\w+/, "")
                    .trim();
                  if (
                    ProgrammaticModules[
                      cleanName as keyof typeof ProgrammaticModules
                    ]
                  ) {
                    modules[cleanName] =
                      ProgrammaticModules[
                        cleanName as keyof typeof ProgrammaticModules
                      ];
                  }
                });
              } else if (importSpec.includes("* as ")) {
                // Namespace import: * as Programmatic
                const aliasMatch = importSpec.match(/\*\s+as\s+(\w+)/);
                if (aliasMatch) {
                  modules[aliasMatch[1]] = ProgrammaticModules;
                }
              } else {
                // Default import: TemplateBuilder
                const defaultName = importSpec.trim();
                if (
                  ProgrammaticModules[
                    defaultName as keyof typeof ProgrammaticModules
                  ]
                ) {
                  modules[defaultName] =
                    ProgrammaticModules[
                      defaultName as keyof typeof ProgrammaticModules
                    ];
                }
              }
            }
          } catch (e) {
            console.warn("Failed to resolve import:", modulePath, e);
          }
        }

        // Remove the import statement
        return "";
      }
    );

    // Remove TypeScript type annotations
    cleanCode = removeTypeScriptAnnotations(cleanCode);

    return { cleanCode: cleanCode.trim(), modules };
  };

  const removeTypeScriptAnnotations = (code: string): string => {
    // Remove type annotations from function parameters and return types
    let cleanCode = code
      // Remove return type annotations like `: ProgrammaticTemplate`
      .replace(/\)\s*:\s*[A-Za-z_][A-Za-z0-9_<>[\]|&,\s]*\s*\{/g, ") {")
      // Remove parameter type annotations like `(param: Type)`
      .replace(
        /\(\s*(\w+)\s*:\s*[A-Za-z_][A-Za-z0-9_<>[\]|&,\s]*\s*\)/g,
        "($1)"
      )
      // Remove variable type annotations like `const var: Type =`
      .replace(/:\s*[A-Za-z_][A-Za-z0-9_<>[\]|&,\s]*(?=\s*[=;])/g, "")
      // Remove interface/type definitions
      .replace(/^(export\s+)?(interface|type)\s+\w+.*$/gm, "")
      // Remove generic type parameters like `<T>`
      .replace(/<[A-Za-z_][A-Za-z0-9_,\s]*>/g, "");

    return cleanCode;
  };

  const parseTemplateFromCode = (
    cleanCode: string,
    modules: Record<string, unknown>
  ): ProgrammaticTemplate | null => {
    // Helper function to find problematic code sections
    const findSyntaxError = (code: string, error: Error): string => {
      const lines = code.split("\n");
      const errorMessage = error.message;

      // More sophisticated syntax analysis
      const analyzeCodeStructure = (code: string): string[] => {
        const issues: string[] = [];
        const lines = code.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const lineNum = i + 1;

          // Skip empty lines and comments
          if (!line || line.startsWith("//") || line.startsWith("/*")) continue;

          // Check for obvious syntax errors (not valid multi-line constructs)
          if (line.includes('"""')) {
            issues.push(
              `Line ${lineNum}: Triple quotes (""") are not valid JavaScript syntax - "${line}"`
            );
          }

          if (line === '""') {
            issues.push(
              `Line ${lineNum}: Empty double quotes on their own line - "${line}"`
            );
          }

          // Check for unmatched quotes within a single line (not across lines)
          const singleQuoteMatches = (line.match(/'/g) || []).length;
          const doubleQuoteMatches = (line.match(/"/g) || []).length;
          const backtickMatches = (line.match(/`/g) || []).length;

          // Only flag if quotes are unmatched within the same line and line appears complete
          if (line.endsWith(";") || line.endsWith(",") || line.endsWith(")")) {
            if (singleQuoteMatches % 2 !== 0 && !line.includes('"')) {
              issues.push(
                `Line ${lineNum}: Unmatched single quotes - "${line}"`
              );
            }
            if (doubleQuoteMatches % 2 !== 0 && !line.includes("'")) {
              issues.push(
                `Line ${lineNum}: Unmatched double quotes - "${line}"`
              );
            }
            if (backtickMatches % 2 !== 0) {
              issues.push(`Line ${lineNum}: Unmatched backticks - "${line}"`);
            }
          }
        }

        return issues;
      };

      const structuralIssues = analyzeCodeStructure(code);
      if (structuralIssues.length > 0) {
        return structuralIssues[0]; // Return the first issue found
      }

      // If no obvious structural issues, parse the JavaScript error message for more details
      if (errorMessage.includes("Unexpected token")) {
        const tokenMatch = errorMessage.match(/Unexpected token '?(.+?)'?/);
        if (tokenMatch) {
          return `Unexpected token "${tokenMatch[1]}" found. ${errorMessage}`;
        }
      }

      return `JavaScript parsing error: ${errorMessage}`;
    };

    // Check if this is a class export with a create method
    const classExportMatch = cleanCode.match(/export\s+class\s+(\w+)/);

    if (classExportMatch) {
      const className = classExportMatch[1];

      // Remove the export keyword and convert to class declaration
      const classCode = cleanCode.replace(/export\s+class\s+/, "class ");

      // Create parameter names and values for the function
      const paramNames = Object.keys(modules);
      const paramValues = Object.values(modules);

      try {
        // Execute the class definition and call the create method
        const classFunction = new Function(
          ...paramNames,
          classCode + `; return ${className}.create();`
        );
        return classFunction(...paramValues);
      } catch (error) {
        const syntaxError = findSyntaxError(classCode, error as Error);
        throw new Error(`Failed to parse class "${className}": ${syntaxError}`);
      }
    }

    // Check if this is a direct template builder call
    const builderMatch = cleanCode.match(/(new\s+)?TemplateBuilder\s*\(\)/m);
    if (builderMatch) {
      // Create parameter names and values for the function
      const paramNames = Object.keys(modules);
      const paramValues = Object.values(modules);

      try {
        // Execute as a template builder expression
        const templateFunction = new Function(
          ...paramNames,
          "return " + cleanCode
        );
        return templateFunction(...paramValues);
      } catch (error) {
        const syntaxError = findSyntaxError(cleanCode, error as Error);
        throw new Error(
          `Failed to parse TemplateBuilder expression: ${syntaxError}`
        );
      }
    }

    // Check if this is a function that returns a template
    const functionMatch = cleanCode.match(
      /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\}/
    );
    if (functionMatch) {
      const functionName = functionMatch[1];

      // Create parameter names and values for the function
      const paramNames = Object.keys(modules);
      const paramValues = Object.values(modules);

      try {
        // Execute the function and call it
        const functionCall = new Function(
          ...paramNames,
          cleanCode + `; return ${functionName}();`
        );
        return functionCall(...paramValues);
      } catch (error) {
        const syntaxError = findSyntaxError(cleanCode, error as Error);
        throw new Error(
          `Failed to parse function "${functionName}": ${syntaxError}`
        );
      }
    }

    // Fallback: try to execute as a direct expression
    const paramNames = Object.keys(modules);
    const paramValues = Object.values(modules);

    try {
      const templateFunction = new Function(
        ...paramNames,
        "return " + cleanCode
      );
      return templateFunction(...paramValues);
    } catch (error) {
      const syntaxError = findSyntaxError(cleanCode, error as Error);
      throw new Error(`Failed to parse code as expression: ${syntaxError}`);
    }
  };

  const handleImport = () => {
    if (conversionResult?.success && conversionResult.template) {
      onImport(conversionResult.template);
      showSuccess(
        "Template imported successfully!",
        "Template has been added to your dashboard"
      );
      onClose();
      // Reset state
      setConversionResult(null);
      setCodeInput("");
      setShareInput("");
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Programmatic Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab("examples")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "examples"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icons.FileText className="w-4 h-4 inline mr-2" />
              Example Templates
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "file"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icons.Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "code"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icons.Code className="w-4 h-4 inline mr-2" />
              Paste Code
            </button>
            <button
              onClick={() => setActiveTab("share")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "share"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icons.Share className="w-4 h-4 inline mr-2" />
              Import from Share
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "examples" && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Choose from pre-built programmatic template examples:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      JCC2 User Questionnaire
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Programmatic template for the JCC2 User Questionnaire PDF.
                    </p>
                    <button
                      onClick={() => handleExampleImport("jcc2")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      JCC2 Data Collection Form v2
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Enhanced JCC2 form with text fields for better
                      instructions and formatting.
                    </p>
                    <button
                      onClick={() => handleExampleImport("jcc2v3")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>
                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Comprehensive Event Registration
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Full-featured form with multiple field types, validation,
                      and dynamic sections
                    </p>
                    <button
                      onClick={() => handleExampleImport("comprehensive")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Simple Working Template
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Basic template with essential fields for testing
                    </p>
                    <button
                      onClick={() => handleExampleImport("simple")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Contact Form
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Standard contact form with name, email, and message fields
                    </p>
                    <button
                      onClick={() => handleExampleImport("contact")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Survey Template
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Multi-section survey with rating fields and feedback
                    </p>
                    <button
                      onClick={() => handleExampleImport("survey")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Default Values Demo
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Template demonstrating default value functionality across
                      different field types
                    </p>
                    <button
                      onClick={() => handleExampleImport("defaultValues")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Text Fields Example
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Template demonstrating text fields for instructions and
                      informational text within forms
                    </p>
                    <button
                      onClick={() => handleExampleImport("textFields")}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Horizontal Layout & Grouping Demo
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Advanced survey showcasing horizontal layouts and
                      matrix-style grouped fields
                    </p>
                    <button
                      onClick={() => handleExampleImport("horizontalGrouping")}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Section-Level Conditionals Demo
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Advanced form demonstrating section-level conditional
                      logic where entire sections show/hide based on field
                      responses
                    </p>
                    <button
                      onClick={() => handleExampleImport("sectionConditionals")}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Import Template
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "file" && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Upload a JavaScript or TypeScript file containing a
                  programmatic template:
                </p>

                <div className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
                  <Icons.Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Choose file to upload
                    </span>
                    <input
                      type="file"
                      accept=".js,.ts,.json,.tsx,.jsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .js, .ts, .tsx, .jsx, and .json files
                  </p>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">Selected file:</p>
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  </div>
                )}

                {codeInput && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      File Content Preview:
                    </label>
                    <textarea
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      readOnly
                    />
                    <button
                      onClick={handleCodeImport}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Convert Template
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Paste your programmatic template code here:
                </p>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="mb-2">Supported formats:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Class export with static create() method (like
                        JCC2UserQuestionnaire)
                      </li>
                      <li>Direct TemplateBuilder expressions</li>
                      <li>Function that returns a template</li>
                    </ul>
                  </div>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="// Paste your template code here
// Example 1 - Class export:
// export class MyTemplate {
//   static create(): ProgrammaticTemplate {
//     return new TemplateBuilder()
//       .create('My Template')
//       .section('Basic Info')
//         .field('text', 'Name')
//           .required()
//           .end()
//       .build();
//   }
// }
//
// Example 2 - Direct builder:
// new TemplateBuilder()
//   .create('My Template')
//   .section('Basic Info')
//     .field('text', 'Name')
//       .required()
//       .end()
//   .build()"
                    className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  />

                  <button
                    onClick={handleCodeImport}
                    disabled={!codeInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Convert Template
                  </button>
                </div>
              </div>
            )}

            {activeTab === "share" && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Import templates or form instances from share strings:
                </p>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="mb-2">Share strings contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Complete form templates with all sections and fields
                      </li>
                      <li>Form instances with filled data</li>
                      <li>Compressed and encoded data for easy sharing</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Share String:
                    </label>
                    <textarea
                      value={shareInput}
                      onChange={(e) => setShareInput(e.target.value)}
                      placeholder="Paste your share string here (starts with 'fm:')
Example: fm:1:br:b64u:a1b2c3d4:eyJtZXRhZGF0YSI6eyJuYW1lIjoi..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>

                  <button
                    onClick={handleShareImport}
                    disabled={!shareInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Import from Share String
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversion Result */}
          {conversionResult && (
            <div className="mt-6 border-t pt-6">
              {conversionResult.success ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">
                      Template converted successfully!
                    </span>
                  </div>

                  {conversionResult.template && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">
                        Template Preview:
                      </h4>
                      <p className="text-sm text-green-800">
                        <strong>Name:</strong> {conversionResult.template.name}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Sections:</strong>{" "}
                        {conversionResult.template.sections.length}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Total Fields:</strong>{" "}
                        {conversionResult.template.sections.reduce(
                          (sum, s) => sum + s.fields.length,
                          0
                        )}
                      </p>
                    </div>
                  )}

                  {conversionResult.warnings &&
                    conversionResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                          <Icons.AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">
                            Conversion Warnings:
                          </span>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {conversionResult.warnings.map((warning, index) => (
                            <li key={index}>
                              •{" "}
                              {typeof warning === "string"
                                ? warning
                                : warning.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Conversion failed</span>
                  </div>

                  {conversionResult.errors && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <ul className="text-sm text-red-700 space-y-1">
                        {conversionResult.errors.map((error, index) => (
                          <li key={index}>
                            •{" "}
                            {typeof error === "string" ? error : error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!conversionResult?.success}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Import Template
          </button>
        </div>
      </div>
    </div>
  );
};
