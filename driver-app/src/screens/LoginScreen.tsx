import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { login } from '../api/authApi';
import { DEV_MOCK_MODE, MOCK_DRIVER_ACCOUNT } from '../config/api';
import { setAuthToken } from '../lib/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res?.token) throw new Error('Invalid login response');
      await setAuthToken(res.token);
      navigation.reset({ index: 0, routes: [{ name: 'Orders' }] });
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err?.message || 'Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.shapeMain} />
            <Image source={require('../../assets/fooddeli-logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Đăng nhập</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="driver@fooddeli.com"
              placeholderTextColor="#e8eaed" 
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={[styles.label, styles.labelSpace]}>Mật khẩu</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#e8eaed"
              secureTextEntry
              style={styles.input}
            />

            <Pressable style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={onLogin}>
              <Text style={styles.loginBtnText}>{loading ? 'Đang...' : 'Đăng nhập'}</Text>
            </Pressable>

            {DEV_MOCK_MODE ? (
              <Pressable
                style={styles.mockBtn}
                onPress={() => {
                  setEmail(MOCK_DRIVER_ACCOUNT.email);
                  setPassword(MOCK_DRIVER_ACCOUNT.password);
                }}
              >
                <Text style={styles.mockBtnText}>Dùng tài khoản demo</Text>
              </Pressable>
            ) : null}

            <View style={styles.bottomRow}>
              <Text style={styles.bottomHint}>Người mới?</Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.bottomLink}>Tạo tài khoản</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 20 },
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f8fafb',
  },
  shapeMain: {
    position: 'absolute',
    right: -145,
    top: -180,
    width: 280,
    height: 280,
    backgroundColor: '#0f8b84',
    borderRadius: 999,
  },
  logo: { width: 132, height: 132, marginTop: 8, zIndex: 2 },
  formCard: {
    marginTop: -40,
    marginHorizontal: 18,
    paddingVertical: 24,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe8eb',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#0f172a', 
    marginBottom: 14,
    textAlign: 'center', 
  },
  label: { color: '#475569', fontSize: 13, marginBottom: 6 },
  labelSpace: { marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#c7d2d9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
    backgroundColor: '#fbfdff',
  },
  loginBtn: {
    marginTop: 18,
    backgroundColor: '#2f9d92',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  mockBtn: { marginTop: 10, alignSelf: 'center' },
  mockBtnText: { color: '#0f8b84', fontSize: 12, fontWeight: '600' },
  bottomRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomHint: { color: '#64748b', fontSize: 13 },
  bottomLink: { color: '#0f8b84', fontWeight: '700', fontSize: 13 },
});
