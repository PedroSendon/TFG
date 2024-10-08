import React, { useEffect, useState } from 'react';
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
// Definir un tipo para la categoría que se obtiene desde el backend
interface Category {
    id: number;
    name: string;
    description: string;
}
const MacrosAdmin: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [macros, setMacros] = useState<Record<string, any[]>>({});
    const [showAlert, setShowAlert] = useState(false);
    const [macroToDelete, setMacroToDelete] = useState<number | null>(null);
    const history = useHistory();

    // Función para obtener las categorías de dieta desde el BE
    const fetchCategories = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/diet-categories/`);  // Asegúrate de que el endpoint es correcto
            const data = await response.json();
            if (response.ok) {
                setCategories(data.categories);
                setSelectedCategory(data.categories[0]?.name || ''); // Selecciona la primera categoría por defecto
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
            const response = await fetch(`http://127.0.0.1:8000/api/macros/${category}/`);
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

    // Obtener las categorías al cargar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    // Actualizar las recomendaciones según la categoría seleccionada
    useEffect(() => {
        if (selectedCategory) {
            fetchMacros(selectedCategory);
        }
    }, [selectedCategory]);

    // Función para eliminar
    const handleDelete = () => {
        if (macroToDelete !== null) {
            setMacros((prevMacros) => {
                const updatedMacros = { ...prevMacros };
                updatedMacros[selectedCategory] = updatedMacros[selectedCategory].filter((macro) => macro.id !== macroToDelete);
                return updatedMacros;
            });
            setMacroToDelete(null);
        }
        setShowAlert(false);
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
            <Header title="Nutrition Management" />
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
                >
                    {categories.map((category) => (
                        <IonSegmentButton key={category.id} value={category.name}>
                            <IonLabel>{category.name}</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>

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
                                                Modify
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
                                                Delete
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
