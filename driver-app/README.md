# FastDeli Driver App (Expo)

## 1) Cai dat
- Chay npm install trong thu muc driver-app.

## 2) Cau hinh API
- App goi auth-service qua bien EXPO_PUBLIC_AUTH_API_URL.
- Neu khong dat bien moi truong, app mac dinh:
  - Android emulator: http://10.0.2.2:5000
  - Nen tang khac: http://localhost:5000

## 3) Chay app
- Chay node start.js driver tu thu muc project de mo auth-service va expo.
- Hoac chay rieng trong driver-app bang npm run start.

## 4) Luong auth
- Dang ky tai xe: POST /api/auth/register-driver
- Dang nhap: POST /api/auth/login
- Chi cho vao trang chinh neu user.role = driver.
