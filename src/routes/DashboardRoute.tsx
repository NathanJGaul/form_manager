/**
 * Dashboard route component for displaying templates and form instances
 * Split from main Dashboard component for better code splitting
 */
import React, { useState, useEffect } from 'react';
import { FormTemplate, FormInstance } from '../types/form';
import { storageManager } from '../utils/storage';
import { exportTemplateToPdf, downloadPdf } from '../utils/pdfExport';
import * as Icons from 'lucide-react';

interface DashboardRouteProps {
  onNavigateToBuilder: (template?: FormTemplate) => void;
  onNavigateToForm: (template: FormTemplate, instance?: FormInstance) => void;
}

export const DashboardRoute: React.FC<DashboardRouteProps> = ({
  onNavigateToBuilder,
  onNavigateToForm
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(storageManager.getTemplates());
    setInstances(storageManager.getInstances());
  };

  const handleCreateTemplate = () => {
    onNavigateToBuilder();
  };

  const handleEditTemplate = (template: FormTemplate) => {
    onNavigateToBuilder(template);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      storageManager.deleteTemplate(templateId);
      loadData();
    }
  };

  const handleCreateInstance = (template: FormTemplate) => {
    const instance = storageManager.getOrCreateInstance(template.id, template.name);
    onNavigateToForm(template, instance);
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm('Are you sure you want to delete this form instance?')) {
      storageManager.deleteInstance(instanceId);
      loadData();
    }
  };

  const handleExportTemplate = async (template: FormTemplate) => {
    try {
      const pdfBytes = await exportTemplateToPdf(template);
      downloadPdf(pdfBytes, `${template.name}_template.pdf`);
    } catch (error) {
      console.error('Failed to export template:', error);
      alert('Failed to export template to PDF');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = instance.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && instance.completed) ||
      (filterStatus === 'in-progress' && !instance.completed);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTemplates: templates.length,
    totalForms: instances.length,
    completedForms: instances.filter(i => i.completed).length,
    inProgressForms: instances.filter(i => !i.completed).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Form Manager</h1>
              <p className="mt-1 text-sm text-gray-500">Create, manage, and fill forms with ease</p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Templates</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalTemplates}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.FormInput className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Forms</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalForms}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completedForms}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.inProgressForms}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates and forms..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'in-progress')}
                >
                  <option value="all">All Forms</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Templates Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Templates</h2>
            </div>
            <div className="p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No templates match your search.' : 'Get started by creating a new template.'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <button
                        onClick={handleCreateTemplate}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Icons.Plus className="w-4 h-4 mr-2" />
                        New Template
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Icons.Calendar className="w-3 h-3 mr-1" />
                            <span>Updated {template.updatedAt.toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{template.sections.length} sections</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleCreateInstance(template)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            title="Fill Form"
                          >
                            <Icons.FormInput className="w-3 h-3 mr-1" />
                            Fill
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            title="Edit Template"
                          >
                            <Icons.Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleExportTemplate(template)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            title="Export to PDF"
                          >
                            <Icons.Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                            title="Delete Template"
                          >
                            <Icons.Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Instances Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Form Instances</h2>
            </div>
            <div className="p-6">
              {filteredInstances.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.FormInput className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No form instances</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No forms match your criteria.' 
                      : 'Fill out a template to create form instances.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInstances.map((instance) => (
                    <div key={instance.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {instance.templateName}
                          </h3>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instance.completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {instance.completed ? (
                                <>
                                  <Icons.CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Icons.Clock className="w-3 h-3 mr-1" />
                                  In Progress
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Icons.Calendar className="w-3 h-3 mr-1" />
                            <span>Updated {instance.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              const template = templates.find(t => t.id === instance.templateId);
                              if (template) {
                                onNavigateToForm(template, instance);
                              }
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            title={instance.completed ? "View Form" : "Continue Filling"}
                          >
                            <Icons.Eye className="w-3 h-3 mr-1" />
                            {instance.completed ? 'View' : 'Continue'}
                          </button>
                          <button
                            onClick={() => handleDeleteInstance(instance.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                            title="Delete Instance"
                          >
                            <Icons.Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};