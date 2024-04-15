# dkhptd-api-gateway

là api server cho toàn bộ hệ thống

## NOTE

project có sự dụng src/auto-route.ts để tự động scan và import routing từ một thư mục, do vậy nếu đã xóa route trong src/routes thì cần phải xóa file này trong dist nữa.
tương tự với src/auto-consumer.ts src/auto-listener.ts
