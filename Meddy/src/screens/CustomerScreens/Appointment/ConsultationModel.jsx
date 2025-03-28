import { StyleSheet, Text, View, Modal, Button } from 'react-native'
import React from 'react'
import ConsultationTopBarNavigation from '../../../navigation/Customer/Appointment/ConsultationTopBarNavigation'

export default function ConsultationModel({ navigation, route }) {
  const { appointment, role } = route.params;

  return (
    <Modal 
      animationType="slide" 
      transparent={false} 
      visible={true} 
      onRequestClose={() => navigation.goBack()}  // Handles Android back button
    >
      <ConsultationTopBarNavigation appointment={appointment} role={role} />
      {/* <Button title="Close" onPress={() => navigation.goBack()} />   */}
    </Modal>
  )
}

const styles = StyleSheet.create({})
