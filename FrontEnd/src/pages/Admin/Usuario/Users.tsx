import React from 'react';
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
  IonAlert,  // Añadido para la confirmación
  useIonAlert
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header'; // Componente de header reutilizable
import Navbar from '../../Navbar/Navbar'; // Componente de la navbar
import './Users.css'; // Estilos personalizados
import { useHistory } from 'react-router';
import { Button } from '@mui/material';

const usersInitialData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
];

const Users: React.FC = () => {
  const history = useHistory(); // Inicializa el hook para manejar la navegación.

  const [users, setUsers] = React.useState(usersInitialData);  // Estado local para los usuarios
  const [presentAlert] = useIonAlert();  // Alerta para confirmación

  // Función para manejar la eliminación del usuario
  const handleDelete = (userId: number) => {
    presentAlert({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        'Cancelar',
        {
          text: 'Eliminar',
          handler: () => {
            // Llamada al backend para eliminar el usuario
            fetch(`/users/${userId}`, { method: 'DELETE' })
              .then((response) => {
                if (response.ok) {
                  // Actualiza la lista de usuarios en el frontend
                  setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                } else {
                  console.error('Error al eliminar el usuario');
                }
              })
              .catch((error) => console.error('Error:', error));
          },
        },
      ],
    });
  };

  // Función para manejar la modificación del usuario
  const handleEdit = (userId: number) => {
    // Buscar los datos del usuario seleccionado
    const selectedUser = users.find((user) => user.id === userId);

    // Redirigir a la página de modificación del usuario y pasar los datos del usuario seleccionado
    history.push({
      pathname: `/admin/users/modify`, // Ruta de la página de modificación del usuario
      state: { userData: selectedUser }, // Pasar los datos del usuario seleccionado
    });
  };

  const handleAddUser = () => {
    console.log('Navegando a /admin/nutrition/add');
    history.push(`/admin/users/add`);
  };


  return (
    <IonPage>
      {/* Header */}
      <Header title="Users" />

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
                        Modificar
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
                        Eliminar
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
