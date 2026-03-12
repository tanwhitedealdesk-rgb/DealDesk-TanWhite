import React, { useState, useEffect } from 'react';
import { Mail, Shield, Zap, Info, Save, RotateCcw, Loader2, Globe, Key, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { GOOGLE_SCRIPT_URL } from '../../constants';

export const SettingsEmail: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);
    
    const [config, setConfig] = useState({
        enabled: true,
        region: 'us-east-2',
        sourceEmail: '',
        accessKey: '',
        secretKey: ''
    });

    const fetchConfig = async () => {
        setIsLoading(true);
        console.log("🔄 Fetching AWS Config...");
        try {
            const res = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'get_aws_config' }),
                headers: { "Content-Type": "text/plain" }
            });

            if (!res.ok) throw new Error('Network response was not ok');
            
            const responseData = await res.json();
            console.log("📥 Config Received:", responseData);
            
            // Check if backend handled the action correctly
            if (responseData && responseData.status === 'success' && responseData.data) {
                const d = responseData.data;
                setConfig(prev => ({ 
                    ...prev, 
                    region: d.region || 'us-east-2',
                    sourceEmail: d.sourceEmail || '',
                    accessKey: d.accessKey || '',
                    secretKey: d.secretKey || '', 
                    enabled: d.enabled !== false
                }));
            } else {
                console.warn("⚠️ Backend returned unexpected format. Did you re-deploy the Web App?");
            }
        } catch (e) {
            console.error("❌ Failed to load AWS config:", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const handleChange = (field: string, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setTestResult(null);
        try {
            const res = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: 'save_aws_config', 
                    data: config 
                }),
                headers: { "Content-Type": "text/plain" }
            });
            
            if (!res.ok) throw new Error("Connection error: " + res.status);
            
            const data = await res.json();
            
            if (data && data.status === 'success') {
                alert(data.message || "Configuration saved successfully.");
                setTestResult({
                    status: 'success',
                    message: data.message || 'Configuration updated.'
                });
            } else {
                throw new Error(data?.message || data?.error || 'Failed to save.');
            }
        } catch (e: any) {
            console.error("Save failed", e);
            setTestResult({ 
                status: 'error', 
                message: e?.message || 'Save failed.' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestHandshake = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'test_aws_handshake' }),
                headers: { "Content-Type": "text/plain" }
            });
            
            const data = await res.json();
            
            if (data && (data.status === 'success' || data.status === 'partial_success')) {
                setTestResult({
                    status: 'success',
                    message: data.message || 'Connection verified. Email sent.'
                });
            } else {
                setTestResult({
                    status: 'error',
                    message: data?.message || data?.error || 'Handshake failed.'
                });
            }
        } catch (e: any) {
            setTestResult({ status: 'error', message: 'Network error.' });
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-sm tracking-wide">Retrieving API Configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Configuration (AWS SES API)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your AWS Simple Email Service credentials for direct API delivery.</p>
                </div>
                <button 
                    onClick={fetchConfig} 
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh Configuration"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Master Toggle */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">SES API Status</div>
                        <div className="text-xs text-gray-500">{config.enabled ? 'Live and active' : 'API service paused'}</div>
                    </div>
                </div>
                <button 
                    onClick={() => handleChange('enabled', !config.enabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            <div className={`space-y-8 transition-opacity duration-300 ${config.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                
                {/* Configuration Section */}
                <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Globe size={14} /> Service Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1.5 block">Sender Identity (From Email)</label>
                            <input 
                                type="email"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors" 
                                value={config.sourceEmail} 
                                onChange={e => handleChange('sourceEmail', e.target.value)}
                                placeholder="e.g. deals@asharizakargroup.com"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">This email must be a <b>Verified Identity</b> in your AWS SES dashboard.</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1.5 block">AWS Region</label>
                            <select 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors appearance-none"
                                value={config.region}
                                onChange={e => handleChange('region', e.target.value)}
                            >
                                <option value="us-east-1">US East (N. Virginia)</option>
                                <option value="us-east-2">US East (Ohio)</option>
                                <option value="us-west-2">US West (Oregon)</option>
                                <option value="eu-west-1">Europe (Ireland)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Credentials Section */}
                <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Key size={14} /> API Credentials (IAM)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1.5 block">Access Key ID</label>
                            <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors font-mono" 
                                value={config.accessKey} 
                                onChange={e => handleChange('accessKey', e.target.value)}
                                placeholder="AKIA..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1.5 block">Secret Access Key</label>
                            <input 
                                type="password"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors font-mono" 
                                value={config.secretKey} 
                                onChange={e => handleChange('secretKey', e.target.value)}
                                placeholder="••••••••••••••••••••••••••••••••"
                            />
                        </div>
                    </div>
                </section>

                {testResult && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 ${
                        testResult.status === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}>
                        {testResult.status === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                        <div>
                            <p className="text-sm font-bold">{testResult.status === 'success' ? 'Verification Successful' : 'Verification Failed'}</p>
                            <p className="text-xs opacity-80 mt-0.5">{testResult.message}</p>
                        </div>
                    </div>
                )}

                <div className="pt-6 flex flex-wrap gap-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                    <button 
                        onClick={handleTestHandshake}
                        disabled={isTesting || !config.sourceEmail}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 border border-gray-200 dark:border-gray-700"
                    >
                        {isTesting ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <RotateCcw size={18} className="text-blue-500" />}
                        Test API Handshake
                    </button>
                    <div className="flex-1"></div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Info size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-300/60 uppercase tracking-tight">API Signature V4 Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
};