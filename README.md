# dkhptd

đăng ký học phần tự động cho sinh viên đại học bách khoa hà nội

mặc dù tên project là đăng ký học phần tự động tuy nhiên project này làm được những việc sau:

- hẹn giờ đăng ký lớp tự động trên trang [https://dk-sis.hust.edu.vn](https://dk-sis.hust.edu.vn)
  - khi đến hẹn giờ hệ thống sẽ tự động thực thi đăng ký trên trang dk-sis
  - sinh viên không cần can thiệp trong quá trình đăng ký, sinh viên chỉ cần chờ kết quả
- crawl thời khóa biểu của sinh viên trên trang [https://ctt-sis.hust.edu.vn](https://ctt-sis.hust.edu.vn)
- crawl chương trình học của sinh viên trên trang [https://ctt-sis.hust.edu.vn](https://ctt-sis.hust.edu.vn)

ngoài ra các bạn có thể viết thêm job để có thể chạy automation với hệ thống của nhà trường

# architechture

project được triển khai dưới dạng nhiều module, được triển khai độc lập

- `web`: web frontend
- `api-gateway`: api server xử lý các request từ trình duyệt và xử lý kết quả mà worker trả về thông qua message queue để có các logic xử lý như tự động thử đăng ký lại
- `scheduler`: bộ hẹn giờ liên tục kiểm tra xem đã tới thời điểm hẹn giờ của sinh viên hay chưa, nếu đã đến giờ sẽ gửi yêu cầu này cho worker thông qua message queue
- `worker`: thực thi các yêu cầu đăng ký tự động, sau khi xử lý xong sẽ gửi kết quả vào message queue cho taskamager xử lý
- ~~`taskmanager`: xử lý kết quả mà worker trả về để có các logic xử lý như tự động thử đăng ký lại~~
  - ĐÃ BỊ LƯỢC BỎ và THAY THẾ BỞI api-gateway
- `hust-captcha-resolver`: nhận diện hust captcha, từ ảnh thành text
- (_**optional**_) `thoi-khoa-bieu-parser`: xử lý file excel thời khóa biểu dự kiến của nhà trường để trích xuất thông tin lớp học phục vụ quá trình tìm kiếm lớp đăng ký.
- `rabbitmq`: message cho job, kết quả xử lý, ...
- `mongodb`: database

các module trên sẽ truy cập, trao đổi thông tin thông qua database là [MongoDB](https://www.mongodb.com/docs/v5.0/tutorial/getting-started/) và message queue là [RabbitMQ](https://www.rabbitmq.com/getstarted.html).

![so-do-trien-khai.png](./so-do-trien-khai.png)

# how to run

mỗi thư mục con có file `.env.example` các bạn copy thành file `.env` và điền các thông tin tương ứng với môi trường triển khai của các bạn

một vài biến đặc biệt như
- `JOB_ENCRYPTION_KEY`: là key dùng để encrypt, decrypt thông tin đăng nhập của các bạn sinh viên, các giá trị này rất quan trọng các bạn cần giữ cẩn thận vì nó là thông tin duy nhất để encrypt và decrypt các thông tin job đăng ký trước đó
- `AMQP_ENCRYPTION_KEY`: là key để encrypt message trong message queue, nếu mất có thể gen lại và sử dụng bình thường, tuy nhiên nếu vẫn có message trong queue được encrypt bằng key trước đó thì sẽ cần drop hết các message trong queue này trước khi cập nhật key mới

các key đó không thể set giá trị tùy ý (hoặc mình ko biết), để generate chuẩn thì các bạn chạy lệnh sau

```bash
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```

kết quả sẽ có dạng như sau `f47dd9f62a7f112daf2e4b77e2f9bbc7ac50c9f56b8ee8d25f9aa58771d5690e` các bạn lấy giá trị này và điền vào trong file `.env`

# jobs

jobs để đăng ký lớp tự động mình để hết trong này [./worker/src/jobs/](./worker/src/jobs/)
