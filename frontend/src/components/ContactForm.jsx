import { useState } from 'react';
import { contactApi } from '../services/api';
import { Button } from './Button';
import { CheckCircle2, AlertCircle, Send, User, Mail, MessageSquare } from 'lucide-react';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your name.';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Name must be 100 characters or fewer.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide a message.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    } else if (formData.message.trim().length > 3000) {
      errs.message = 'Message must be 3000 characters or fewer.';
    }

    if (formData.subject && formData.subject.length > 200) {
      errs.subject = 'Subject must be 200 characters or fewer.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
        honeypot: formData.honeypot || undefined,
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
      });
    } catch (err) {
      setServerError(
        err.message || 'Failed to submit message. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setServerError(null);
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-8 sm:p-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 max-w-lg mx-auto"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Message Received</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thank you for reaching out! Your message has been safely recorded in the database.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={resetForm}>
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs"
    >
      {serverError && (
        <div
          role="alert"
          className="flex items-start space-x-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 text-xs sm:text-sm">{serverError}</div>
        </div>
      )}

      {/* Hidden Honeypot field for anti-spam bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="hp-field">Leave this empty</label>
        <input
          id="hp-field"
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 font-mono">
            Your Name <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Miller"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                errors.name ? 'border-rose-500' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-600 font-mono">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 font-mono">
            Email Address <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                errors.email ? 'border-rose-500' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-600 font-mono">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 font-mono">
          Subject <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g. Machine Learning Project / Engineering Inquiry"
          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
            errors.subject ? 'border-rose-500' : 'border-slate-300'
          }`}
        />
        {errors.subject && (
          <p className="text-xs text-rose-600 font-mono">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 font-mono">
            Message <span className="text-blue-600">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {formData.message.length} / 3000
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Please share details regarding your opportunity or inquiry..."
          className={`w-full p-3.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
            errors.message ? 'border-rose-500' : 'border-slate-300'
          }`}
        />
        {errors.message && (
          <p className="text-xs text-rose-600 font-mono">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          icon={Send}
          className="w-full sm:w-auto"
        >
          Send Message
        </Button>
      </div>
    </form>
  );
}

export default ContactForm;
