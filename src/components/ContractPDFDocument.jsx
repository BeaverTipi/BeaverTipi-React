import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  text: { fontSize: 12, marginBottom: 4 },
});

const ContractPDFDocument = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>주택임대차표준계약서</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>임대인: {formData.lessorName} / {formData.lessorPhone}</Text>
        <Text style={styles.text}>임차인: {formData.lesseeName} / {formData.lesseePhone}</Text>
        <Text style={styles.text}>계약형태: {formData.contractType}</Text>
        <Text style={styles.text}>보증금: ₩{formData.deposit}</Text>
        <Text style={styles.text}>월세: ₩{formData.monthlyRent}</Text>
        <Text style={styles.text}>계약기간: {formData.startDate} ~ {formData.endDate}</Text>
        <Text style={styles.text}>특약사항: {formData.specialTerms}</Text>
      </View>
    </Page>
  </Document>
);

export default ContractPDFDocument;
