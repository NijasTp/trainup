
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const equipmentList = [
    { id: 'dumbbell', name: 'Dumbbell Set', category: 'Free Weights' },
    { id: 'barbell', name: 'Barbell & Plates', category: 'Free Weights' },
    { id: 'smith', name: 'Smith Machine', category: 'Machines' },
    { id: 'treadmill', name: 'Treadmill', category: 'Cardio' },
    { id: 'crossfit', name: 'Crossfit Rig', category: 'Functional' },
    { id: 'legpress', name: 'Leg Press', category: 'Machines' },
    { id: 'benchpress', name: 'Bench Press', category: 'Free Weights' },
    { id: 'cycling', name: 'Stationary Bike', category: 'Cardio' },
];

const Equipment = () => {
    const [selected, setSelected] = useState<string[]>(['dumbbell', 'treadmill']);

    const toggleEquipment = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">EQUIPMENT INVENTORY</h1>
                    <p className="text-gray-500">Select available machinery and tools in your gym</p>
                </div>
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all">
                    <Save size={18} className="mr-2" /> Save Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {equipmentList.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleEquipment(item.id)}
                            className={`relative cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 ${isSelected
                                    ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]'
                                    : 'bg-white/5 border-white/10 grayscale hover:grayscale-0 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className={`p-3 rounded-2xl ${isSelected ? 'bg-primary text-black' : 'bg-white/5 text-gray-500'}`}>
                                    {/* Icon placeholder based on category */}
                                    <div className="w-6 h-6 flex items-center justify-center font-bold">
                                        {item.name[0]}
                                    </div>
                                </div>
                                {isSelected ? (
                                    <CheckCircle2 className="text-primary h-6 w-6" />
                                ) : (
                                    <Circle className="text-gray-600 h-6 w-6" />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{item.category}</p>
                                <h3 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>{item.name}</h3>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="glow"
                                    className="absolute inset-0 bg-primary/5 rounded-3xl pointer-events-none"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Equipment;
