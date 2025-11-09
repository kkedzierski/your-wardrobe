import React from "react";
import styled from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";
import {
  LOGIN_PROVIDERS,
  LoginProviderId,
} from "../../auth/providers/loginProviders";
import AccountConnections from "../../components/AccountConnections";

export default function LoginOptionsScreen() {
  const { user, connectApple, connectGoogle } = useAuth();
  const navigation = useNavigation();
  const isGuest = user.kind === "guest";

  const onPressProvider = (id: LoginProviderId) => {
    switch (id) {
      case "email":
        // przejdź do własnego ekranu logowania e-mail/hasło
        navigation.navigate("EmailLogin" as never);
        return;
      case "apple":
        connectApple?.();
        return;
      case "google":
        connectGoogle?.();
        return;
      case "facebook":
        // TODO: później
        return;
    }
  };

  return (
    <Container>
      <Title>Zaloguj się</Title>
      <Subtitle>
        Aby odblokować synchronizację, kopie zapasowe i dostęp z wielu urządzeń.
      </Subtitle>

      <AccountConnections
        key={user.id}
        isGuest={isGuest}
        provider={user.provider}
        email={user.email}
        providers={LOGIN_PROVIDERS}
        onPressProvider={onPressProvider}
      />
    </Container>
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
`;
const Subtitle = styled.Text`
  color: #6b6b6b;
  margin-top: 8px;
  margin-bottom: 16px;
`;
