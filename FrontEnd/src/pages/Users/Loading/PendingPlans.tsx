import React, { useContext } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const PendingPlans: React.FC = () => {
    const { t } = useContext(LanguageContext);

    return (
        <Box sx={{ padding: '20px', textAlign: 'center', marginTop: '16%' }}>
            <Header title={t('plan_assignment_status')} />
            
            <CircularProgress color="primary" size={60} sx={{ marginBottom: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', marginBottom: 2 }}>
                {t('preparing_your_plan')}
            </Typography>
            
            <Typography variant="body1" color="textSecondary">
                {t('reviewing_goals_message')}
            </Typography>
        </Box>
    );
};

export default PendingPlans;
