# syntax=docker/dockerfile:1

FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY  *.py .
COPY docker-entrypoint.sh /app/
ENTRYPOINT ["./docker-entrypoint.sh"]
