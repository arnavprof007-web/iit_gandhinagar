import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { History, Zap, Bike, Sun, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivityFeed: React.FC = () => {
  const activities = [
    {
      id: '1',
      title: 'Switched off vampire loads overnight',
      category: 'Challenge Completed',
      icon: <Zap className="w-4 h-4 text-emerald-600" />,
      time: 'Yesterday, 10:30 PM',
      points: '+20 pts',
    },
    {
      id: '2',
      title: 'Logged 28 km Metro round trip commute',
      category: 'Transport Activity',
      icon: <Bike className="w-4 h-4 text-sky-600" />,
      time: 'Oct 25, 6:45 PM',
      points: '+30 pts',
    },
    {
      id: '3',
      title: 'Evaluated 2.5 kW rooftop solar feasibility',
      category: 'Solar Simulation',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      time: 'Oct 20, 11:15 AM',
      points: '+50 pts',
    },
    {
      id: '4',
      title: 'Unlocked "Streak Champion" badge',
      category: 'Milestone Award',
      icon: <Trophy className="w-4 h-4 text-purple-600" />,
      time: 'Oct 18, 09:00 AM',
      points: '+100 pts',
    },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title="Recent Environmental Activity"
          subtitle="Your verified & self-reported actions"
          icon={<History className="w-5 h-5 text-emerald-600" />}
          action={
            <Link to="/progress" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent className="divide-y divide-slate-100 p-0">
          {activities.map((act) => (
            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  {act.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.title}</p>
                  <p className="text-[11px] text-slate-400">{act.category} • {act.time}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {act.points}
              </span>
            </div>
          ))}
        </CardContent>
      </div>
    </Card>
  );
};
