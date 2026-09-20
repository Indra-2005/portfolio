import { SEO } from '../components/SEO';
import { SectionHeading } from '../components/SectionHeading';
import { ContactForm } from '../components/ContactForm';
import { Github, Linkedin, Clock } from 'lucide-react';

export function ContactPage() {
  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Devendra Bhoi for software engineering roles, machine learning opportunities, or technical inquiries."
      />

      <div className="max-w-4xl mx-auto space-y-10 py-4">
        {/* Header */}
        <SectionHeading
          eyebrow="Get In Touch"
          title="Contact"
          description="Interested in collaborating, discussing machine learning, or exploring entry-level engineering opportunities? Send a message below."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
                Links
              </h3>

              <div className="space-y-3 text-sm">
                <a
                  href="https://github.com/Indra-2005"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">GitHub</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Indra-2005</div>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/devendra-bhoi-21a720243"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">LinkedIn</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">devendra-bhoi</div>
                  </div>
                </a>

                <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                  <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white text-sm">Response Time</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Within 24–48 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;
