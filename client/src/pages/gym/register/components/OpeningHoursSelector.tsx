import React from 'react';
import { Clock, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export interface OpeningHour {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

interface OpeningHoursSelectorProps {
    hours: OpeningHour[];
    onChange: (hours: OpeningHour[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OpeningHoursSelector = ({ hours, onChange }: OpeningHoursSelectorProps) => {
    const handleToggleClosed = (index: number) => {
        const newHours = [...hours];
        newHours[index].isClosed = !newHours[index].isClosed;
        onChange(newHours);
    };

    const handleTimeChange = (index: number, field: 'open' | 'close', value: string) => {
        const newHours = [...hours];
        newHours[index][field] = value;
        onChange(newHours);
    };

    const applyToAll = (index: number) => {
        const source = hours[index];
        const newHours = hours.map(h => ({
            ...h,
            open: source.open,
            close: source.close,
            isClosed: source.isClosed
        }));
        onChange(newHours);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Opening Hours</label>
            </div>

            <div className="space-y-3">
                {hours.map((hour, index) => (
                    <div key={hour.day} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-white/20">
                        <div className="w-24 font-bold text-sm text-gray-300">{hour.day}</div>

                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{hour.isClosed ? 'Closed' : 'Open'}</span>
                            <Switch
                                checked={!hour.isClosed}
                                onCheckedChange={() => handleToggleClosed(index)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        {!hour.isClosed ? (
                            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                                <Input
                                    type="time"
                                    value={hour.open}
                                    onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                                    className="bg-white/5 border-white/10 h-10 rounded-xl text-xs w-full"
                                />
                                <span className="text-gray-500 self-center">to</span>
                                <Input
                                    type="time"
                                    value={hour.close}
                                    onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                                    className="bg-white/5 border-white/10 h-10 rounded-xl text-xs w-full"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => applyToAll(index)}
                                    className="text-[10px] font-black uppercase text-primary hover:bg-primary/10 px-2 h-8 hidden lg:flex"
                                    title="Apply these hours to all days"
                                >
                                    Apply All
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/60 text-xs font-bold gap-2 w-full sm:w-auto italic">
                                <XCircle size={14} /> Closed for the day
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpeningHoursSelector;
