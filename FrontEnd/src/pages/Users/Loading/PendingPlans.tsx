import React, { useContext } from 'react';
import { Box, Typography, CircularProgress, CardContent, Card } from '@mui/material';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const PendingPlans: React.FC = () => {
    const { t } = useContext(LanguageContext);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '95vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
            <Header title={t('plan_assignment_status')} />
            
            <Card sx={{ borderRadius: '16px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '90%', mx: 'auto', mt: 4 }}>
                <CardContent sx={{ textAlign: 'center', padding: '30px' }}>
                    <CircularProgress color="primary" size={70} sx={{ mb: 3 }} />

                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                        {t('preparing_your_plan')}
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#555' }}>
                        {t('reviewing_goals_message')}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PendingPlans;
