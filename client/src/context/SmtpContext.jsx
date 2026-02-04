import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const SmtpContext = createContext(null);

export const SmtpProvider = ({ children }) => {
    const [smtpSlots, setSmtpSlots] = useState([]);
    const [smtpStats, setSmtpStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ On-demand fetch function - NO auto-fetch on mount
    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            // console.log('SmtpContext: Fetching slots...');
            const response = await api.smtp.getSlots();
            if (response.data?.success) {
                const slots = response.data.data?.slots || response.data.data || [];
                setSmtpSlots(Array.isArray(slots) ? slots : []);
                setSmtpStats(response.data.data?.stats || null);
            }
        } catch (error) {
            console.error('Error fetching SMTP slots:', error);
            setSmtpSlots([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh function (alias for fetchSlots for backwards compatibility)
    const refresh = useCallback(async () => {
        await fetchSlots();
    }, [fetchSlots]);

    const value = useMemo(() => ({
        smtpSlots,
        smtpStats,
        loading,
        fetchSlots,  // ✅ Exposed for manual calling
        refresh
    }), [smtpSlots, smtpStats, loading, fetchSlots, refresh]);

    return (
        <SmtpContext.Provider value={value}>
            {children}
        </SmtpContext.Provider>
    );
};

export const useSmtp = () => {
    const context = useContext(SmtpContext);
    if (!context) throw new Error('useSmtp must be used within SmtpProvider');
    return context;
};