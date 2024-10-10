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
  IonButton,
  IonFab,
  IonFabButton,
  useIonAlert
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header'; // Componente de header reutilizable
import Navbar from '../../Navbar/Navbar'; // Componente de la navbar
import './Users.css'; // Estilos personalizados
import { useHistory } from 'react-router';
import { Button } from '@mui/material';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const Users: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

  interface User {
    id: number;
    name: string;
    email: string;
  }

  const [users, setUsers] = useState<User[]>([]);  // Estado inicial vacío
  const [presentAlert] = useIonAlert();  // Alerta para confirmación

  // Llamar al backend para obtener los usuarios cuando el componente se monta
  useEffect(() => {
    fetchUsers();  // Llama a la función para obtener los usuarios
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');  // Cambia la URL a la correcta de tu backend
      if (response.ok) {
        const data = await response.json();
        setUsers(data);  // Actualiza el estado con los datos obtenidos
      } else {
        console.error(t('fetch_error'));
      }
    } catch (error) {
      console.error(t('network_error'), error);
    }
  };

  // Función para manejar la eliminación del usuario
  const handleDelete = (userId: number) => {
    presentAlert({
      header: t('confirm_delete'),
      message: t('delete_message'),
      buttons: [
        t('cancel'),
        {
          text: t('delete'),
          handler: () => { 
            fetch(`/api/users/delete/${userId}`, { method: 'DELETE' })
              .then((response) => {
                if (response.ok) {
                  setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                } else {
                  console.error(`Error en la eliminación del usuario: ${response.statusText}`);
                }
              })
              .catch((error) => console.error(t('network_error'), error));
          },
        },
      ],
    });
  };
  

  const handleEdit = (userId: number) => {
    const selectedUser = users.find((user) => user.id === userId);
    history.push({
      pathname: `/admin/users/modify`,
      state: { userData: selectedUser },
    });
  };

  const handleAddUser = () => {
    history.push(`/admin/users/add`);
  };

  const handleAssign = (userId: number) => {
    history.push({
      pathname: `/admin/users/assign`,
      state: { userId },
    });
  };


  return (
    <IonPage>
      {/* Header */}
      <Header title={t('users')} />

      <IonContent style={{ backgroundColor: '#000000' }}>
        <IonGrid>
          {/* Listado de usuarios */}
          <IonRow style={{ marginBottom: '15%' }}>
            <IonCol size="12">
              {users.map((user) => (
                <IonCard
                  key={user.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '8px',
                    margin: '10px auto',
                    maxWidth: '95%',
                    boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                    height: 'auto',
                  }}
                >
                  <IonCardContent
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                    }}
                  >
                    {/* Información del usuario */}
                    <div>
                      <IonLabel
                        style={{
                          color: '#000000',
                          fontWeight: 'bold',
                          fontSize: '1em',
                        }}
                      >
                        {user.name}
                      </IonLabel>
                      <IonLabel
                        style={{
                          display: 'block',
                          color: '#6b6b6b',
                          fontSize: '0.9em',
                        }}
                      >
                        {user.email}
                      </IonLabel>
                    </div>

                    {/* Botones Modificar y Eliminar juntos pero compactos */}
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <Button
                        onClick={() => handleAssign(user.id)}
                        style={{
                          border: '1px solid #9C27B0',
                          backgroundColor: '#FFFFFF',
                          color: '#9C27B0',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          fontSize: '0.7em',
                          minWidth: '55px',
                        }}
                        className="no-focus"
                      >
                        {t('assign')}
                      </Button>

                      {/* Botón Modificar */}
                      <Button
                        onClick={() => handleEdit(user.id)}
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
                        {t('modify')}
                      </Button>

                      {/* Botón Eliminar */}
                      <Button
                        onClick={() => handleDelete(user.id)}
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
                        {t('delete')}
                      </Button>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonCol>
          </IonRow>

          {/* Botón flotante para añadir un nuevo usuario */}
          <IonFab vertical="bottom" horizontal="end" style={{ marginBottom: '15%', position: 'fixed' }}>
            <Button
              onClick={handleAddUser}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#32CD32',
                width: '60px',
                height: '60px',
                borderRadius: '50%', // Hace que el botón sea redondo
                border: '2px solid #32CD32', // Borde verde lima
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Add style={{ fontSize: '24px', color: '#32CD32' }} />
            </Button>
          </IonFab>

        </IonGrid>
      </IonContent>

      {/* Navbar */}
      <Navbar />
    </IonPage>
  );
};

export default Users;
