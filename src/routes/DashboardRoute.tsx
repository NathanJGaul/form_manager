/**
 * Dashboard route component for displaying templates and form instances
 * Consolidated version with all features from the original Dashboard component
 */
import React, { useState, useEffect, Suspense, lazy } from "react";
import { FormTemplate, FormInstance } from "../types/form";
import { storageManager } from "../utils/storage";
import { exportTemplateToPdf, downloadPdf } from "../utils/pdfExport";
import * as Icons from "lucide-react";
import {
  ErrorBoundary,
  FormErrorBoundary,
  TemplateErrorBoundary,
} from "../components/ErrorBoundary";

// Lazy load heavy components for better performance
const FormBuilder = lazy(() => import("../components/FormBuilder"));
const FormRenderer = lazy(() => import("../components/FormRenderer"));

interface DashboardRouteProps {
  onNavigateToBuilder?: (template?: FormTemplate) => void;
  onNavigateToForm?: (template: FormTemplate, instance?: FormInstance) => void;
}

// Loading component for lazy-loaded modules
const LazyLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Icons.Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading component...</p>
    </div>
  </div>
);

const DashboardRoute: React.FC<DashboardRouteProps> = ({
  onNavigateToBuilder,
  onNavigateToForm,
}) => {
  console.log("🚀 Dashboard component is rendering!");
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "builder" | "form"
  >("dashboard");
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null
  );
  const [selectedInstance, setSelectedInstance] = useState<FormInstance | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "in-progress"
  >("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(storageManager.getTemplates());
    setInstances(storageManager.getInstances());
  };

  const handleCreateTemplate = () => {
    if (onNavigateToBuilder) {
      onNavigateToBuilder();
    } else {
      setSelectedTemplate(null);
      setCurrentView("builder");
    }
  };

  const handleEditTemplate = (template: FormTemplate) => {
    if (onNavigateToBuilder) {
      onNavigateToBuilder(template);
    } else {
      setSelectedTemplate(template);
      setCurrentView("builder");
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      storageManager.deleteTemplate(templateId);
      loadData();
    }
  };

  const handleCreateInstance = (template: FormTemplate) => {
    // Get or create instance for this template (reuses existing draft)
    const instance = storageManager.getOrCreateInstance(
      template.id,
      template.name
    );

    if (onNavigateToForm) {
      onNavigateToForm(template, instance);
    } else {
      setSelectedTemplate(template);
      setSelectedInstance(instance);
      setCurrentView("form");
    }
  };

  const handleEditInstance = (instance: FormInstance) => {
    const template = templates.find((t) => t.id === instance.templateId);
    if (template) {
      if (onNavigateToForm) {
        onNavigateToForm(template, instance);
      } else {
        setSelectedTemplate(template);
        setSelectedInstance(instance);
        setCurrentView("form");
      }
    }
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm("Are you sure you want to delete this form instance?")) {
      storageManager.deleteInstance(instanceId);
      loadData();
    }
  };

  const handleSaveTemplate = () => {
    loadData();
    setCurrentView("dashboard");
  };

  const handleSaveInstance = () => {
    loadData();
  };

  const handleSubmitInstance = () => {
    loadData();
    setCurrentView("dashboard");
  };

  const handleExportTemplate = (templateId: string) => {
    const csvData = storageManager.exportToCSV(templateId);
    if (!csvData) {
      alert("No data to export for this template");
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template?.name || "form"}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTemplateToPdf = async (template: FormTemplate) => {
    try {
      const result = await exportTemplateToPdf(template);
      if (result.success && result.pdfBytes) {
        downloadPdf(result.pdfBytes, `${template.name}_form.pdf`);
      } else {
        alert(`Failed to export PDF: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error exporting PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleExportAll = () => {
    const csvData = storageManager.exportAllToCSV();
    if (!csvData) {
      alert("No data to export");
      return;
    }

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_forms_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefreshTemplates = () => {
    console.log("🔄 Refreshing templates...");
    // Reset the default templates flag to force reload
    storageManager.resetDefaultTemplates();
    // Reload the data which will trigger default template loading
    loadData();
    console.log("✅ Templates refreshed!");
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch = instance.templateName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && instance.completed) ||
      (filterStatus === "in-progress" && !instance.completed);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalTemplates: templates.length,
    totalInstances: instances.length,
    completedForms: instances.filter((i) => i.completed).length,
    inProgressForms: instances.filter((i) => !i.completed).length,
  };

  // Handle internal navigation when not using router
  if (!onNavigateToBuilder && currentView === "builder") {
    return (
      <TemplateErrorBoundary
        templateName={selectedTemplate?.name || "New Template"}
      >
        <Suspense fallback={<LazyLoadingSpinner />}>
          <FormBuilder
            template={selectedTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={() => setCurrentView("dashboard")}
          />
        </Suspense>
      </TemplateErrorBoundary>
    );
  }

  if (!onNavigateToForm && currentView === "form" && selectedTemplate) {
    return (
      <FormErrorBoundary formName={selectedTemplate.name}>
        <Suspense fallback={<LazyLoadingSpinner />}>
          <FormRenderer
            template={selectedTemplate}
            instance={selectedInstance || undefined}
            onSave={handleSaveInstance}
            onSubmit={handleSubmitInstance}
            onExit={() => setCurrentView("dashboard")}
          />
        </Suspense>
      </FormErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Form Management System
              </h1>
              <p className="text-gray-600">
                Create, manage, and analyze your forms
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  console.log("🔄 Header refresh button clicked!");
                  handleRefreshTemplates();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                title="Refresh default templates"
                data-testid="refresh-templates-button"
              >
                <Icons.RefreshCw className="w-4 h-4" />
                <span>Refresh Templates</span>
              </button>
              <button
                onClick={handleExportAll}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Icons.Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
              <button
                onClick={handleCreateTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Icons.Plus className="w-4 h-4" />
                <span>New Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">Templates</p>
                  <button
                    onClick={() => {
                      console.log("🔄 Stats card refresh button clicked!");
                      handleRefreshTemplates();
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                    title="Refresh templates"
                  >
                    <Icons.RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTemplates}
                </p>
              </div>
              <Icons.FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalInstances}
                </p>
              </div>
              <Icons.BarChart3 className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedForms}
                </p>
              </div>
              <Icons.Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgressForms}
                </p>
              </div>
              <Icons.Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates and forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icons.Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as "all" | "completed" | "in-progress"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Form Templates
            </h2>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Icons.FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No templates found</p>
              <button
                onClick={handleCreateTemplate}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
              >
                <Icons.Plus className="w-4 h-4" />
                <span>Create Your First Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <ErrorBoundary
                  key={template.id}
                  fallback={({ error, resetError }) => (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-600 mb-2">
                        <Icons.AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Template Error
                        </span>
                      </div>
                      <p className="text-red-700 text-sm mb-3">
                        Failed to render template: {template.name}
                      </p>
                      <button
                        onClick={resetError}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                >
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {template.sections.length} sections •
                          {template.sections.reduce(
                            (acc, s) => acc + s.fields.length,
                            0
                          )}{" "}
                          fields
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateInstance(template)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          <Icons.Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Icons.Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExportTemplate(template.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Export as CSV"
                        >
                          <Icons.Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportTemplateToPdf(template)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Export as PDF"
                        >
                          <Icons.FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>

        {/* Form Instances Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Form Instances
          </h2>

          {filteredInstances.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Icons.BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No form instances found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstances.map((instance) => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {instance.templateName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            instance.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {instance.completed ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${instance.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {instance.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(instance.lastSaved).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditInstance(instance)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInstance(instance.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Icons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRoute;
