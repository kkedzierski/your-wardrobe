// src/screens/SettingsScreen.tsx
import React from "react";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import * as LocalAuth from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRICS_KEY = "security:biometricsEnabled";

export default function SettingsScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isGuest = user.kind === "guest";

  // --- Bezpieczeństwo / biometria ---
  const [bioEnabled, setBioEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [bioAvailable, setBioAvailable] = React.useState(false);
  const [bioLabel, setBioLabel] = React.useState("Biometria");

  React.useEffect(() => {
    (async () => {
      try {
        const hw = await LocalAuth.hasHardwareAsync();
        const enrolled = await LocalAuth.isEnrolledAsync();
        setBioAvailable(hw && enrolled);

        const types = await LocalAuth.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)) {
          setBioLabel("Face ID");
        } else if (types.includes(LocalAuth.AuthenticationType.FINGERPRINT)) {
          setBioLabel("Odcisk palca");
        }

        const saved = await AsyncStorage.getItem(BIOMETRICS_KEY);
        setBioEnabled(saved === "1");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleBiometrics = async () => {
    if (!bioAvailable) {
      alert(
        "Na tym urządzeniu biometria jest niedostępna lub nie została skonfigurowana."
      );
      return;
    }
    const next = !bioEnabled;
    setBioEnabled(next);
    await AsyncStorage.setItem(BIOMETRICS_KEY, next ? "1" : "0");
  };

  const testBiometrics = async () => {
    const res = await LocalAuth.authenticateAsync({
      promptMessage: `Uwierzytelnij ${bioLabel}`,
      cancelLabel: "Anuluj",
      disableDeviceFallback: false,
    });
    if (res.success) {
      alert("✅ Uwierzytelniono pomyślnie");
    } else {
      alert(`❌ Niepowodzenie: ${res.error ?? "anulowano"}`);
    }
  };

  return (
    <Container>
      <SectionTitle>Ustawienia</SectionTitle>

      {/* Użytkownik */}
      <ProfileCard
        onPress={() => navigation.navigate("Profile")}
        accessibilityRole="button"
      >
        <Avatar>
          <MaterialCommunityIcons
            name="account-circle"
            size={56}
            color="#9aa0a6"
          />
        </Avatar>
        <ProfileInfo>
          <ProfileName>{user?.email || "Użytkownik"}</ProfileName>
          <ProfileMeta>
            {isGuest
              ? "Tryb gościa"
              : `Połączono: ${user.provider}${
                  user.email ? ` • ${user.email}` : ""
                }`}
          </ProfileMeta>
        </ProfileInfo>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#9aa0a6"
        />
      </ProfileCard>

      {/* Synchronizacja */}
      <Card>
        <SectionHeader>
          <MaterialCommunityIcons
            name="cloud-sync-outline"
            size={20}
            color="#4a90e2"
          />
          <HeaderText>Synchronizacja</HeaderText>
        </SectionHeader>

        <Item
          onPress={() => navigation.navigate("SyncSettings")}
          accessibilityRole="button"
        >
          <ItemLeft>
            <MaterialCommunityIcons
              name="cloud-outline"
              size={22}
              color="#1b1b1b"
            />
            <ItemText>Ustawienia synchronizacji</ItemText>
          </ItemLeft>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#9aa0a6"
          />
        </Item>

        <Subtitle>
          {isGuest
            ? "Połącz konto, aby włączyć synchronizację i kopie zapasowe."
            : "Synchronizacja jest dostępna — zobacz szczegóły i status."}
        </Subtitle>
      </Card>

      {/* Bezpieczeństwo */}
      <Card>
        <SectionHeader>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={20}
            color="#4a90e2"
          />
          <HeaderText>Bezpieczeństwo</HeaderText>
        </SectionHeader>

        <RowBetween>
          <ItemText>Odblokuj aplikację ({bioLabel})</ItemText>
          <SwitchLike
            onPress={toggleBiometrics}
            disabled={loading || !bioAvailable}
            accessibilityRole="switch"
            accessibilityState={{
              checked: bioEnabled,
              disabled: loading || !bioAvailable,
            }}
          >
            <SwitchKnob $on={bioEnabled} />
          </SwitchLike>
        </RowBetween>

        <SmallNote>
          {loading
            ? "Sprawdzanie dostępności biometrii…"
            : bioAvailable
            ? "Po włączeniu aplikacja poprosi o uwierzytelnienie przy starcie lub powrocie."
            : "Biometria jest niedostępna lub nie została skonfigurowana w systemie."}
        </SmallNote>

        <TestBtn
          onPress={testBiometrics}
          disabled={!bioAvailable}
          accessibilityRole="button"
          accessibilityState={{ disabled: !bioAvailable }}
        >
          <MaterialCommunityIcons
            name="face-recognition"
            size={18}
            color="#111"
          />
          <TestBtnText>Przetestuj {bioLabel}</TestBtnText>
        </TestBtn>
      </Card>
    </Container>
  );
}

/* === styles === */
const Container = styled.ScrollView`
  flex: 1;
  background: #fff;
  padding: 16px;
`;
const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: #1b1b1b;
  margin-bottom: 12px;
`;
const ProfileCard = styled.TouchableOpacity`
  background: #f7f8fb;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
`;
const Avatar = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: #eef1f4;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;
const ProfileInfo = styled.View`
  flex: 1;
`;
const ProfileName = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: #1b1b1b;
`;
const ProfileMeta = styled.Text`
  color: #6b6b6b;
  margin-top: 2px;
`;
const Card = styled.View`
  background: #f7f8fb;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
`;
const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;
const HeaderText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #1b1b1b;
`;
const Item = styled.TouchableOpacity`
  padding: 12px 4px;
  margin-top: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const ItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
const ItemText = styled.Text`
  font-size: 16px;
  color: #1b1b1b;
`;
const Subtitle = styled.Text`
  color: #6b6b6b;
  margin-top: 8px;
`;

/* Bezpieczeństwo */
const RowBetween = styled.View`
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const SwitchLike = styled.TouchableOpacity`
  width: 52px;
  height: 32px;
  border-radius: 16px;
  background: #e5e7eb;
  padding: 4px;
  justify-content: center;
`;
const SwitchKnob = styled.View<{ $on: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: ${({ $on }) => ($on ? "#16a34a" : "#9ca3af")};
  margin-left: ${({ $on }) => ($on ? "24px" : "0px")};
`;
const SmallNote = styled.Text`
  color: #6b6b6b;
  margin-top: 8px;
`;
const TestBtn = styled.TouchableOpacity`
  margin-top: 12px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  padding: 10px 12px;
  border-radius: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;
const TestBtnText = styled.Text`
  color: #111;
  font-weight: 700;
`;
