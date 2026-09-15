import { Mail, MessageSquare, Send } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Route: /contact</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Contact</h1>
        <p className="text-slate-400">
          Get in touch for software engineering opportunities, collaborations, or technical inquiries.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Contact Channels</span>
        </div>
        <p className="text-sm text-slate-400">
          Direct messaging and contact form integrations will connect to the backend service in subsequent phases.
        </p>
        <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-indigo-400">
          <Send className="w-3.5 h-3.5" />
          <span>Endpoint connection target: /api/v1/contact</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500 font-mono">
        Status: Placeholder route successfully mounted.
      </div>
    </div>
  );
}
