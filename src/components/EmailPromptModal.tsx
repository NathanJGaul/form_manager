import React, { useState } from "react";
import * as Icons from "lucide-react";
import { FormInstance } from "../types/form";
import { storageManager } from "../utils/storage";

interface EmailPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  formInstance: FormInstance | null;
  templateName: string;
}

const EmailPromptModal: React.FC<EmailPromptModalProps> = ({
  isOpen,
  onClose,
  formInstance,
  templateName,
}) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [csvFilename, setCsvFilename] = useState(`${templateName}_submission`);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !formInstance) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    // Validate email
    if (!recipientEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmail(recipientEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!csvFilename.trim()) {
      setError("Please enter a filename");
      return;
    }

    setError("");
    setIsSending(true);

    try {
      // Generate CSV data
      const csvData = storageManager.exportInstanceToCSV(formInstance.id);
      
      if (!csvData) {
        throw new Error("Failed to generate CSV data");
      }

      // For now, we'll use a mailto link as a fallback
      // This can be replaced with EmailJS or backend service later
      const subject = encodeURIComponent(`Form Submission: ${templateName}`);
      const body = encodeURIComponent(
        `Please find the form submission data attached.\n\n` +
        `Form: ${templateName}\n` +
        `Submitted: ${new Date().toLocaleString()}\n\n` +
        `Note: Due to browser limitations, the CSV data is included below. ` +
        `Please copy and save it as ${csvFilename}.csv\n\n` +
        `--- CSV DATA START ---\n${csvData}\n--- CSV DATA END ---`
      );
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      // Open mailto link
      window.location.href = mailtoLink;
      
      // Show success message
      setTimeout(() => {
        alert("Email client opened. Please send the email to complete the process.");
        onClose();
      }, 100);
      
    } catch (err) {
      console.error("Error sending email:", err);
      setError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipientEmail("");
    setCsvFilename(`${templateName}_submission`);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Icons.Mail size={20} />
            Email Form Data
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-gray-600 mb-4">
              Would you like to email the form submission data? Enter the recipient's email address and filename below.
            </p>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                setError("");
              }}
              placeholder="example@email.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error && !validateEmail(recipientEmail) && recipientEmail
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>

          {/* Filename Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV Filename <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={csvFilename}
                onChange={(e) => {
                  setCsvFilename(e.target.value);
                  setError("");
                }}
                placeholder="form_submission"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                .csv
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              The name for the CSV file attachment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm flex items-center gap-1">
              <Icons.AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <Icons.Info size={16} className="inline mr-1" />
              Your email client will open with the form data. You may need to manually attach the CSV file depending on your email client.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !recipientEmail || !csvFilename}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <Icons.Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Icons.Send size={16} />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPromptModal;