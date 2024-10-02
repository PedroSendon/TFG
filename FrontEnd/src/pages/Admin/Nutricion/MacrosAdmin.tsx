import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonFab,
    IonFabButton,
    IonSegment,
    IonSegmentButton,
    IonAlert, // Añadido para la confirmación
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header'; // Componente de header reutilizable
import Navbar from '../../Navbar/Navbar'; // Componente de la navbar
import { Button } from '@mui/material';
import { useHistory } from 'react-router';

// Definir un tipo para las categorías
type Category = 'weightLoss' | 'muscleGain' | 'maintenance';

const macroData: Record<Category, { id: number; kcal: number; proteins: number; carbs: number; fats: number }[]> = {
    weightLoss: [
        { id: 1, kcal: 1500, proteins: 100, carbs: 120, fats: 50 },
        { id: 2, kcal: 1600, proteins: 110, carbs: 130, fats: 55 },
    ],
    muscleGain: [
        { id: 3, kcal: 2500, proteins: 150, carbs: 300, fats: 70 },
        { id: 4, kcal: 2700, proteins: 160, carbs: 320, fats: 75 },
    ],
    maintenance: [
        { id: 5, kcal: 2000, proteins: 120, carbs: 200, fats: 60 },
        { id: 6, kcal: 2200, proteins: 130, carbs: 220, fats: 65 },
    ],
};

const MacrosAdmin: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<Category>('weightLoss');
    const [macros, setMacros] = useState(macroData);
    const [showAlert, setShowAlert] = useState(false);
    const [macroToDelete, setMacroToDelete] = useState<number | null>(null);
    const history = useHistory(); // Inicializa el hook para manejar la navegación.

    // Función para confirmar la eliminación
    const handleDelete = () => {
        if (macroToDelete !== null) {
            setMacros((prevMacros) => {
                const updatedMacros = { ...prevMacros };
                updatedMacros[selectedCategory] = updatedMacros[selectedCategory].filter((macro) => macro.id !== macroToDelete);
                return updatedMacros;
            });
            setMacroToDelete(null);
        }
        setShowAlert(false); // Ocultar la alerta después de confirmar la eliminación
    };

    // Función para abrir la confirmación de eliminación
    const confirmDelete = (id: number) => {
        setMacroToDelete(id);
        setShowAlert(true); // Mostrar la alerta de confirmación
    };

    const handleAddMacros = () => {
        console.log('Navegando a /admin/nutrition/add');
        history.push(`/admin/nutrition/add`);
    };

    // Función para redirigir a la página de modificar macros
    const handleEditMacros = (macro: { id: number; kcal: number; proteins: number; carbs: number; fats: number }) => {
        history.push({
            pathname: `/admin/nutrition/modify`, // Ruta a la página de modificación
            state: { recommendation: macro }, // Pasar los datos del macro seleccionado
        });
    };


    return (
        <IonPage>
            {/* Header */}
            <Header
                title={
                    selectedCategory === 'weightLoss'
                        ? 'Weight Loss Nutrition'
                        : selectedCategory === 'muscleGain'
                            ? 'Muscle Gain Nutrition'
                            : selectedCategory === 'maintenance'
                                ? 'Maintenance Nutrition'
                                : 'Exercises'
                }
            />            <IonContent style={{ backgroundColor: '#000000' }}>
                {/* Navbar superior con categorías */}
                <IonSegment
                    value={selectedCategory}
                    onIonChange={(e: { detail: { value: Category } }) => {
                        if (e.detail.value !== selectedCategory) {
                            setSelectedCategory(e.detail.value!);
                        }
                    }}
                    className="custom-segment"
                    color="success"
                >
                    <IonSegmentButton value="weightLoss">
                        <IonLabel>Weight Loss</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="muscleGain">
                        <IonLabel>Muscle Gain</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="maintenance">
                        <IonLabel>Maintenance</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <IonGrid>
                    <IonRow>
                        {macros[selectedCategory].map((macro) => (
                            <IonCol size="12" key={macro.id}>
                                <IonCard
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '10px',
                                        padding: '8px',
                                        margin: '10px auto',
                                        maxWidth: '95%',
                                        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <IonCardContent
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        {/* Información de la recomendación */}
                                        <div>
                                            <IonLabel
                                                style={{
                                                    color: '#000000',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2em',
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {macro.kcal} Kcal
                                            </IonLabel>
                                            <IonLabel style={{ color: '#6b6b6b', fontSize: '0.9em' }}>
                                                Proteins: {macro.proteins}g, Carbs: {macro.carbs}g, Fats: {macro.fats}g
                                            </IonLabel>
                                        </div>

                                        {/* Botones Modificar y Eliminar */}
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <Button
                                                onClick={() => handleEditMacros(macro)}
                                                style={{
                                                    border: '1px solid #32CD32',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#32CD32',
                                                    padding: '4px 8px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7em',
                                                    minWidth: '55px',
                                                }}
                                                className="no-focus"
                                            >
                                                Modificar
                                            </Button>

                                            <Button
                                                onClick={() => confirmDelete(macro.id)}
                                                style={{
                                                    border: '1px solid #FF0000',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#FF0000',
                                                    padding: '4px 8px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.7em',
                                                    minWidth: '55px',
                                                }}
                                                className="no-focus"
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>

                {/* Botón flotante para añadir una nueva recomendación */}
                <IonFab vertical="bottom" horizontal="end" style={{ marginBottom: '15%', position: 'fixed' }}>
                    <Button
                        onClick={handleAddMacros}
                        style={{
                            backgroundColor: '#FFFFFF',
                            color: '#32CD32',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '2px solid #32CD32',
                            zIndex: 1000,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Add style={{ fontSize: '24px', color: '#32CD32' }} />
                    </Button>
                </IonFab>

                {/* Alerta de confirmación */}
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header={'Confirmar eliminación'}
                    message={'¿Estás seguro de que deseas eliminar este macro?'}
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: () => {
                                setShowAlert(false); // Cerrar alerta si se cancela
                            },
                        },
                        {
                            text: 'Eliminar',
                            handler: handleDelete, // Eliminar macro al confirmar
                        },
                    ]}
                />
            </IonContent>

            {/* Navbar */}
            <Navbar />
        </IonPage>
    );
};

export default MacrosAdmin;
