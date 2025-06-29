import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { useLanguage } from "../contexts/LanguageContext";

interface DemoScreenProps {
  onNavigateToProfile: () => void;
  onNavigateToEvents: () => void;
}

export default function DemoScreen({
  onNavigateToProfile,
  onNavigateToEvents,
}: DemoScreenProps) {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎉 Freeday Demo</Text>
          <Text style={styles.subtitle}>{t("demo.subtitle")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("demo.language")}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
            <Text style={styles.buttonText}>
              {language === "en"
                ? "🇻🇳 Switch to Vietnamese"
                : "🇺🇸 Switch to English"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("demo.features")}</Text>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={onNavigateToEvents}
          >
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{t("demo.exploreEvents")}</Text>
              <Text style={styles.featureDescription}>
                {t("demo.exploreEventsDesc")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={onNavigateToProfile}
          >
            <Text style={styles.featureIcon}>👤</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>
                {t("demo.profileFeatures")}
              </Text>
              <Text style={styles.featureDescription}>
                {t("demo.profileFeaturesDesc")}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.featureButton}>
            <Text style={styles.featureIcon}>❤️</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{t("demo.saveEvents")}</Text>
              <Text style={styles.featureDescription}>
                {t("demo.saveEventsDesc")}
              </Text>
            </View>
          </View>

          <View style={styles.featureButton}>
            <Text style={styles.featureIcon}>🎨</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{t("demo.themeMode")}</Text>
              <Text style={styles.featureDescription}>
                {t("demo.themeModeDesc")}
              </Text>
            </View>
          </View>

          <View style={styles.featureButton}>
            <Text style={styles.featureIcon}>🔔</Text>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{t("demo.notifications")}</Text>
              <Text style={styles.featureDescription}>
                {t("demo.notificationsDesc")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("demo.instructions")}</Text>
          <Text style={styles.instructionText}>1. {t("demo.step1")}</Text>
          <Text style={styles.instructionText}>2. {t("demo.step2")}</Text>
          <Text style={styles.instructionText}>3. {t("demo.step3")}</Text>
          <Text style={styles.instructionText}>4. {t("demo.step4")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize["3xl"],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  featureIcon: {
    fontSize: theme.fontSize["2xl"],
    marginRight: theme.spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  instructionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
});
