import React, { useEffect, useState } from 'react';
import {

  useIonAlert
} from '@ionic/react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { Add, Close } from '@mui/icons-material';
import Header from '../../Header/Header'; // Componente de header reutilizable
import './Users.css'; // Estilos personalizados
import { useHistory, useLocation } from 'react-router';
import { Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, Typography } from '@mui/material';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma
import { h } from 'vue';

const Users: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
  const location = useLocation<{ reload?: boolean }>();  // Obtener la ubicación actual con tipo definido
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState('');


  interface User {
    id: number;
    name: string;
    email: string;
  }

  const [users, setUsers] = useState<User[]>([]);  // Estado inicial vacío
  const [presentAlert] = useIonAlert();  // Alerta para confirmación

  // Llamar al backend para obtener los usuarios cuando el componente se monta
  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || ''); // Guardar el rol del usuario en el estado
    fetchUsers();  // Llama a la función para obtener los usuarios
    // Comprobar si necesitamos recargar los usuarios después de añadir un nuevo usuario
    if (location.state?.reload) {
      fetchUsers();  // Volver a cargar los usuarios
      history.replace({ ...location, state: {} });  // Limpiar el estado de recarga en `history`
    }
  }, [location.state]);

  const fetchUsers = async () => {
    try {
      // Obtener el token de acceso del localStorage
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);  // Actualiza el estado con los usuarios obtenidos
      } else {
        console.error(t('fetch_error'));
      }
    } catch (error) {
      console.error(t('network_error'), error);
    }
  };


  // Función para manejar la eliminación del usuario
  const handleDelete = async (userId: number) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error(t('no_token'));
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/delete/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        console.error(`Error en la eliminación del usuario: ${response.statusText}`);
      }
    } catch (error) {
      console.error(t('network_error'), error);
    }
  };

  // Función para abrir el diálogo de eliminación
  const openDeleteDialog = (userId: number) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmDelete = () => {
    if (selectedUserId !== null) {
      handleDelete(selectedUserId);
    }
    setDeleteDialogOpen(false);
  };



  const handleEdit = (userId: number) => {
    history.push({
      pathname: `/admin/users/modify`,
      state: { userId },  // Asegúrate de que userId se pase correctamente
    });
  };

  const handleAddUser = () => {
    history.push(`/admin/users/add`);
  };

  const handleAssign = (userId: number) => {
    history.push({
      pathname: `/admin/users/assign`,
      state: { userId }, // Pasar el userId
    });
  };

  const handleUserInformation = (userId: number) => {
    history.push({
      pathname: `/admin/users/details`,
      state: { userId, showPlanSection: false },
    });
  };


  return (
    <Box sx={{ backgroundColor: '#f5f5f5', maxHeight: '100vh', marginTop: '16%' }}>
      {/* Header */}
      <Header title={t('users')} />

      <Container sx={{ mt: 10, paddingBottom: '18%' }}>
        {/* Listado de usuarios */}
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} key={user.id}>
              <Card
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)',
                  },
                }}
                onClick={() => handleUserInformation(user.id)}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0px',
                  }}
                >
                  <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1em' }}>
                    {user.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: '7px' }}>
                    {/* Botón de asignar, visible para roles entrenador, nutricionista y administrador */}
                    {['entrenador', 'nutricionista', 'administrador'].includes(userRole) && (
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAssign(user.id);
                        }}
                        sx={{
                          border: '1px solid #9C27B0',
                          backgroundColor: '#FFFFFF',
                          color: '#9C27B0',
                          borderRadius: '5px',
                          padding: '4px',
                          fontSize: '0.8em',
                          zIndex: 3,
                          '&:hover': {
                            backgroundColor: '#f3f3f3',
                          },
                        }}
                      >
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                    )}

                    {/* Botón de editar, visible solo para rol de administrador */}
                    {userRole === 'administrador' && (
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(user.id);
                        }}
                        sx={{
                          border: '1px solid #000',
                          backgroundColor: '#FFFFFF',
                          color: '#000',
                          borderRadius: '5px',
                          padding: '4px',
                          zIndex: 3,
                          fontSize: '0.8em',
                          '&:hover': {
                            backgroundColor: '#f3f3f3',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}

                    {/* Botón de eliminar, visible solo para rol de administrador */}
                    {userRole === 'administrador' && (
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          openDeleteDialog(user.id);
                        }}
                        sx={{
                          border: '1px solid #FF0000',
                          backgroundColor: '#FFFFFF',
                          color: '#FF0000',
                          borderRadius: '5px',
                          padding: '4px',
                          zIndex: 3,
                          fontSize: '0.8em',
                          '&:hover': {
                            backgroundColor: '#f3f3f3',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>


        {/* Botón flotante para añadir un nuevo usuario */}
        <Fab
          onClick={handleAddUser}
          sx={{
            position: 'fixed',
            bottom: '10%',
            right: '5%',
            backgroundColor: '#FFFFFF',
            color: '#000',
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '2px solid #000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <Add sx={{ fontSize: 24 }} />
        </Fab>
      </Container>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {t('confirm_delete')}
          <IconButton
            edge="end"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#888' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{t('delete_message')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#555' }}>
            {t('cancel')}
          </Button>
          <Button onClick={confirmDelete} sx={{ color: '#FF0000' }}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Users;
