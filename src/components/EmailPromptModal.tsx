import React, { useState } from "react";
import * as Icons from "lucide-react";
import { FormInstance } from "../types/form";
import { encodeForSharing } from "../utils/dataSharing";

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
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [shareString, setShareString] = useState("");

  if (!isOpen || !formInstance) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateShareString = async () => {
    try {
      const shareStr = await encodeForSharing(formInstance);
      setShareString(shareStr);
      return shareStr;
    } catch (err) {
      console.error("Error generating share string:", err);
      setError("Failed to generate share string. Please try again.");
      return null;
    }
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

    setError("");
    setIsSending(true);

    try {
      // Generate share string
      const shareStr = await generateShareString();
      
      if (!shareStr) {
        throw new Error("Failed to generate share string");
      }

      // Create email with share string
      const subject = encodeURIComponent(`Form Submission: ${templateName}`);
      const body = encodeURIComponent(
        `Please find the form submission share string below.\n\n` +
        `Form: ${templateName}\n` +
        `Submitted: ${new Date().toLocaleString()}\n\n` +
        `Share String (copy and import this into Form Manager):\n\n` +
        `${shareStr}\n\n` +
        `To import this form:\n` +
        `1. Open Form Manager\n` +
        `2. Click the Import button in the dashboard\n` +
        `3. Paste the share string above\n` +
        `4. Click Import`
      );
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      console.log('Email link generated:', {
        recipientEmail,
        subject: decodeURIComponent(subject),
        bodyLength: body.length,
        fullLinkLength: mailtoLink.length
      });
      
      // Open mailto link using a temporary anchor element
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank'; // Try to open in new tab/window
      
      // Try multiple methods to open the mailto link
      console.log('Attempting to open email client...');
      
      // Method 1: Try clicking the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Method 2: If that doesn't work, try window.open as fallback
      setTimeout(() => {
        if (!document.hidden) { // Check if we're still on the same page
          console.log('Trying fallback method with window.open...');
          try {
            window.open(mailtoLink, '_self');
          } catch (e) {
            console.error('Window.open failed:', e);
          }
        }
      }, 100);
      
      // Show success message
      setTimeout(() => {
        alert("Email client opened. The share string has been included in the email body.");
      }, 500);
      
    } catch (err) {
      console.error("Error sending email:", err);
      setError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipientEmail("");
    setError("");
    setShareString("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Icons.Mail size={20} />
            Email Form Share String
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
              Would you like to email the form submission share string? Enter the recipient's email address below.
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
              Your email client will open with the form share string. The recipient can import this string to view the complete form submission.
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
            disabled={isSending || !recipientEmail}
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