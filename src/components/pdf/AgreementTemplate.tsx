// src/components/pdf/AgreementTemplate.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Registrar la fuente personalizada para la firma.
// Es importante usar una URL de fuente que permita el acceso CORS.
Font.register({
  family: 'Eyesome Script',
  src: 'https://fonts.gstatic.com/s/eyesome/v1/AlZ_mu-3oN_2E4JeS3-7sQ.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: '25mm',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#333',
    position: 'relative'
  },
  // Formas decorativas
  topShape1: {
    position: 'absolute',
    top: -80,
    right: -120,
    width: 350,
    height: 350,
    backgroundColor: '#218838',
    transform: 'rotate(20deg)',
    borderRadius: '45%',
    opacity: 0.9,
  },
  topShape2: {
    position: 'absolute',
    top: -90,
    right: -100,
    width: 350,
    height: 350,
    backgroundColor: '#28a745',
    transform: 'rotate(25deg)',
    borderRadius: '50%',
  },
  bottomShape1: {
    position: 'absolute',
    bottom: -80,
    right: 200,
    width: 300,
    height: 200,
    backgroundColor: '#28a745',
    transform: 'rotate(55deg)'
  },
  bottomShape2: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 250,
    height: 200,
    backgroundColor: '#1d5a2d',
    transform: 'rotate(35deg)'
  },
  logo: {
    width: 80,
    marginBottom: '15mm',
  },
  headerContainer: {
    color: '#1d5a2d',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  hr: {
    height: 2,
    backgroundColor: '#1d5a2d',
    margin: '15mm 0',
  },
  // Tabla de información
  table: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: '15mm',
    fontSize: 10,
  },
  tableCol: {
    flex: 1,
  },
  tableHeader: {
    color: '#1d5a2d',
    paddingBottom: 5,
  },
  tableCell: {
    paddingTop: 5,
  },
  // Contenido principal
  sectionTitle: {
    fontSize: 12,
    color: '#1d5a2d',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginBottom: '10mm',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#555',
    marginBottom: '10mm'
  },
  boldGreen: {
    color: '#218838',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  listItem: {
    fontSize: 10,
    color: '#555',
    marginTop: 8,
  },
  // Firma
  signatureContainer: {
    position: 'absolute',
    bottom: '30mm',
    left: '25mm',
    right: '25mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
  },
  signatureBlock: {
    width: '40%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginTop: 5,
    paddingTop: 45
  },
  signatureFont: {
    fontFamily: 'Eyesome Script',
    fontSize: 40,
    lineHeight: 1,
    marginTop: '-10px'
  },
});

interface AgreementDocumentProps {
  clientName: string;
  date: string;
}

export const AgreementDocument: React.FC<AgreementDocumentProps> = ({ clientName, date }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topShape1} fixed />
        <View style={styles.topShape2} fixed />
        <View style={styles.bottomShape1} fixed />
        <View style={styles.bottomShape2} fixed />
        
        <View>
          <Image
            style={styles.logo}
            src="https://worldvectorlogo.com/logo/fiverr-2"
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>RIGHTS OF USE</Text>
            <Text style={styles.headerTitle}>TRANSFER AGREEMENT</Text>
            <Text style={styles.headerSubtitle}>FIVERR INSTRUMENTAL REMAKE SERVICE</Text>
          </View>
          
          <View style={styles.hr} />
          
          <View style={styles.table}>
              <View style={styles.tableCol}><Text style={styles.tableHeader}>Services from</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeader}>Date</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeader}>Contact</Text></View>
          </View>
          <View style={styles.table}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>@Danodals</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{date}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>danodalbeats@gmail.com</Text></View>
          </View>
          
          <Text style={styles.sectionTitle}>Contrato de servicios digitales</Text>
          
          <Text style={styles.paragraph}>
            Rights of Use Transfer Agreement (Fiverr Remake Service @Danodals) Sebastián Mestre, with Fiverr username @Danodals, agree to transfer all exclusive usage rights of the music(s), instrumental(s), or beat(s) produced to <Text style={styles.boldGreen}>@{clientName}</Text> under the following terms:
          </Text>

          <View>
            <Text style={styles.listItem}>• Purpose: This agreement aims to transfer the exclusive usage rights of the beat/instrumental created by Sebastián Mestre.</Text>
            <Text style={styles.listItem}>• Scope of Transfer: The client acquires full commercial usage rights over the work, including the right to modify, distribute, and sell it without restrictions, while respecting the moral rights of the author.</Text>
            <Text style={styles.listItem}>• Exclusivity Guarantee: The beat/instrumental transferred is 100% exclusive to the client, ensuring it will not be resold or distributed to third parties by Sebastián Mestre.</Text>
            <Text style={styles.listItem}>• Payment and Contract Completion: Upon full payment of the project on Fiverr, the client receives complete usage rights of the work.</Text>
            <Text style={styles.listItem}>• Duration: The transfer of rights is indefinite, with no time or territory restrictions.</Text>
          </View>
          
          <View style={styles.signatureContainer} fixed>
              <View style={styles.signatureBlock}>
                  <Text style={styles.signatureFont}>Dano</Text>
                  <View style={styles.signatureLine} />
                  <Text>Danodals Beats</Text>
              </View>
              <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text>CLIENT'S SIGNATURE</Text>
              </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
