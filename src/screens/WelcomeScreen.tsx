// src/screens/WelcomeScreen.tsx
import React from "react";
import styled from "styled-components/native";
import { Image } from "react-native";
import { MotiView, MotiText } from "moti";
import { useReducedMotion } from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import AnimatedButton from "../components/AnimatedButton";
import { TranslationServiceInstance } from "../i18n/TranslationService";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const reduce = useReducedMotion();

  return (
    <Container
      testID="WelcomeScreen"
      accessibilityLabel={TranslationServiceInstance.t("Welcome screen")}
    >
      {/* Logo: fade+scale-in, a potem subtelne „pływanie” góra-dół */}
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <MotiView
          from={{ translateY: 0 }}
          animate={{ translateY: reduce ? 0 : -6 }}
          transition={{
            type: "timing",
            duration: 1400,
            loop: !reduce,
            repeatReverse: true,
          }}
        >
          <Logo
            source={require("../assets/images/logo.png")}
            resizeMode="contain"
          />
        </MotiView>
      </MotiView>

      <MotiText
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200, duration: 350 }}
        style={{
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1b1b1b",
        }}
      >
        {TranslationServiceInstance.t("Your wardrobe")}
      </MotiText>

      <Subtitle
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 320, duration: 350 }}
      >
        {TranslationServiceInstance.t(
          "Easily manage your wardrobe with this app"
        )}
      </Subtitle>

      {/* CTA: slide-up + delikatne „pulse” tła */}
      <CTAWrapper
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 480, duration: 400 }}
      >
        <PulseBg
          from={{ opacity: 0.2, scale: 0.95 }}
          animate={{ opacity: 0.5, scale: 1.05 }}
          transition={{ duration: 1600, loop: !reduce, repeatReverse: true }}
        />
        <AnimatedButton
          label={TranslationServiceInstance.t("Let's start!")}
          onPress={() => navigation.navigate("MainTabs")}
          testID="WelcomeStartButton"
          accessibilityLabel={TranslationServiceInstance.t("Let's start!")}
        />
      </CTAWrapper>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background-color: #ffffff;
`;

const Logo = styled(Image)`
  width: 180px;
  height: 180px;
  margin-bottom: 8px;
`;

const Subtitle = styled(MotiText)`
  font-size: 16px;
  color: #6b6b6b;
  text-align: center;
  margin-bottom: 24px;
`;

const CTAWrapper = styled(MotiView)`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const PulseBg = styled(MotiView)`
  position: absolute;
  width: 220px;
  height: 56px;
  border-radius: 32px;
  background-color: rgba(74, 144, 226, 0.15);
`;
