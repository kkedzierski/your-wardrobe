import React, { useState } from "react";
import styled from "styled-components/native";
import { KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../../auth/AuthContext";

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth(); // załóżmy, że masz taką metodę; jeśli nie — podmień na swoją
  const [email, setEmail] = useState(user?.email ?? "");
  const [kind, setKind] = useState(user?.kind ?? "guest");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      // minimalna walidacja
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        Alert.alert("Niepoprawny e-mail");
        return;
      }
      await updateProfile?.({ email, kind }); // dostosuj do swojego API
      Alert.alert("Zapisano", "Profil został zaktualizowany.");
    } catch (e: any) {
      Alert.alert("Błąd", e?.message ?? "Nie udało się zapisać profilu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Container accessibilityLabel="Ekran edycji profilu">
        <Title>Edycja profilu</Title>
        <FieldLabel>E-mail</FieldLabel>
        <Input
          placeholder="twoj@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <FieldLabel>Typ konta</FieldLabel>
        <Input
          placeholder="guest / user"
          autoCapitalize="none"
          value={kind}
          onChangeText={setKind}
        />

        <SaveBtn
          disabled={saving}
          onPress={onSave}
          accessibilityLabel="Zapisz profil"
        >
          <SaveBtnText>{saving ? "Zapisywanie…" : "Zapisz"}</SaveBtnText>
        </SaveBtn>
        <Hint>
          Zmieniaj tylko to, co ma sens dla Twojej logiki. Np. e-mail, display
          name; „kind” zwykle kontroluje backend.
        </Hint>
      </Container>
    </KeyboardAvoidingView>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background: #fff;
  padding: 16px;
`;
const Title = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: #1b1b1b;
  margin-bottom: 16px;
`;
const FieldLabel = styled.Text`
  font-size: 13px;
  color: #6b6b6b;
  margin-top: 12px;
  margin-bottom: 6px;
`;
const Input = styled.TextInput`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  color: #111;
`;
const SaveBtn = styled.TouchableOpacity`
  background: #111;
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20px;
`;
const SaveBtnText = styled.Text`
  color: #fff;
  font-weight: 700;
`;
const Hint = styled.Text`
  color: #8a8a8a;
  font-size: 12px;
  margin-top: 12px;
`;
