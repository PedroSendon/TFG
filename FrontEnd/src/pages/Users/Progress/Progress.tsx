import React, { useState, useContext } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import ControlPanel from './ControlPanel';
import WorkoutHistory from './WorkoutHistory';
import Graphics from './Graphics';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Contexto de idioma

const Progress: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<number>(0);
    const { t } = useContext(LanguageContext); // Hook para obtener la función de traducción

    // Función para manejar el cambio de pestañas
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedSection(newValue);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', marginTop:'16%' }}>
            <Header title={t('progress_title')} />  {/* Usamos la variable para el título */}
            <Container maxWidth="md">
                {/* Etiquetas para seleccionar las secciones */}
                <Tabs
                    value={selectedSection}
                    onChange={handleTabChange}
                    centered
                    textColor="inherit"
                    indicatorColor="secondary"
                    sx={{
                        color: 'gray',
                        '.Mui-selected': { color: 'gray' }, // Color de pestaña seleccionada
                        '.MuiTabs-indicator': { backgroundColor: 'gray' }, // Color del indicador
                    }}
                >
                    <Tab label={t('control_panel_label')} />
                    <Tab label={t('workout_label')} />
                    <Tab label={t('weight_graph_label')} />
                </Tabs>

                {/* Mostrar la sección seleccionada */}
                {selectedSection === 0 && <ControlPanel />}
                {selectedSection === 1 && <WorkoutHistory />}
                {selectedSection === 2 && <Graphics />}
            </Container>
        </Box>
    );
};

export default Progress;
