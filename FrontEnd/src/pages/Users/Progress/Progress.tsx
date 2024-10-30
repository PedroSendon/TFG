import React, { useState, useContext } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import ControlPanel from './ControlPanel';
import WorkoutHistory from './WorkoutHistory';
import Graphics from './Graphics';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const Progress: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<number>(0);
    const { t } = useContext(LanguageContext);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedSection(newValue);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', paddingTop: '16%' }}>
            <Header title={t('progress_title')} /> 
            
            {/* Navbar fija */}
            <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        backgroundColor: '#f5f5f5',
                        paddingTop: '16%',
                        zIndex: 1000,
                        borderBottom: '1px solid #ccc', // Línea inferior para separación
                    }}
                >
                <Container maxWidth="md">
                    <Tabs
                        value={selectedSection}
                        onChange={handleTabChange}
                        centered
                        textColor="inherit"
                        indicatorColor="secondary"
                        sx={{
                            color: 'gray',
                            '.Mui-selected': { color: 'gray' },
                            '.MuiTabs-indicator': { backgroundColor: 'gray' },
                        }}
                    >
                        <Tab label={t('control_panel_label')} />
                        <Tab label={t('workout_label')} />
                        <Tab label={t('weight_graph_label')} />
                    </Tabs>
                </Container>
            </Box>

            {/* Contenido de las secciones con margen superior */}
            <Container maxWidth="md" sx={{ mt: 10, paddingBottom: '16px' }}>
                {selectedSection === 0 && <ControlPanel />}
                {selectedSection === 1 && <WorkoutHistory />}
                {selectedSection === 2 && <Graphics />}
            </Container>
        </Box>
    );
};

export default Progress;
