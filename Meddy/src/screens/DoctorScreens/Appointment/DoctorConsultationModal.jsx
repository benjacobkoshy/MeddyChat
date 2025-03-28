import { StyleSheet, View, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';
import React, { useContext, useState } from 'react';
import { Button, Layout, Text, useTheme, Input, Spinner } from '@ui-kitten/components';
import DoctorConsultationTopBarNaviagtion from '../../../navigation/Doctor/Appointment/DoctorConsultationTopBarNaviagtion';
import { AuthContext } from '../../../context/AuthContext';
import Snackbar from 'react-native-snackbar';

export default function DoctorConsultationModal({ navigation, route }) {
    const { width } = useWindowDimensions();
    const { appointment, role } = route.params;
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const theme = useTheme();
    const [diagnosis, setDiagnosis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {fetchWithAuth} = useContext(AuthContext);

    const handleCompleteConsultation = async () => {
        setConfirmationModalVisible(false);
        if(diagnosis===''){
            Snackbar.show({
                text: 'Enter the diagnosis.',
                duration: Snackbar.LENGTH_SHORT,
                textColor: '#FFFFFF',
                backgroundColor: '#F44336',
              });
              return
        }
        try{
            setIsLoading(true);
            const response = await fetchWithAuth(`appointment/complete-consultation/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: appointment.id,
                    diagnosis: diagnosis,
                })
            });            
            if (!response.ok) {
                throw new Error("Failed to complete consultation.");
            }            
            if(response.ok){
                console.log("Diagnosis",diagnosis);
                console.log("Consultation completed successfully");
                Snackbar.show({
                    text: 'Consultation completed successfully.',
                    duration: Snackbar.LENGTH_SHORT,
                    textColor: '#FFFFFF',
                    backgroundColor: '#4CAF50',
                  });
                navigation.goBack();
            }
        }catch(error){
            console.log(error)
        }finally{
            setIsLoading(false);
        }
        // console.log("Diagnosis",diagnosis);
        // console.log("Consultation completed successfully");
        // navigation.goBack();
    };

    if (isLoading) return <Layout style={styles.loader}><Spinner size='giant' /></Layout>;


    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={true}
            onRequestClose={() => navigation.goBack()}
        >
            <Layout style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]} level='1'>
                <View style={styles.contentContainer}>
                    <DoctorConsultationTopBarNaviagtion 
                        appointment={appointment} 
                        role={role} 
                        style={styles.topBar}
                    />
                </View>

                {/* Fixed Footer with Buttons */}
                <View style={[styles.footer, { 
                    backgroundColor: theme['background-basic-color-1'],
                    borderTopColor: theme['border-basic-color-3'],
                }]}>
                    <Button
                        appearance='outline'
                        status='basic'
                        onPress={() => navigation.goBack()}
                        style={[styles.button, { flex: width > 400 ? 0.48 : 1 }]}
                    >
                        Close
                    </Button>
                    <Button
                        appearance='filled'
                        status='success'
                        onPress={() => setConfirmationModalVisible(true)}
                        style={[styles.button, { flex: width > 400 ? 0.48 : 1 }]}
                    >
                        Complete
                    </Button>
                </View>

                {/* Confirmation Modal */}
                <Modal
                    visible={confirmationModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setConfirmationModalVisible(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setConfirmationModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <Layout 
                                style={[styles.modalCard, { 
                                    backgroundColor: theme['background-basic-color-2'],
                                    width: width * 0.85
                                }]}
                                level='2'
                            >
                                <Text 
                                    category='h6' 
                                    style={[styles.modalTitle, { color: theme['text-basic-color'] }]}
                                >
                                    Confirm Completion
                                </Text>
                                <Text 
                                    category='p1' 
                                    style={[styles.modalText, { color: theme['text-basic-color'] }]}
                                >
                                    Are you sure you want to complete the consultation?
                                </Text>

                                <View style={styles.inputContainer}>

                                    <Input
                                        value={diagnosis}
                                        onChangeText={setDiagnosis}
                                        style={styles.input}
                                        placeholder='Enter the diagnosis'
                                    />

                                </View>

                                <View style={styles.modalActions}>
                                    <Button
                                        appearance='ghost'
                                        status='basic'
                                        onPress={() => setConfirmationModalVisible(false)}
                                        style={styles.modalButton}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        appearance='filled'
                                        status='success'
                                        onPress={handleCompleteConsultation}
                                        style={styles.modalButton}
                                    >
                                        Confirm
                                    </Button>
                                </View>
                            </Layout>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Layout>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    topBar: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        paddingBottom: 24,
    },
    button: {
        marginHorizontal: 4,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 16,
    },
    modalCard: {
        borderRadius: 8,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: 'bold',
    },
    modalText: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        minWidth: 100,
    },
    inputContainer: {
        padding: 5,
    },
    input: {
        color: '#fff',
        borderColor: "#fff",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
  
});