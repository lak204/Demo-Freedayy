import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { apiService } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function LoginScreen({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.fillAllFields"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t("common.error"), t("auth.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      if (onLogin) {
        await onLogin(email, password);
        // Success is handled by parent component (App.tsx)
      } else {
        Alert.alert(t("common.error"), t("auth.loginFailed"));
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = t("auth.loginError");

      if (error?.response?.status === 401) {
        errorMessage = t("auth.wrongCredentials");
      } else if (error?.message?.includes("Network request failed")) {
        errorMessage =
          t("auth.networkError") +
          "\n\nProblem hiển thị là kiểm tra kết nối internet và kiểm tra xem server backend có đang chạy không (10.0.2.2:3000 hoặc localhost:3000).";
      } else if (error?.message?.includes("timed out")) {
        errorMessage =
          "Yêu cầu đăng nhập đã hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.";
      } else {
        // Show more detailed error message
        errorMessage = `${t("auth.loginError")}\n\nLỗi chi tiết: ${
          error.message || "Unknown error"
        }`;
      }

      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text style={styles.languageButtonText}>
              {language === "en" ? "EN" : "VI"}
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Freeday</Text>
            <Text style={styles.subtitle}>{t("auth.login")}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("auth.email")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("auth.password")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={onNavigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? t("auth.signingIn") : t("auth.loginButton")}
              </Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t("auth.switchToRegister")}
              </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.signupText}> {t("auth.register")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("common.language")}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "en" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage("en");
                setLanguageModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "en" && styles.languageOptionTextSelected,
                ]}
              >
                {t("common.english")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "vi" && styles.languageOptionSelected,
              ]}
              onPress={() => {
                setLanguage("vi");
                setLanguageModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "vi" && styles.languageOptionTextSelected,
                ]}
              >
                {t("common.vietnamese")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t("common.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  languageButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  signupText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  languageOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
  },
  languageOptionSelected: {
    backgroundColor: "#007AFF",
  },
  languageOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#1a1a1a",
  },
  languageOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});
