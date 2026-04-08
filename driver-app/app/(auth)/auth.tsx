import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
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
  StatusBar,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { RegisterInput } from '../../src/types/auth';

const PLACEHOLDER_COLOR = '#B0BEC5';
const PRIMARY = '#00B14F';
const PRIMARY_DARK = '#007A36';

const initialRegisterState: RegisterInput = {
  phone_number: '',
  email: '',
  password: '',
  full_name: '',
};

type Screen = 'welcome' | 'login' | 'register';

export default function AuthScreen() {
  const { login, registerDriver } = useAuth();

  const [screen, setScreen] = useState<Screen>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [registerData, setRegisterData] = useState<RegisterInput>(initialRegisterState);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = screen === 'login';

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (registerData.password !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận chưa khớp.');
        }
        await registerDriver({
          ...registerData,
          email: registerData.email.trim(),
          phone_number: registerData.phone_number.trim(),
          full_name: registerData.full_name.trim(),
        });
      }
      router.replace('/(tabs)/home' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const goToScreen = (s: Screen) => {
    setError('');
    setConfirmPassword('');
    setScreen(s);
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    options?: {
      keyboardType?: any;
      autoCapitalize?: any;
      isPassword?: boolean;
      isVisible?: boolean;
      onToggleVisible?: () => void;
      placeholder?: string;
    }
  ) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          key={options?.isPassword ? (options?.isVisible ? 'visible' : 'hidden') : 'normal'}
          style={[styles.input, options?.isPassword && { paddingRight: 40 }]}
          placeholder={options?.placeholder ?? label}
          placeholderTextColor={PLACEHOLDER_COLOR}
          autoCapitalize={options?.autoCapitalize ?? 'none'}
          keyboardType={options?.keyboardType ?? 'default'}
          secureTextEntry={options?.isPassword && !options?.isVisible}
          value={value}
          onChangeText={onChangeText}
        />
        {options?.isPassword && (
          <Pressable style={styles.eyeBtn} hitSlop={10} onPress={options.onToggleVisible}>
            <MaterialCommunityIcons
              name={options.isVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#90A4AE"
            />
          </Pressable>
        )}
      </View>
    </View>
  );

  // ── WELCOME SCREEN ──────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <View style={styles.welcomeRoot}>
        <StatusBar barStyle="light-content" />

        {/* Top gradient area */}
        <View style={styles.welcomeTop}>
          {/* Decorative circles */}
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />

          <MaterialCommunityIcons name="car-connected" size={52} color="#fff" style={{ marginBottom: 12 }} />
          <Text style={styles.welcomeAppName}>FastDeli</Text>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTagline}>
              Chào mừng bạn quay lại
            </Text>

            <View style={styles.handIconWrapper}>
              <FontAwesome size={30} name="hand-peace-o" color="yellow" />
            </View>
          </View>
        </View>

        {/* Bottom white card */}
        <View style={styles.welcomeCard}>
          <Pressable
            style={({ pressed }) => [styles.welcomeBtnOutline, pressed && { opacity: 0.8 }]}
            onPress={() => goToScreen('login')}
          >
            <Text style={styles.welcomeBtnOutlineText}>ĐĂNG NHẬP</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.welcomeBtnSolid, pressed && { opacity: 0.85 }]}
            onPress={() => goToScreen('register')}
          >
            <Text style={styles.welcomeBtnSolidText}>ĐĂNG KÝ</Text>
          </Pressable>

          <Text style={styles.welcomeSocialLabel}>Đăng nhập bằng mạng xã hội</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialCircle}>
              <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            </Pressable>
            <Pressable style={styles.socialCircle}>
              <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
            </Pressable>
            <Pressable style={styles.socialCircle}>
              <MaterialCommunityIcons name="twitter" size={20} color="#1DA1F2" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── LOGIN / REGISTER SCREEN ──────────────────────────────────────
  return (
    <View style={styles.authRoot}>
      <StatusBar barStyle="light-content" />

      {/* Header gradient */}
      <View style={styles.authHeader}>
        <View style={styles.circleTopRight} />
        <Pressable style={styles.backBtn} onPress={() => goToScreen('welcome')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </Pressable>
        {/* <Text style={styles.authHeaderGreeting}>{isLogin ? 'Xin chào' : 'Tạo tài khoản'}</Text> */}
        <Text style={styles.authHeaderTitle}>{isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</Text>
      </View>

      {/* White card sliding up */}
      <ScrollView
        style={styles.authCard}
        contentContainerStyle={styles.authCardContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isLogin ? (
          <>
            {renderInput('Email', email, setEmail, {
              keyboardType: 'email-address',
              placeholder: 'abcxyz@gmail.com',
            })}
            {renderInput('Mật khẩu', password, setPassword, {
              isPassword: true,
              isVisible: passwordVisible,
              onToggleVisible: () => setPasswordVisible((p) => !p),
              placeholder: '••••••••',
            })}
            <View style={styles.optionRow}>
              <Pressable style={styles.rememberRow} onPress={() => setRememberMe((p) => !p)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <MaterialCommunityIcons name="check" size={10} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {renderInput('Họ và tên', registerData.full_name,
              (v) => setRegisterData((p) => ({ ...p, full_name: v })),
              { autoCapitalize: 'words', placeholder: 'VD: Nguyễn Văn A, ...' }
            )}
            {renderInput('Email', registerData.email,
              (v) => setRegisterData((p) => ({ ...p, email: v })),
              { keyboardType: 'email-address', placeholder: 'abcxyz@gmail.com' }
            )}
            {renderInput('Số điện thoại', registerData.phone_number,
              (v) => setRegisterData((p) => ({ ...p, phone_number: v })),
              { keyboardType: 'phone-pad', placeholder: 'VD: 0123456789, ...' }
            )}
            {renderInput('Mật khẩu', registerData.password,
              (v) => setRegisterData((p) => ({ ...p, password: v })),
              {
                isPassword: true,
                isVisible: registerPasswordVisible,
                onToggleVisible: () => setRegisterPasswordVisible((p) => !p),
                placeholder: '••••••••',
              }
            )}
            {renderInput('Nhập lại mật khẩu', confirmPassword, setConfirmPassword, {
              isPassword: true,
              isVisible: confirmPasswordVisible,
              onToggleVisible: () => setConfirmPasswordVisible((p) => !p),
              placeholder: '••••••••',
            })}
          </>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#E53E3E" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.88 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitLabel}>{isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => goToScreen(isLogin ? 'register' : 'login')}
          style={styles.switchBtn}
        >
          <Text style={styles.switchLabelGray}>
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          </Text>
          <Text style={styles.switchLabelBold}>
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── WELCOME ──────────────────────────────────────────────────────
  welcomeRoot: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  welcomeTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  welcomeAppName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 6,
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  handIconWrapper: {
    //backgroundColor: "yellow",
    padding: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 6,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    gap: 14,
  },
  welcomeBtnOutline: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBtnOutlineText: {
    color: PRIMARY,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  welcomeBtnSolid: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  welcomeBtnSolidText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  welcomeSocialLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#90A4AE',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E0E7EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // ── AUTH HEADER ───────────────────────────────────────────────────
  authRoot: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  authHeader: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 25,
    overflow: 'hidden',
  },
  backBtn: {
    marginBottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // authHeaderGreeting: {
  //   fontSize: 16,
  //   color: 'rgba(255,255,255,0.85)',
  //   fontWeight: '500',
  // },
  authHeaderTitle: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },

  // ── AUTH CARD ─────────────────────────────────────────────────────
  authCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  authCardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },

  // ── SHARED FORM ───────────────────────────────────────────────────
  fieldBlock: { marginBottom: 10 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#546E7A',
    marginBottom: 4,
  },
  inputWrapper: { position: 'relative' },
  input: {
    height: 42,
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderColor: '#E0E7EF',
    borderRadius: 0,
    paddingHorizontal: 2,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: 'transparent',
  },
  eyeBtn: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 2,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  checkboxChecked: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  rememberText: { fontSize: 12, color: '#546E7A' },
  forgotText: { fontSize: 12, color: '#90A4AE', fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 7,
  },
  errorText: { flex: 1, color: '#E53E3E', fontSize: 12 },
  submitBtn: {
    height: 50,
    backgroundColor: PRIMARY_DARK,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 14,
  },
  switchLabelGray: { fontSize: 13, color: '#90A4AE' },
  switchLabelBold: { fontSize: 13, color: '#1A1A1A', fontWeight: '800' },

  // ── DECORATIVE CIRCLES ────────────────────────────────────────────
  circleTopRight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -30,
    right: -30,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 20,
    left: -20,
  },
});