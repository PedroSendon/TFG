import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const PendingUsers: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext);
  const location = useLocation<{ reload?: boolean }>();

  interface User {
    id: number;
    name: string;
    email: string;
    status: string;
    profile_photo: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchUsers();
    }
  }, [userRole, location.state]);

  const fetchUserRole = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/user/role/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        console.error(t('fetch_error'));
      }
    } catch (error) {
      console.error(t('network_error'), error);
    }
  };

  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const endpoint =
        userRole === 'nutricionista'
          ? 'http://127.0.0.1:8000/api/user/unassigned/nutrition/'
          : 'http://127.0.0.1:8000/api/user/unassigned/training/';

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error(t('fetch_error'));
      }
    } catch (error) {
      console.error(t('network_error'), error);
    }
  };

  const handleUserInformation = (userId: number) => {
    history.push({
      pathname: `/admin/users/details`,
      state: { userId, showPlanSection: true },
    });
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', height: '95vh', marginTop: '16%' }}>
      <Header title={t('users')} />
      <Container sx={{ mt: 10, paddingBottom: '18%' }}>
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} key={user.id}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
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
                  cursor: 'pointer',
                }}
                onClick={() => handleUserInformation(user.id)}
              >
                <Avatar
                  src={user.profile_photo || "/path/to/default-avatar.png"}
                  alt={`${user.name}'s profile photo`}
                  sx={{
                    width: 50,
                    height: 50,
                    marginRight: 2,
                    backgroundColor: '#f0f0f0',
                  }}
                />
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 0,
                    width: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: '1em',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#555555',
                      fontSize: '0.875em',
                      marginTop: '4px',
                    }}
                  >
                    {user.email}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#FF5733',
                      fontSize: '0.875em',
                      fontWeight: '500',
                      marginTop: '8px',
                    }}
                  >
                    {user.status === 'awaiting_assignment' ? 'Falta por asignar plan' : 'Plan asignado'}
                  </Typography>
                </CardContent>
                <Box
                  sx={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.75em',
                      color: '#888888',
                      fontWeight: '500',
                      textAlign: 'center',
                      marginRight: 1,
                    }}
                  >
                    Ver más
                  </Typography>
                  <ArrowForwardIos fontSize="small" sx={{ color: '#888888' }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PendingUsers;