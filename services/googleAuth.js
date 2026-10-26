import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

// Completes auth session in WebBrowser if needed
WebBrowser.maybeCompleteAuthSession();

/**
 * Minimum required Google OAuth scopes:
 * - Identity: openid, userinfo.email, userinfo.profile
 * - Gmail: reading student's Gmail messages
 * - Classroom: reading student's available courses, coursework, submissions
 * - Calendar: reading student's calendar events
 */
export const REQUIRED_GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export function useGoogleAuth(onSuccessRedirect = '/(tabs)/dashboard') {
  const { googleLogin, setAuthError } = useAuth();

  const redirectUri = makeRedirectUri({
    scheme: 'ai-student-productivity',
  });

  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Use webClientId as primary client id in Expo Go web browser OAuth flow
  const effectiveAndroidId = androidClientId || webClientId || 'placeholder-android.apps.googleusercontent.com';
  const effectiveIosId = iosClientId || webClientId || 'placeholder-ios.apps.googleusercontent.com';
  const effectiveWebId = webClientId || 'placeholder-web.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: effectiveAndroidId,
    iosClientId: effectiveIosId,
    webClientId: effectiveWebId,
    clientId: effectiveWebId,
    scopes: REQUIRED_GOOGLE_SCOPES,
    redirectUri,
    extraParams: {
      access_type: 'offline', // Requests Google refresh_token for backend API access
      prompt: 'consent',     // Ensures permissions consent screen is displayed
    },
  });

  const handleAuthResult = useCallback(async (authResult) => {
    if (!authResult) return { success: false };

    if (authResult.type === 'success') {
      const { authentication, params } = authResult;
      const code = params?.code || authentication?.code;
      const accessToken = authentication?.accessToken || params?.access_token;
      const idToken = authentication?.idToken || params?.id_token;

      if (code || accessToken || idToken) {
        const payload = {
          code: code || '',
          access_token: accessToken || '',
          id_token: idToken || '',
          redirect_uri: request?.redirectUri || redirectUri,
          scopes: REQUIRED_GOOGLE_SCOPES.join(' '),
        };

        const res = await googleLogin(payload);
        if (res?.success) {
          router.replace(onSuccessRedirect);
          return { success: true };
        }
        const errorMsg = res?.error || 'Failed to authenticate Google account on server.';
        Alert.alert('Authentication Failed', errorMsg);
        return { success: false, error: errorMsg };
      }
    } else if (authResult.type === 'dismiss' || authResult.type === 'cancel') {
      return { success: false, error: 'Google Sign-In was cancelled.' };
    } else if (authResult.type === 'error') {
      const errorMsg = authResult.error?.message || 'Google authentication error.';
      if (setAuthError) setAuthError(errorMsg);
      Alert.alert('Google Sign-In Error', errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: false };
  }, [googleLogin, onSuccessRedirect, request, redirectUri, setAuthError]);

  useEffect(() => {
    if (response) {
      handleAuthResult(response);
    }
  }, [response, handleAuthResult]);

  const signInWithGoogle = async () => {
    try {
      const hasConfiguredClientId = !!(androidClientId || iosClientId || webClientId);

      if (!hasConfiguredClientId) {
        // Offer guidance and instant developer testing mode
        Alert.alert(
          'Google Client ID Setup',
          'Google OAuth Client ID is not yet configured in .env.\n\nTo use live Google OAuth, add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.\n\nWould you like to connect a test Google account to verify connected services now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect Test Account',
              onPress: async () => {
                const testPayload = {
                  email: 'student.verified@university.edu',
                  name: 'Verified Student',
                  access_token: 'mock-google-access-token-active',
                  refresh_token: 'mock-google-refresh-token-active',
                  scopes: REQUIRED_GOOGLE_SCOPES.join(' '),
                };
                const res = await googleLogin(testPayload);
                if (res?.success) {
                  router.replace(onSuccessRedirect);
                } else {
                  Alert.alert('Error', res?.error || 'Failed to connect test account.');
                }
              },
            },
          ]
        );
        return { success: false, error: 'Google Client ID not configured.' };
      }

      if (promptAsync) {
        const result = await promptAsync();
        return await handleAuthResult(result);
      }
    } catch (e) {
      const errorMsg = e.message || 'Failed to open Google Sign-In.';
      if (setAuthError) setAuthError(errorMsg);
      Alert.alert('Google Sign-In Error', errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: false };
  };

  return {
    signInWithGoogle,
    isReady: !!request,
  };
}

export default useGoogleAuth;
