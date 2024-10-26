import React, { useEffect, useState, useContext } from 'react';
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
    IonAlert,
    IonSegment,
    IonSegmentButton,
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header';
import Navbar from '../../Navbar/Navbar';
import { Button } from '@mui/material';
import { useHistory, useLocation } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext';  // Importar el contexto de idioma

// Definir un tipo para las categorías
interface Category {
    id: number;
    name: string;
    description: string;
}

const MacrosAdmin: React.FC = () => {
    const { t } = useContext(LanguageContext);  // Usamos el contexto de idioma
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [macros, setMacros] = useState<Record<string, any[]>>({});
    const [showAlert, setShowAlert] = useState(false);
    const [macroToDelete, setMacroToDelete] = useState<number | null>(null);
    const history = useHistory();
    const [updateRequired, setUpdateRequired] = useState(false);  // Estado para controlar recarga de datos
    const location = useLocation<{ reload?: boolean }>();  // Obtener la ubicación actual con tipo definido

    // Función para obtener las categorías de dieta desde el BE
    const fetchCategories = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/diet-categories/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data.categories);
                setSelectedCategory(data.categories[0]?.name || '');  // Seleccionar la primera categoría por defecto
            } else {
                console.error('Error fetching categories:', data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Función para obtener las recomendaciones de macronutrientes desde el BE
    const fetchMacros = async (category: string) => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${category}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
            const data = await response.json();
            if (response.ok) {
                setMacros((prev) => ({ ...prev, [category]: data }));
            } else {
                console.error('Error fetching macros:', data);
            }
        } catch (error) {
            console.error('Error fetching macros:', error);
        }
    };



    useEffect(() => {
        fetchCategories();
        if (selectedCategory) {
            fetchMacros(selectedCategory);
        }
    }, [selectedCategory, updateRequired]); 

    // Recargar datos si el usuario regresa desde otra página
    useEffect(() => {
        if (location.state?.reload) {
            setUpdateRequired(!updateRequired);
        }
    }, [location.state]);
    // Función para eliminar
    const handleDelete = async () => {
        if (macroToDelete !== null) {
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    console.error(t('no_token'));
                    return;
                }
    
                const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${selectedCategory}/${macroToDelete}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
    
                if (response.ok) {
                    // Refrescar datos de macros al eliminar
                    setUpdateRequired(!updateRequired);
                } else {
                    console.error('Error al eliminar el macro');
                }
            } catch (error) {
                console.error('Error en la eliminación:', error);
            }
            setMacroToDelete(null);
            setShowAlert(false);
        }
    };
    

    const confirmDelete = (id: number) => {
        setMacroToDelete(id);
        setShowAlert(true);
    };

    const handleAddMacros = () => {
        history.push(`/admin/nutrition/add`);
    };

    const handleEditMacros = (macro: { id: number; kcal: number; proteins: number; carbs: number; fats: number }) => {
        history.push({
            pathname: `/admin/nutrition/modify`,
            state: { recommendation: macro },
        });
    };

    return (
        <IonPage>
            {/* Header */}
            <Header title={t('nutrition_management_title')} />  {/* Uso de la variable de texto */}

            <IonContent style={{ backgroundColor: '#000000' }}>
                {/* Navbar superior con categorías obtenidas desde el backend */}
                <IonSegment
                    value={selectedCategory}
                    onIonChange={(e: { detail: { value: string } }) => {
                        if (e.detail.value !== selectedCategory) {
                            setSelectedCategory(e.detail.value!);
                        }
                    }}
                    className="custom-segment"
                    color="success"
                    style={{
                        position: 'fixed',   // Posición fija
                        top: '56px',         // Ajustar la posición debajo del Header
                        width: '100%',
                        zIndex: 1000,        // Asegura que esté sobre el contenido
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #ccc',
                    }}
                >
                    <IonSegmentButton value="weightLoss">
                        <IonLabel>{t('weight_loss')}</IonLabel>  {/* Texto traducido */}
                    </IonSegmentButton>
                    <IonSegmentButton value="muscleGain">
                        <IonLabel>{t('muscle_gain')}</IonLabel>  {/* Texto traducido */}
                    </IonSegmentButton>
                    <IonSegmentButton value="maintenance">
                        <IonLabel>{t('maintenance')}</IonLabel>  {/* Texto traducido */}
                    </IonSegmentButton>
                </IonSegment>
                <div style={{ marginTop: '10%' }}> 
                <IonGrid>
                    <IonRow>
                        {macros[selectedCategory] && macros[selectedCategory].map((macro) => (
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
                                    <IonCardContent>
                                        {/* Contenedor general para el contenido */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                width: '100%',
                                            }}
                                        >
                                            {/* Nombre del plan de macros (ocupando el ancho completo) */}
                                            <IonLabel
                                                style={{
                                                    color: '#000000',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2em',
                                                    width: '100%',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                {macro.name}
                                            </IonLabel>

                                            {/* Contenedor para la información y los botones */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                {/* Información del macro a la izquierda */}
                                                <div>
                                                    <IonLabel style={{ color: '#6b6b6b', fontSize: '0.9em' }}>
                                                        {macro.kcal} Kcal, {t('proteins')}: {macro.proteins}g, {t('carbs')}: {macro.carbs}g, {t('fats')}: {macro.fats}g
                                                    </IonLabel>
                                                </div>

                                                {/* Botones a la derecha */}
                                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                                    >
                                                        {t('modify_button')}
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
                                                    >
                                                        {t('delete_button')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                        ))}
                    </IonRow>
                </IonGrid>

                </div>
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
                    header={t('confirm_delete_alert_title')}
                    message={t('confirm_delete_alert_message')}
                    buttons={[
                        {
                            text: t('cancel_button'),
                            role: 'cancel',
                            handler: () => {
                                setShowAlert(false);
                            },
                        },
                        {
                            text: t('delete_button'),
                            handler: handleDelete,
                        },
                    ]}
                />
            </IonContent>

            <Navbar />
        </IonPage>
    );
};

export default MacrosAdmin;
