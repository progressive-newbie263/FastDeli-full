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

import { registerDriver } from '../api/driverApi';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!fullName || !phoneNumber || !email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, SĐT, email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await registerDriver({
        full_name: fullName,
        phone_number: phoneNumber,
        email,
        password,
        gender: 'other',
      });
      Alert.alert('Đăng ký thành công', 'Bạn đang chờ admin duyệt. Hãy quay lại đăng nhập sau.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.message || 'Vui lòng thử lại.');
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
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            <Text style={styles.label}>Họ và tên</Text>
            
            <TextInput 
              value={fullName} 
              onChangeText={setFullName} 
              placeholder="VD: Nguyễn Văn A ..." 
              placeholderTextColor="#e8eaed" 
              style={styles.input} 
            />

            <Text style={[styles.label, styles.labelSpace]}>Số điện thoại</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="VD: 0987654321"
              placeholderTextColor="#e8eaed" 
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={[styles.label, styles.labelSpace]}>Email</Text>
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

            <Pressable style={[styles.registerBtn, loading && styles.registerBtnDisabled]} onPress={onRegister}>
              <Text style={styles.registerBtnText}>{loading ? 'Đang...' : 'Đăng ký'}</Text>
            </Pressable>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomHint}>Đã có tài khoản?</Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.bottomLink}>Đăng nhập</Text>
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
  scroll: { 
    flexGrow: 1,
    paddingBottom: 20,
  },
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
    marginBottom: 20,
    marginHorizontal: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe8eb',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 10, textAlign: 'center' },
  label: { color: '#475569', fontSize: 13, marginBottom: 6 },
  labelSpace: { marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#c7d2d9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#0f172a',
    backgroundColor: '#fbfdff',
  },
  registerBtn: {
    marginTop: 16,
    backgroundColor: '#2f9d92',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomHint: { color: '#64748b', fontSize: 13 },
  bottomLink: { color: '#0f8b84', fontWeight: '700', fontSize: 13 },
});
