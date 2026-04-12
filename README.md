# FastDeli Workspace

## Web apps da tach rieng

- Client app: folder `client`, chay o port 3000.
- Supplier app: folder `supplier`, chay o port 3001.
- Admin app: folder `admin-ui`, chay o port 4000.

## Service routes cho nguoi dung (client)

- `/food-service` (giu nhu huong truoc day)
- `/delivery-service` (da uu tien tao truoc)
- `/bike-service` (da tao san folder/route, chua implement nghiep vu)

## Backend service ports

- Auth service: 5000
- Food service: 5001
- Delivery service: 5002
- Bike service: 5003

## Che do khoi dong tu `start.js`

- `client`: client web + food + auth + delivery.
- `supplier`: supplier web + food + auth.
- `admin`: admin web + food + delivery + bike.
- `driver`: driver app + auth + delivery.
- `all`: chay dong thoi tat ca web va backend services.

