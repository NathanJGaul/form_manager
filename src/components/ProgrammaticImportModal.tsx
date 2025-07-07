import React, { useState } from "react";
import * as Icons from "lucide-react";
import { TDLConverter } from "../programmatic/tdl/converter";
import { JCC2UserQuestionnaire } from "../programmatic/examples/JCC2UserQuestionnaire";
import { WorkingComprehensiveTemplate } from "../programmatic/examples/WorkingComprehensiveTemplate";
import { DefaultValueExample } from "../programmatic/examples/DefaultValueExample";
import { CommonTemplates } from "../programmatic/library/CommonTemplates";
import { TemplateBuilder } from "../programmatic/builder/TemplateBuilder";
import * as ProgrammaticModules from "../programmatic";
import { FormTemplate } from "../types/form";

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
  const [activeTab, setActiveTab] = useState<"file" | "examples" | "code">(
    "examples"
  );
  const [codeInput, setCodeInput] = useState("");
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
    programmaticTemplate: any
  ): ConversionResult => {
    try {
      const conversionResult = converter.convertToGUI(programmaticTemplate);

      if (conversionResult.success && conversionResult.result) {
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
              type: field.type as any,
              label: field.label,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options,
              validation: field.validation,
              conditional: field.conditional,
              defaultValue: field.defaultValue,
            })),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

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
      
      // Create parameter names and values for the function
      const paramNames = Object.keys(modules);
      const paramValues = Object.values(modules);
      
      // Create a function that provides all imported modules in scope
      const templateFunction = new Function(...paramNames, "return " + cleanCode);
      const programmaticTemplate = templateFunction(...paramValues);

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

  const parseAndResolveImports = (code: string): { cleanCode: string; modules: Record<string, any> } => {
    const modules: Record<string, any> = {};
    
    // Always provide TemplateBuilder as default
    modules.TemplateBuilder = TemplateBuilder;
    
    // Remove import statements and collect imported modules
    const cleanCode = code.replace(/^import\s+.*?from\s+['"]([^'"]+)['"];?\s*$/gm, (match, modulePath) => {
      // Only handle project imports (starting with @src or relative paths within programmatic)
      if (modulePath.startsWith('@src/programmatic') || modulePath.startsWith('../programmatic') || modulePath.startsWith('./')) {
        try {
          // Extract import specifiers
          const importMatch = match.match(/^import\s+(.+?)\s+from/);
          if (importMatch) {
            const importSpec = importMatch[1].trim();
            
            // Handle different import types
            if (importSpec.startsWith('{') && importSpec.endsWith('}')) {
              // Named imports: { TemplateBuilder, SectionBuilder }
              const namedImports = importSpec.slice(1, -1).split(',').map(s => s.trim());
              namedImports.forEach(importName => {
                const cleanName = importName.replace(/\s+as\s+\w+/, '').trim();
                if (ProgrammaticModules[cleanName as keyof typeof ProgrammaticModules]) {
                  modules[cleanName] = ProgrammaticModules[cleanName as keyof typeof ProgrammaticModules];
                }
              });
            } else if (importSpec.includes('* as ')) {
              // Namespace import: * as Programmatic
              const aliasMatch = importSpec.match(/\*\s+as\s+(\w+)/);
              if (aliasMatch) {
                modules[aliasMatch[1]] = ProgrammaticModules;
              }
            } else {
              // Default import: TemplateBuilder
              const defaultName = importSpec.trim();
              if (ProgrammaticModules[defaultName as keyof typeof ProgrammaticModules]) {
                modules[defaultName] = ProgrammaticModules[defaultName as keyof typeof ProgrammaticModules];
              }
            }
          }
        } catch (e) {
          console.warn('Failed to resolve import:', modulePath, e);
        }
      }
      
      // Remove the import statement
      return '';
    });
    
    return { cleanCode: cleanCode.trim(), modules };
  };

  const handleImport = () => {
    if (conversionResult?.success && conversionResult.template) {
      onImport(conversionResult.template);
      onClose();
      // Reset state
      setConversionResult(null);
      setCodeInput("");
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
                      Template demonstrating default value functionality across different field types
                    </p>
                    <button
                      onClick={() => handleExampleImport("defaultValues")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                      accept=".js,.ts,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .js, .ts, and .json files
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
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="// Paste your TemplateBuilder code here
// Example:
// new TemplateBuilder()
//   .create('My Template')
//   .section('Basic Info')
//     .field('text', 'Name')
//       .required()
//       .end()
//   .build()"
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
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
