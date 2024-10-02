import React, { useState, useRef } from 'react';
import {
    IonPage,
    IonHeader,
    IonActionSheet,
    IonTitle,
    IonContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonIcon,
    IonModal,
    IonToast,
    IonText
} from '@ionic/react';
import { cameraOutline, eyeOffOutline, eyeOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import './EditPerfil.css'; // Crea un archivo CSS para personalizar los estilos
import { useHistory, useLocation } from 'react-router-dom';  // Hook para redirigir
import Header from '../../Header/Header';  // Importamos el componente Header



const EditProfilePage: React.FC = () => {
    const history = useHistory();  // Hook para la redirección
    const location = useLocation();

    // Accedemos a los datos que fueron pasados desde la página de perfil
    const { userData } = (location.state || {
        userData: {},
        trainingData: [],
        weightData: [],
    }) as { userData: any };

    // Estado local para manejar los datos editados (inicializado con userData)
    const [profileData, setProfileData] = useState({
        firstName: userData?.username?.split(' ')[0] || '',  // Verifica que username exista antes de usar split
        lastName: userData?.username?.split(' ')[1] || '',   // Verifica que username exista antes de usar split
        currentWeight: userData.currentWeight || 0,
        weightGoal: userData.weightGoal || '',
        activityLevel: userData.activityLevel || '',
        trainingFrequency: userData.trainingFrequency || 0,
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150'); // Imagen de perfil
    const [showPasswordModal, setShowPasswordModal] = useState(false);  // Estado para controlar el modal de cambio de contraseña
    const [showToast, setShowToast] = useState(false); // Estado para mostrar el toast de confirmación
    const [showActionSheet, setShowActionSheet] = useState(false);  // Estado para controlar el ActionSheet
    // Referencia al input de tipo file
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados para manejar la visibilidad de las contraseñas
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    // Función para manejar el guardado de los cambios
    const handleSave = () => {
        console.log('Datos guardados:', profileData);
        history.push('/profile'); // Redirigir al perfil después de guardar
    };


    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(password);
    };

    const handleChangePassword = () => {
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        // Validación de contraseña actual
        if (!passwords.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        // Validación de nueva contraseña
        if (!passwords.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (!validatePassword(passwords.newPassword)) {
            newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un signo';
        }

        // Validación de confirmación de contraseña
        if (passwords.confirmPassword !== passwords.newPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);

        // Si no hay errores, se procede con el cambio de contraseña
        if (!newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword) {
            console.log('Contraseña cambiada:', passwords);
            setShowPasswordModal(false); // Cerrar el modal
        }
    };

    // Manejar la subida de fotos
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string); // Actualizamos la imagen con la vista previa
            };
            reader.readAsDataURL(file); // Leemos el archivo seleccionado
        }
    };

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            console.log('Subir una foto');
            fileInputRef.current?.click();
        } else if (option === 'take') {
            console.log('Hacer una foto');
            // Lógica para hacer una foto
        } else if (option === 'delete') {
            console.log('Eliminar foto');
            setProfilePicture('https://via.placeholder.com/150');
        }
    };


    return (
        <IonPage>
            <Header title="Edit profile" />

            <IonContent>
                <IonGrid>
                    <IonRow className="ion-text-center" style={{ margin: '0px' }}>
                        <IonCol size="12">
                            <IonAvatar
                                className="custom-avatar"
                                style={{
                                    width: '150px',   // Ancho fijo
                                    height: '150px',  // Alto fijo
                                    border: '2px solid var(--color-verde-lima)',
                                    borderRadius: '50%', // Garantiza que el contenedor sea siempre circular
                                    overflow: 'hidden', // Asegura que la imagen no se desborde del contenedor redondeado
                                    marginBottom: '0px',
                                }}
                            >
                                <img
                                    src={profilePicture}
                                    alt="Foto de perfil"
                                    style={{
                                        width: '100%',        // La imagen debe ocupar todo el ancho del contenedor
                                        height: '100%',       // La imagen debe ocupar todo el alto del contenedor
                                        objectFit: 'cover',   // Asegura que la imagen se ajuste sin distorsionar su proporción
                                        borderRadius: '50%',  // Mantiene la imagen en forma circular
                                    }}
                                />
                            </IonAvatar>
                            <IonButton
                                style={{
                                    color: 'var(--color-verde-lima)',
                                    margin: '0px',
                                }}
                                fill="clear"
                                onClick={() => setShowActionSheet(true)} // Muestra el ActionSheet al hacer clic
                            >
                                <IonIcon icon={cameraOutline} /> Change photo
                            </IonButton>
                        </IonCol>
                    </IonRow>


                    {/* ActionSheet para seleccionar la opción de la foto */}
                    <IonActionSheet
                        isOpen={showActionSheet}
                        onDidDismiss={() => setShowActionSheet(false)}
                        buttons={[
                            {
                                text: 'Subir una foto',
                                icon: imageOutline,
                                handler: () => handlePhotoOption('upload'),
                            },
                            {
                                text: 'Hacer una foto',
                                icon: cameraOutline,
                                handler: () => handlePhotoOption('take'),
                            },
                            {
                                text: 'Eliminar foto',
                                role: 'destructive',
                                icon: trashOutline,
                                handler: () => handlePhotoOption('delete'),
                            },
                            {
                                text: 'Cancelar',
                                icon: closeOutline,
                                role: 'cancel',
                            },
                        ]}
                    />

                    {/* Input de tipo file oculto */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef} // Referencia para hacer clic desde JS
                        style={{ display: 'none' }} // Ocultamos el input
                        onChange={handleFileChange} // Manejar el cambio de archivo
                    />

                    {/* Divider */}
                    <hr style={{ margin: '0px', height: '1px', backgroundColor: '#d1d1d6' }} />

                    {/* Información Personal */}
                    <IonRow>
                        <IonCol size="12">
                            <h3>Personal Information</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Name</IonLabel>
                                <IonInput
                                    value={profileData.firstName}
                                    style={{ textIndent: '4%' }}
                                    onIonChange={(e: { detail: { value: string } }) => setProfileData({ ...profileData, firstName: e.detail.value! })}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Last name</IonLabel>
                                <IonInput value={profileData.lastName} style={{ textIndent: '4%' }} onIonChange={(e: { detail: { value: string; }; }) => setProfileData({ ...profileData, lastName: e.detail.value! })}></IonInput>
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Current Weight (kg)</IonLabel>
                                <IonInput type="number" style={{ textIndent: '4%' }} value={profileData.currentWeight} onIonChange={(e: { detail: { value: string; }; }) => setProfileData({ ...profileData, currentWeight: parseFloat(e.detail.value!) })}></IonInput>
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonButton
                                expand="block"
                                fill="outline"
                                style={{
                                    color: 'var(--color-verde-lima)',
                                    '--border-color': 'var(--color-verde-lima)'
                                }}
                                onClick={() => setShowPasswordModal(true)}
                            >
                                Change password
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {/* Divider */}
                    <hr style={{ height: '1px', backgroundColor: '#d1d1d6' }} />

                    {/* Información Deportiva */}
                    <IonRow>
                        <IonCol size="12">
                            <h3>Sports Information</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Weight Target</IonLabel>
                                <IonSelect
                                    value={profileData.weightGoal}
                                    onIonChange={(e: { detail: { value: any; }; }) => setProfileData({ ...profileData, weightGoal: e.detail.value })}
                                    interface="popover"
                                    style={{ padding: '10px', height: '45px' }}  // Agregamos padding y altura para mejorar la presentación
                                >
                                    <IonSelectOption value="Perder peso">Lose weight</IonSelectOption>
                                    <IonSelectOption value="Ganar masa muscular">Gain muscle mass</IonSelectOption>
                                    <IonSelectOption value="Mantener el peso actual">Maintain current weight</IonSelectOption>
                                    <IonSelectOption value="Mejorar resistencia física">Improve physical resistance</IonSelectOption>
                                    <IonSelectOption value="Aumentar fuerza">Increase strength</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Activity Level</IonLabel>
                                <IonSelect
                                    value={profileData.activityLevel}
                                    onIonChange={(e: { detail: { value: any; }; }) => setProfileData({ ...profileData, activityLevel: e.detail.value })}
                                    interface="popover"
                                    style={{ padding: '10px', height: '45px' }}
                                >
                                    <IonSelectOption value="Sedentario">Sedentary</IonSelectOption>
                                    <IonSelectOption value="Ligera">Light</IonSelectOption>
                                    <IonSelectOption value="Moderada">Moderate</IonSelectOption>
                                    <IonSelectOption value="Intensa">Intense</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Training Frequency (days/week)</IonLabel>
                                <IonSelect
                                    value={profileData.trainingFrequency}
                                    onIonChange={(e: { detail: { value: string; }; }) => setProfileData({ ...profileData, trainingFrequency: parseInt(e.detail.value!) })}
                                    interface="popover"
                                    style={{ padding: '10px', height: '45px' }}
                                >
                                    <IonSelectOption value="1">1</IonSelectOption>
                                    <IonSelectOption value="2">2</IonSelectOption>
                                    <IonSelectOption value="3">3</IonSelectOption>
                                    <IonSelectOption value="4">4</IonSelectOption>
                                    <IonSelectOption value="5">5</IonSelectOption>
                                    <IonSelectOption value="6">6</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>
                    </IonRow>


                    {/* Botón para guardar cambios */}
                    <IonRow>
                        <IonCol size="12">
                            <IonButton
                                expand="block"
                                className="boton-verde"
                                style={{ marginBottom: '10%' }}
                                onClick={handleSave}
                            >
                                Save changes
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Modal para cambiar la contraseña */}
                <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)}>
                    <Header title="Change password" />
                    <IonContent>
                        <IonGrid>
                            {/* Campo de la contraseña actual */}
                            <IonRow>
                                <IonCol size="12">
                                    <IonItem lines="none" className={errors.currentPassword ? 'ion-invalid' : ''}>
                                        <IonLabel position="stacked">Current Password</IonLabel>
                                        <IonInput
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwords.currentPassword}
                                            style={{ textIndent: '4%' }}
                                            onIonChange={(e: { detail: { value: string; }; }) =>
                                                setPasswords({ ...passwords, currentPassword: e.detail.value! })
                                            }
                                        />
                                        <IonIcon
                                            icon={showCurrentPassword ? eyeOutline : eyeOffOutline}
                                            slot="end"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{
                                                cursor: 'pointer',
                                                position: 'absolute',
                                                right: '7%',
                                                top: '60%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10,
                                            }}
                                        />
                                    </IonItem>
                                    {errors.currentPassword && (
                                        <IonText color="danger" className="error-text">
                                            {errors.currentPassword}
                                        </IonText>
                                    )}
                                </IonCol>
                            </IonRow>

                            {/* Campo de nueva contraseña */}
                            <IonRow>
                                <IonCol size="12">
                                    <IonItem lines="none" className={errors.newPassword ? 'ion-invalid' : ''}>
                                        <IonLabel position="stacked">New Password</IonLabel>
                                        <IonInput
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwords.newPassword}
                                            style={{ textIndent: '4%' }}
                                            onIonChange={(e: { detail: { value: string; }; }) =>
                                                setPasswords({ ...passwords, newPassword: e.detail.value! })
                                            }
                                        />
                                        <IonIcon
                                            icon={showNewPassword ? eyeOutline : eyeOffOutline}
                                            slot="end"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                cursor: 'pointer',
                                                position: 'absolute',
                                                right: '7%',
                                                top: '60%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10,
                                            }}
                                        />
                                    </IonItem>
                                    {errors.newPassword && (
                                        <IonText color="danger" className="error-text">
                                            {errors.newPassword}
                                        </IonText>
                                    )}
                                </IonCol>
                            </IonRow>

                            {/* Confirmación de nueva contraseña */}
                            <IonRow>
                                <IonCol size="12">
                                    <IonItem lines="none" className={errors.confirmPassword ? 'ion-invalid' : ''}>
                                        <IonLabel position="stacked">Confirm new Password</IonLabel>
                                        <IonInput
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwords.confirmPassword}
                                            style={{ textIndent: '4%' }}
                                            onIonChange={(e: { detail: { value: string; }; }) =>
                                                setPasswords({ ...passwords, confirmPassword: e.detail.value! })
                                            }
                                        />
                                        <IonIcon
                                            icon={showConfirmPassword ? eyeOutline : eyeOffOutline}
                                            slot="end"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                cursor: 'pointer',
                                                position: 'absolute',
                                                right: '7%',
                                                top: '60%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 10,
                                            }}
                                        />
                                    </IonItem>
                                    {errors.confirmPassword && (
                                        <IonText color="danger" className="error-text">
                                            {errors.confirmPassword}
                                        </IonText>
                                    )}
                                </IonCol>
                            </IonRow>

                            {/* Botones de confirmar y cancelar en la misma fila */}
                            <IonRow className="ion-justify-content-center">
                                <IonCol size="5">
                                    <IonButton
                                        expand="block"
                                        fill="outline"
                                        className="cancel-button"  // Aplicamos una clase CSS personalizada para el botón Cancelar
                                        onClick={() => setShowPasswordModal(false)}
                                    >
                                        Cancel
                                    </IonButton>
                                </IonCol>
                                <IonCol size="5">
                                    <IonButton
                                        expand="block"
                                        className="confirm-button"  // Aplicamos una clase CSS personalizada para el botón Confirmar
                                        onClick={handleChangePassword}
                                    >
                                        Confirmar
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonContent>
                </IonModal>


                {/* Toast de confirmación */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Contraseña cambiada exitosamente"
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditProfilePage;