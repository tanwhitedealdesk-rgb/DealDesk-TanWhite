import React, { useState, useMemo } from 'react';
import { Deal, RenovationWorkflow as WorkflowInterface, RenovationItem, RenovationStage, RenovationContractor } from '../../types';
import { Plus, X, Calendar, DollarSign, Wrench, Users, Clock, Edit2, Play, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { formatCurrency, parseNumberFromCurrency } from '../../services/utils';
import { api } from '../../services/api';

// --- Default Configuration Definitions ---
const DEFAULT_SCOPES: Record<string, string[]> = {
  "Soft Costs": [
    "Temp Utilities",
    "Temp Toilet",
    "Architectural Fees",
    "Engineering Fees",
    "Permits",
    "Survey / Drawings / Plans"
  ],
  "Demolition / Trashout": [
    "Demolition",
    "Trashout",
    "Dumpster"
  ],
  "Site Work": [
    "Grading",
    "Water Lines",
    "Septic",
    "Sewer Lines",
    "Landscaping",
    "Fence",
    "Concrete / Asphalt / Gravel",
    "Tree Trimming",
    "Pool / Spa"
  ],
  "Foundation": [
    "Foundation Repair",
    "Excavation",
    "Slab Pour",
    "Pier & Beam Repair"
  ],
  "Structure": [
    "Framing",
    "Roof Trusses",
    "Windows",
    "Retaining Wall",
    "Subfloors",
    "Basement",
    "Waterproofing",
    "Fireplace / Chimney",
    "Insulation",
    "Drywall",
    "Tape, Bed & Texture",
    "Ceiling Repair",
    "Support Beams"
  ],
  "Exterior": [
    "Roofing",
    "Flashing",
    "Gutters / Soffit / Fascia",
    "Siding",
    "Stucco",
    "Exterior Paint",
    "Garage Door",
    "Masonry Veneer",
    "Porch",
    "Deck"
  ],
  "Systems (MEP)": [
    "Rough HVAC",
    "Final HVAC",
    "Underslab Plumbing",
    "Rough Plumbing",
    "Plumbing Fixtures",
    "Sump Pump",
    "Rough Electrical",
    "Electrical Fixtures",
    "Water Heater",
    "Showers / Tubs"
  ],
  "Interior Finishes": [
    "Interior Paint",
    "Finish Carpentry",
    "Interior Doors",
    "Finish Hardware",
    "Exterior Doors",
    "Mirrors",
    "Shower Doors",
    "Kitchen Cabinets",
    "Countertops",
    "Millwork / Trim",
    "Kitchen Island",
    "Backsplash",
    "Vanities"
  ],
  "Flooring": [
    "Tile",
    "Marble",
    "Wood Flooring",
    "Carpet",
    "Vinyl"
  ],
  "Appliances": [
    "Appliance Package",
    "Range",
    "Cooktop",
    "Microwave",
    "Dishwasher",
    "Refrigerator",
    "Vent Hood",
    "Disposal"
  ],
  "Misc / Closeout": [
    "Final Clean",
    "Staging",
    "GC Fee",
    "Contingency",
    "Sales Tax"
  ]
};

const DEFAULT_STAGES = [
  "Planning",
  "Demo",
  "Rough-In (Electrical/Plumbing/HVAC)",
  "Framing",
  "Drywall",
  "Interior Finishes",
  "Exterior",
  "Final Inspection",
  "Completed"
];

function formatNumberWithCommas(value: number | string | undefined | null): string {
    if (value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
}

export function RenovationWorkflowManager({ deal, onUpdate }: { deal: Deal, onUpdate: (updates: Partial<Deal>) => void }) {
    const [activeTab, setActiveTab] = useState<'budget' | 'stages' | 'contractors'>('budget');
    
    // Auto-generate defaults if none exist
    const workflow: WorkflowInterface = deal.renovationWorkflow || {
        budgetItems: Object.entries(DEFAULT_SCOPES).flatMap(([category, scopes]) => 
            scopes.map(scope => ({ id: `${category}_${scope}`, category, scope, projectedCost: 0, actualCost: 0 }))
        ),
        stages: DEFAULT_STAGES.map((s, i) => ({ stage: s, isActive: i === 0, completedAt: null, notes: '' })),
        contractors: []
    };

    const handleUpdate = (newWorkflow: Partial<WorkflowInterface>) => {
        onUpdate({ renovationWorkflow: { ...workflow, ...newWorkflow } });
    };

    // Budget Update Logic
    const handleBudgetItemUpdate = (id: string, field: 'projectedCost' | 'actualCost', value: number) => {
        const newItems = workflow.budgetItems.map(item => item.id === id ? { ...item, [field]: value } : item);
        handleUpdate({ budgetItems: newItems });
    };

    // Stage Update Logic
    const handleStageUpdate = (index: number) => {
        const newStages = workflow.stages.map((st, i) => {
            if (i === index) return { ...st, isActive: true, completedAt: null };
            if (i < index && !st.completedAt) return { ...st, isActive: false, completedAt: new Date().toISOString() };
            if (i > index) return { ...st, isActive: false, completedAt: null };
            return { ...st, isActive: false };
        });
        handleUpdate({ stages: newStages });
    };

    const handleStageNoteUpdate = (index: number, note: string) => {
        const newStages = [...workflow.stages];
        newStages[index].notes = note;
        handleUpdate({ stages: newStages });
    }

    const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
    const [editingStageName, setEditingStageName] = useState<string>('');

    const handleAddStage = () => {
        const newStages = [...workflow.stages, { stage: 'New Stage', isActive: false, completedAt: null }];
        handleUpdate({ stages: newStages });
        setEditingStageIndex(newStages.length - 1);
        setEditingStageName('New Stage');
    };

    const handleRemoveStage = (index: number) => {
        const newStages = workflow.stages.filter((_, i) => i !== index);
        handleUpdate({ stages: newStages });
    };

    const saveStageName = (index: number) => {
        if (!editingStageName.trim()) return;
        const newStages = [...workflow.stages];
        newStages[index].stage = editingStageName.trim();
        handleUpdate({ stages: newStages });
        setEditingStageIndex(null);
    };

    // Contractor Update Logic
    const [editingContractor, setEditingContractor] = useState<Partial<RenovationContractor> | null>(null);

    const handleSaveContractor = async () => {
        if (!editingContractor || !editingContractor.name) return;
        
        let newContractors = [...workflow.contractors];
        if (editingContractor.id) {
            newContractors = newContractors.map(c => c.id === editingContractor.id ? editingContractor as RenovationContractor : c);
        } else {
            const newContractor = { ...editingContractor, id: crypto.randomUUID(), status: 'Active' } as RenovationContractor;
            newContractors.push(newContractor);
            
            // Also add to Contacts Manager
            try {
               await api.save({
                    id: crypto.randomUUID(),
                    name: newContractor.name,
                    company: newContractor.company || '',
                    type: 'Other',
                    phone: newContractor.phone || '',
                    email: newContractor.email || '',
                    address: '',
                    notes: `Added from Renovation Workflow (Trade: ${newContractor.trade || 'Unknown'})`
               }, 'Contacts');
            } catch (err) {
               console.error("Failed to add contractor to Contacts", err);
            }
        }
        handleUpdate({ contractors: newContractors });
        setEditingContractor(null);
    };

    const handleRemoveContractor = (id: string) => {
        handleUpdate({ contractors: workflow.contractors.filter(c => c.id !== id) });
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-4">
            
            {/* Tabs */}
            <div className="flex bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('budget')}
                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${activeTab === 'budget' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <DollarSign size={14} className="inline mr-2" /> Renovation Budget
                </button>
                <button 
                    onClick={() => setActiveTab('stages')}
                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${activeTab === 'stages' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Clock size={14} className="inline mr-2" /> Stages Tracker
                </button>
                <button 
                    onClick={() => setActiveTab('contractors')}
                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all ${activeTab === 'contractors' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Users size={14} className="inline mr-2" /> Contractors
                </button>
            </div>

            {/* TAB: Budget */}
            {activeTab === 'budget' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[500px] overflow-y-auto w-full relative">
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-6">Scope Of Work</div>
                        <div className="col-span-3 text-right">Projected Cost</div>
                        <div className="col-span-3 text-right">Actual Cost</div>
                    </div>
                    
                    {Object.keys(DEFAULT_SCOPES).map((category) => (
                        <div key={category} className="mb-4">
                            <h4 className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 py-1.5 px-3 uppercase tracking-wider my-2">{category}</h4>
                            <div className="space-y-1 pl-3">
                                {workflow.budgetItems.filter(item => item.category === category).map(item => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center group py-1 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <div className="col-span-6 text-sm text-gray-700 dark:text-gray-300">{item.scope}</div>
                                        <div className="col-span-3 relative">
                                            <span className="absolute left-3 top-1.5 text-gray-400 text-xs">$</span>
                                            <input 
                                                className="w-full bg-transparent border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 rounded p-1.5 pl-6 text-right text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-gray-900 dark:text-gray-100 transition-all font-mono" 
                                                value={item.projectedCost ? formatNumberWithCommas(item.projectedCost) : ''}
                                                onChange={(e) => handleBudgetItemUpdate(item.id, 'projectedCost', parseNumberFromCurrency(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <span className="absolute left-3 top-1.5 text-gray-400 text-xs">$</span>
                                            <input 
                                                className="w-full bg-transparent border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 rounded p-1.5 pl-6 text-right text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-gray-900 dark:text-gray-100 transition-all font-mono" 
                                                value={item.actualCost ? formatNumberWithCommas(item.actualCost) : ''}
                                                onChange={(e) => handleBudgetItemUpdate(item.id, 'actualCost', parseNumberFromCurrency(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 border-t-2 border-gray-200 dark:border-gray-700 mt-6 rounded-b">
                        <div className="grid grid-cols-12 gap-4 items-center font-bold">
                            <div className="col-span-6 text-right text-sm text-gray-600 dark:text-gray-300 uppercase">Totals</div>
                            <div className="col-span-3 text-right text-lg text-blue-600 dark:text-blue-400 font-mono">${formatNumberWithCommas(workflow.budgetItems.reduce((acc, c) => acc + (c.projectedCost || 0), 0))}</div>
                            <div className="col-span-3 text-right text-lg text-green-600 dark:text-green-400 font-mono">${formatNumberWithCommas(workflow.budgetItems.reduce((acc, c) => acc + (c.actualCost || 0), 0))}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Stages Tracker */}
            {activeTab === 'stages' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[500px]">
                    <div className="flex flex-col relative w-full border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-6">
                        {workflow.stages.map((stage, i) => (
                            <div key={i} className="pl-6 relative">
                                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${stage.completedAt ? 'bg-green-500 border-green-500' : stage.isActive ? 'bg-blue-500 border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' }`} />
                                <div className="flex items-center gap-4 group/stage">
                                    {editingStageIndex === i ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                autoFocus
                                                type="text"
                                                value={editingStageName}
                                                onChange={(e) => setEditingStageName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveStageName(i);
                                                    if (e.key === 'Escape') setEditingStageIndex(null);
                                                }}
                                                onBlur={() => saveStageName(i)}
                                                className="border-b-2 border-blue-500 bg-transparent text-base font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-base font-bold ${stage.completedAt ? 'text-gray-500 line-through dark:text-gray-400' : stage.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {stage.stage}
                                            </h4>
                                            <button 
                                                onClick={() => {
                                                    setEditingStageIndex(i);
                                                    setEditingStageName(stage.stage);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover/stage:opacity-100 transition-opacity"
                                                title="Edit Stage Name"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {!stage.completedAt ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => !stage.isActive && handleStageUpdate(i)} className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${stage.isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 cursor-default flex items-center gap-1' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {stage.isActive ? 'Current Phase' : 'Mark Active'}
                                            </button>
                                            {stage.isActive && i > 0 && (
                                                <button onClick={() => handleStageUpdate(i - 1)} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-2 py-1 rounded-full transition-colors font-bold" title="Revert to previous stage">
                                                    <RotateCcw size={12}/> Revert
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/revert">
                                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Completed {new Date(stage.completedAt).toLocaleDateString()}</span>
                                            <button onClick={() => handleStageUpdate(i)} className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 opacity-0 group-hover/revert:opacity-100 transition-opacity" title="Revert to this stage">
                                                <RotateCcw size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {(stage.isActive || stage.completedAt || stage.notes) && (
                                    <div className="mt-2 text-sm w-full max-w-2xl">
                                        <textarea 
                                            placeholder="Add notes for this stage..."
                                            value={stage.notes || ''}
                                            onChange={(e) => handleStageNoteUpdate(i, e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                                            rows={2}
                                        />
                                    </div>
                                )}
                                
                                {workflow.stages.length > 1 && (
                                    <button 
                                        onClick={() => handleRemoveStage(i)} 
                                        className="absolute -left-[30px] top-1.5 opacity-0 group-hover/stage:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                        title="Delete Stage"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        <div className="pl-6 relative pt-4">
                            <button 
                                onClick={handleAddStage}
                                className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                <Plus size={16} /> Add New Stage
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Contractor Management */}
            {activeTab === 'contractors' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Contractor Crew</h4>
                        <button onClick={() => setEditingContractor({ status: 'Active' })} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded text-sm flex items-center gap-2">
                            <Plus size={16} /> Add Contractor
                        </button>
                    </div>

                    {editingContractor && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Name *</label><input className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.name || ''} onChange={e => setEditingContractor({...editingContractor, name: e.target.value})} placeholder="John Doe" /></div>
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Company</label><input className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.company || ''} onChange={e => setEditingContractor({...editingContractor, company: e.target.value})} placeholder="ABC Renovations" /></div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-bold">Trade *</label>
                                <select className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.trade || ''} onChange={e => setEditingContractor({...editingContractor, trade: e.target.value})}>
                                    <option value="">Select Trade...</option>
                                    <option value="General Contractor">General Contractor</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="HVAC">HVAC</option>
                                    <option value="Roofer">Roofer</option>
                                    <option value="Framer">Framer</option>
                                    <option value="Drywaller">Drywaller</option>
                                    <option value="Painter">Painter</option>
                                    <option value="Landscaper">Landscaper</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Phone</label><input className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.phone || ''} onChange={e => setEditingContractor({...editingContractor, phone: e.target.value})} placeholder="(555) 555-5555" /></div>
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Email</label><input className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.email || ''} onChange={e => setEditingContractor({...editingContractor, email: e.target.value})} placeholder="john@example.com" /></div>
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Assigned Tasks</label><input className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.assignedTasks || ''} onChange={e => setEditingContractor({...editingContractor, assignedTasks: e.target.value})} placeholder="e.g. Master bathroom plumbing" /></div>
                            <div className="space-y-1"><label className="text-xs text-gray-500 font-bold">Status</label>
                                <select className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-blue-500" value={editingContractor.status || 'Active'} onChange={e => setEditingContractor({...editingContractor, status: e.target.value as any})}>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Removed">Removed</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2 mt-2">
                                <button onClick={() => setEditingContractor(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold">Cancel</button>
                                <button onClick={handleSaveContractor} className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold shadow-sm hover:bg-blue-500 transition-colors">Save Contractor</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {workflow.contractors.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 italic text-sm">No contractors assigned yet. Click "Add Contractor" to begin.</div>
                        ) : workflow.contractors.map(c => (
                            <div key={c.id} className={`flex items-start justify-between border ${c.status === 'Completed' ? 'border-green-200 dark:border-green-800/50' : c.status === 'Removed' ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 opacity-70' : 'border-gray-200 dark:border-gray-700'} p-4 rounded-lg shadow-sm hover:shadow-md transition-all`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h5 className="font-bold text-gray-900 dark:text-white text-base">{c.name}</h5>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${c.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : c.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>{c.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{c.company} <span className="mx-1">•</span> <span className="text-blue-600 dark:text-blue-400">{c.trade}</span></div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        {c.phone && <div>📞 {c.phone}</div>}
                                        {c.email && <div>✉️ {c.email}</div>}
                                        {c.assignedTasks && <div className="mt-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 mt-2 px-2 py-1 rounded inline-block"><strong>Tasks:</strong> {c.assignedTasks}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingContractor(c)} className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded text-xs dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition">Edit</button>
                                    <button onClick={() => handleRemoveContractor(c.id)} className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded text-xs dark:bg-red-900/20 dark:hover:bg-red-900/50 transition">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
