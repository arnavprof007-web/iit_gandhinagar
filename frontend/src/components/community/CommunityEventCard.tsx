import React from 'react';
import { CommunityEvent } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface CommunityEventCardProps {
  event: CommunityEvent;
  onToggleRegister: (eventId: string) => void;
}

export const CommunityEventCard: React.FC<CommunityEventCardProps> = ({
  event,
  onToggleRegister,
}) => {
  return (
    <Card hoverEffect className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="emerald" className="text-[11px]">
            {event.category}
          </Badge>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            {event.attendeesCount} Attending
          </span>
        </div>

        <h4 className="font-bold text-slate-900 text-sm mb-2">{event.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
          By: {event.organizer}
        </span>
        <Button
          size="sm"
          variant={event.isRegistered ? 'outline' : 'primary'}
          onClick={() => onToggleRegister(event.id)}
          leftIcon={event.isRegistered ? <Check className="w-3.5 h-3.5" /> : undefined}
          className="text-xs py-1 px-3"
        >
          {event.isRegistered ? 'Registered' : 'RSVP Free'}
        </Button>
      </div>
    </Card>
  );
};
