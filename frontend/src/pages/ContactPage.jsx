import { SEO } from '../components/SEO';
import { SectionHeading } from '../components/SectionHeading';
import { ContactForm } from '../components/ContactForm';
import { Mail, Github, MapPin, Clock, ShieldCheck } from 'lucide-react';

export function ContactPage() {
  return (
    <>
      <SEO
        title="Contact &amp; Connect"
        description="Get in touch with Devendra Bhoi for software engineering roles, machine learning opportunities, or technical inquiries."
      />

      <div className="max-w-4xl mx-auto space-y-12 py-4">
        {/* Header */}
        <SectionHeading
          eyebrow="Get In Touch"
          title="Let's Connect"
          description="Interested in collaborating, discussing machine learning, or exploring entry-level engineering opportunities? Send a message directly."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Direct Communication Channels */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-semibold">
                Direct Channels
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <a
                  href="https://github.com/Indra-2005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">GitHub</div>
                    <div className="text-xs text-slate-500 font-mono">Indra-2005</div>
                  </div>
                </a>

                <div className="flex items-center space-x-3 text-slate-600">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Response Time</div>
                    <div className="text-xs text-slate-500 font-mono">Within 24–48 hours</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-600">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Database Persistence</div>
                    <div className="text-xs text-slate-500 font-mono">Protected by rate limiting</div>
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
