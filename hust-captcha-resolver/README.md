# hust-captcha-resovler

Nhận diện captcha Đại học Bách Khoa Hà Nội từ ảnh ra text. Project này mình nhờ thằng bạn mình train model sử dụng thư viện [pbcquoc/vietocr](https://github.com/pbcquoc/vietocr) để làm image to text.

Thằng bạn mình tên Chiến giờ nó đang PhD student bên đại học Oregon của mẽo. Nó giỏi vl.

- Tỉ lệ nhận diện đúng khoảng 80%, có thể chạy trên CPU
- Mình có đang host predictor này bằng một server 1 core, 1 GB ram thì thời gian predict một ảnh khoảng 0.5s (chậm lâu tùy lúc)

Nếu các bạn không muốn tự deploy có thể dùng sẵn URL này https://hcr.tuana9a.com

```http
POST https://hcr.tuana9a.com
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="23704_1632185498725.png"
Content-Type: image/png

< ./samples/23704_1632185498725.png
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## weights

weights.pth https://public.tuana9a.com/hust-captcha-resolver/weights-2021.04.05.pth

```bash
wget https://public.tuana9a.com/hust-captcha-resolver/weights-2021.04.05.pth -O ./weights-2021.04.05.pth
```

## how to

mình mới test ở `python3.8`, các phiên bản python khác cần thời gian để test thêm

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

ngoài ra trong lúc cài requirements có thể cần cài thêm các apt package sau

```bash
sudo apt install libjpeg-dev
```

## how to run

### env variables

create .env file or set those env variables

```bash
PORT=8080
BIND=127.0.0.1
DEVICE=cpu # cuda:0
```

```bash
python main.py
```

## test prediction

```bash
filepaths=./samples/*
predictUrl=https://hcr.tuana9a.com # TODO: change to your server
```

```bash
for filepath in $filepaths; do echo "$filepath -> $predictUrl -> $(curl -s -X POST "$predictUrl" -F "file=@$filepath")"; done
```

or while true

```bash
while true; do for filepath in $filepaths; do echo "$filepath -> $predictUrl -> $(curl -s -X POST "$predictUrl" -F "file=@$filepath")"; done; done
```