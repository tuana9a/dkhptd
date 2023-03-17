# dkhptd

Đăng ký học phần tự động cho sinh viên Đại học bách khoa hà nội

Mặc dù tên project là đăng ký học phần tự động tuy nhiên project này làm được những việc sau:

- hẹn giờ đăng ký lớp tự động trên trang [https://dk-sis.hust.edu.vn](https://dk-sis.hust.edu.vn)
- crawl thời khóa biểu của sinh viên trên trang [https://ctt-sis.hust.edu.vn](https://ctt-sis.hust.edu.vn)
- crawl chương trình học của sinh viên trên trang [https://ctt-sis.hust.edu.vn](https://ctt-sis.hust.edu.vn)

project được triển khai dưới dạng nhiều module

- dkhptd-api-gateway: api server xử lý các request từ trình duyệt
- dkhptd-scheduler: bộ hẹn giờ liên tục kiểm tra xem đã tới thời điểm hẹn giờ của sinh viên hay chưa
- dkhptd-worker: khi đến hẹn giờ các yêu cầu đăng ký tự động sẽ được xử lý bởi worker
- dkhptd-taskmanager: xử lý kết quả mà worker trả về để có các logic xử lý như tự động thử đăng ký lại
