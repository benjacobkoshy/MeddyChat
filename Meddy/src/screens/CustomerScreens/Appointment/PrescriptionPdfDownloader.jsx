import React from 'react';
import { View, Image, Alert, Platform, StyleSheet, ScrollView } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { Layout, Text, Button, Icon } from '@ui-kitten/components';

const GeneratePrescriptionPDF = ({ route }) => {
    const { appointmentData } = route.params;

    if (!appointmentData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: No appointment data found.</Text>
            </View>
        );
    }

    const createPDF = async () => {
        const htmlContent = `
        <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 10px; 
                        font-size: 12px; 
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 1px solid #000; 
                        padding-bottom: 5px; 
                        margin-bottom: 10px; 
                    }
                    .hospital-logo { 
                        width: 60px; 
                        height: 60px; 
                    }
                    h1, h2, h3 { 
                        font-size: 14px; 
                        margin: 5px 0; 
                    }
                    .section { 
                        margin-bottom: 10px; 
                        padding: 5px; 
                        border: 1px solid #ddd; 
                        border-radius: 3px; 
                        background-color: #f9f9f9; 
                    }
                    p { 
                        margin: 2px 0; 
                    }
                    .footer { 
                        text-align: center; 
                        font-size: 10px; 
                        color: #777; 
                        border-top: 1px solid #000; 
                        padding-top: 5px; 
                    }
                    ul {
                        padding-left: 15px;
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img class="hospital-logo" src="https://img.freepik.com/free-vector/online-doctor-concept_52683-37585.jpg?t=st=1740209879~exp=1740213479~hmac=b9994c4a3c43454bf52d16c9529e2df218ab9533d3ee9bb32cbeaf5826887ad6&w=740" alt="Hospital Logo">
                    <h1>Meddy Chat Hospital</h1>
                    <p>123 Medical Street, Texas, USA | Email: meddychat@gmail.com | Phone: +1 123 456 7890</p>
                </div>
                
                <h2>Medical Prescription</h2>
        
                <div class="section">
                    <h3>Doctor Information</h3>
                    <p><strong>Name:</strong> Dr. ${appointmentData.doctor.name}</p>
                    <p><strong>Specialization:</strong> ${appointmentData.doctor.specialization}</p>
                </div>
        
                <div class="section">
                    <h3>Patient Information</h3>
                    <p><strong>Name:</strong> ${appointmentData.patient.name}</p>
                    <p><strong>Age:</strong> ${appointmentData.patient.patient_age}</p>
                    <p><strong>Contact:</strong> ${appointmentData.patient.phone_number}</p>
                </div>
        
                <div class="section">
                    <h3>Medical Details</h3>
                    <p><strong>Symptoms:</strong> ${appointmentData.symptoms}</p>
                    <p><strong>Diagnosis:</strong> ${appointmentData.diagnosis || 'Not provided yet'}</p>
                    <p><strong>Prescription:</strong></p>
                    <ul>
                        ${appointmentData.prescriptions && appointmentData.prescriptions.length > 0 
                            ? appointmentData.prescriptions.map(prescription => 
                                `<li>${prescription.product_name} - ${prescription.dosage || 'No dosage specified'}</li>`
                            ).join('') 
                            : '<li>Not provided yet</li>'
                        }
                    </ul>
                </div>
        
                <div class="footer">
                    <p>Issued by Dr. ${appointmentData.doctor.name} - Meddy Chat Hospital</p>
                    <p>Contact: meddychat@gmail.com | Website: www.meddychat.com</p>
                    <p><em>This is an electronically generated prescription and does not require a signature.</em></p>
                </div>
            </body>
        </html>
        `;
        
        const options = {
            html: htmlContent,
            fileName: `Prescription_${appointmentData.id}`,
            directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);

            if (file.filePath) {
                Alert.alert(
                    "Success",
                    `PDF saved at ${file.filePath}`,
                    [{ text: "Open", onPress: () => openPDF(file.filePath) }]
                );
            }
        } catch (error) {
            console.error('PDF generation error:', error);
        }
    };

    const openPDF = (filePath) => {
        FileViewer.open(filePath)
            .then(() => console.log("PDF opened"))
            .catch(error => console.error("Error opening PDF", error));
    };

    return (
        <Layout style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <Text category="h5">Doctor: {appointmentData.doctor.name}</Text>
                    <Text category="p1">Specialization: {appointmentData.doctor.specialization}</Text>
                    <Text category="p2">Experience: {appointmentData.doctor.experience_years} years</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text category="h5">Patient: {appointmentData.patient.name}</Text>
                    <Text category="p1">Symptoms: {appointmentData.symptoms}</Text>
                </View>

                <Button 
                    style={styles.button} 
                    accessoryRight={<Icon name="file-text-outline" fill="white"/>}
                    onPress={createPDF}
                >
                    Download Prescription
                </Button>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBox: {
        width: '90%',
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: .1,
    },
    button: {
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: '#6200ea',
        borderColor: 'transparent',
        paddingVertical: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default GeneratePrescriptionPDF;