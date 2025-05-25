import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Appbar, Card } from "react-native-paper";

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.heading}>
              Privacy Policy for Box Cricket Booking App
            </Text>
            {/* <Text style={styles.date}>Effective Date: [Insert Date]</Text> */}

            <Text style={styles.text}>
              Thank you for choosing to be part of our community at Box Cricket.
              We are committed to protecting your personal information and your
              right to privacy.
              {"\n\n"}
              This privacy policy applies to all information collected through
              our mobile application ("BOX CRICKET"), and/or any related
              services, sales, marketing or events.
            </Text>

            <Text style={styles.subheading}>1. Information We Collect</Text>
            <Text style={styles.text}>
              We collect personal information that you voluntarily provide to us
              when registering or using the App, including:
              {"\n\n"}• Name{"\n"}• Email address{"\n"}• Phone number{"\n"}•
              Booking details (such as date, time, and location of bookings)
              {"\n\n"}
              We may also collect limited device information for the purpose of
              analytics and improving user experience.
            </Text>

            <Text style={styles.subheading}>
              2. How We Use Your Information
            </Text>
            <Text style={styles.text}>
              We use the collected information for the following purposes:
              {"\n\n"}• To facilitate and manage box cricket bookings.
              {"\n"}• To communicate important updates related to your booking.
              {"\n"}• To improve the functionality and usability of our App.
              {"\n"}• To respond to user inquiries and provide customer support.
            </Text>

            <Text style={styles.subheading}>3. Sharing Your Information</Text>
            <Text style={styles.text}>
              We do not share your personal information with third parties
              except in the following cases:
              {"\n\n"}• With your consent.
              {"\n"}• For legal reasons (e.g., to comply with a subpoena or
              other legal processes).
            </Text>

            <Text style={styles.subheading}>4. Data Security</Text>
            <Text style={styles.text}>
              We implement appropriate technical and organizational security
              measures to protect your personal data.
            </Text>

            <Text style={styles.subheading}>5. Your Rights</Text>
            <Text style={styles.text}>
              You have the right to:
              {"\n\n"}• Access and review your personal data.
              {"\n"}• Request correction or deletion of your data.
              {"\n"}• Withdraw your consent at any time (where applicable).
            </Text>

            <Text style={styles.subheading}>6. Children’s Privacy</Text>
            <Text style={styles.text}>
              Our App is not intended for children under the age of 13, and we
              do not knowingly collect data from children.
            </Text>

            <Text style={styles.subheading}>7. Changes to This Policy</Text>
            <Text style={styles.text}>
              We may update this privacy policy from time to time. We encourage
              you to review it frequently.
            </Text>

            <Text style={styles.subheading}>8. Contact Us</Text>
            <Text style={styles.text}>
              If you have any questions or concerns about this policy, please
              contact us:
              {"\n\n"}📧 Email: support@[yourdomain].com
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1E88E5",
  },
  date: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
    color: "#666",
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
    color: "#333",
  },
  text: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
