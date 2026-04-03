import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { RegisterInput } from '../../src/types/auth';

const initialRegisterState: RegisterInput = {
  phone_number: '',
  email: '',
  password: '',
  full_name: '',
  gender: 'male',
  date_of_birth: '',
};

export default function AuthScreen() {
  const { login, registerDriver } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerData, setRegisterData] = useState<RegisterInput>(initialRegisterState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'login' ? 'Đăng nhập tài xế' : 'Đăng ký tài xế mới'),
    [mode]
  );

  const onSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await registerDriver({
          ...registerData,
          email: registerData.email.trim(),
          phone_number: registerData.phone_number.trim(),
          full_name: registerData.full_name.trim(),
        });
      }

      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError('');
    setMode((prev: 'login' | 'register') => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.brand}>FastDeli Driver</Text>
          <Text style={styles.title}>{title}</Text>

          {mode === 'login' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={registerData.full_name}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({ ...prev, full_name: value }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại (VD: 0912345678)"
                keyboardType="phone-pad"
                value={registerData.phone_number}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({ ...prev, phone_number: value }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={registerData.email}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({ ...prev, email: value }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                secureTextEntry
                value={registerData.password}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({ ...prev, password: value }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Giới tính: male | female | other"
                autoCapitalize="none"
                value={registerData.gender}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({
                    ...prev,
                    gender: (value as RegisterInput['gender']) || 'male',
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Ngày sinh (YYYY-MM-DD)"
                autoCapitalize="none"
                value={registerData.date_of_birth}
                onChangeText={(value: string) =>
                  setRegisterData((prev: RegisterInput) => ({ ...prev, date_of_birth: value }))
                }
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.submitButton} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitLabel}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Text>
            )}
          </Pressable>

          <Pressable onPress={switchMode} style={styles.switchModeButton}>
            <Text style={styles.switchModeLabel}>
              {mode === 'login' ? 'Chưa có tài khoản? Chuyển sang đăng ký' : 'Đã có tài khoản? Chuyển sang đăng nhập'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  brand: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 18,
  },
  input: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#dc2626',
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchModeButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchModeLabel: {
    color: '#0f172a',
    fontSize: 14,
  },
});
