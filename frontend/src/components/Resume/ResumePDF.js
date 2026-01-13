import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link, Font } from '@react-pdf/renderer';
import { BASE_URL } from '../../redux/config';

// Register a nice font if possible, otherwise use standard Helvetica
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB', // Indigo/Blue like the site theme
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular mask
    marginLeft: 20,
    objectFit: 'cover',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
    textTransform: 'uppercase',
    color: '#111827',
  },
  title: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: 600,
  },
  contactInfo: {
    fontSize: 10,
    color: '#6B7280',
    flexDirection: 'column',
    gap: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2563EB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bioConfig: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
    color: '#374151',
  },
  experienceItem: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
  },
  position: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#374151',
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  educationItem: {
    marginBottom: 8,
  },
  school: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
  },
  degree: {
    fontSize: 10,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

const ResumePDF = ({ profileData }) => {
  const { userId, bio, currentPost, pastWork, education } = profileData;

  const profileImageUrl = userId?.profilePicture && userId.profilePicture !== 'default.jpg'
    ? `${BASE_URL}/${userId.profilePicture}`
    : null; // You might want to provide a publicly accessible URL for a default avatar if needed

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{userId?.name || 'User Name'}</Text>
            <Text style={styles.title}>{currentPost || 'Professional'}</Text>
            <View style={styles.contactInfo}>
              <Text>{userId?.email}</Text>
              <Text>linkedin.com/in/{userId?.username}</Text>
            </View>
          </View>
          
          {profileImageUrl && (
            <Image 
              src={profileImageUrl}
              style={styles.profileImage}
            />
          )}
        </View>

        {/* Profile Summary */}
        {bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.bioConfig}>{bio}</Text>
          </View>
        )}

        {/* Work Experience */}
        {pastWork && pastWork.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {pastWork.map((work, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <Text style={styles.company}>{work.company}</Text>
                  <Text style={styles.date}>{work.years}</Text>
                </View>
                <Text style={styles.position}>{work.position}</Text>
                {/* Add description if available in future data */}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.school}>{edu.school}</Text>
                <Text style={styles.degree}>
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by CarrerNet on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default ResumePDF;
