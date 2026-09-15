import { Layers } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No records found',
  description = 'There are currently no items matching this criteria. Please check back soon.',
  actionText,
  actionTo,
  onAction,
  icon: Icon = Layers,
}) {
  return (
    <div className="p-12 sm:p-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>
      {(actionTo || onAction) && (
        <div className="pt-2">
          {actionTo ? (
            <Button to={actionTo} size="sm" variant="secondary">
              {actionText}
            </Button>
          ) : (
            <Button onClick={onAction} size="sm" variant="secondary">
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
