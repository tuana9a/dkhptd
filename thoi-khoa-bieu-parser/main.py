import json
import os
import sys
import traceback
from io import BytesIO

import dotenv
import openpyxl
import pika

from tkb_parser import Parser

dotenv.load_dotenv()

RABBITMQ_CONNECTION_STRING = os.getenv("RABBITMQ_CONNECTION_STRING")
PROCESS_PARSE_TKD_XLSX_RESULT_QUEUE_NAME = "process-parse-tkb-xlsx-result"
PARSE_TKB_XLSX_QUEUE_NAME = "parse-tkb-xslx"


def on_message(ch, method, properties, body):
    print(f" [*] Received new job {type(body)}")
    try:
        work_book = openpyxl.load_workbook(BytesIO(body))
        classes = Parser().parse(work_book)
        payload = json.dumps({"data": classes})
        ch.basic_publish(
            exchange="",
            routing_key=PROCESS_PARSE_TKD_XLSX_RESULT_QUEUE_NAME,
            body=payload,
        )
    except Exception as e:
        print(f" [ERROR] {str(e)}")
        print(traceback.format_exc())
    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    print(f"rabbitmq_connection_string = {RABBITMQ_CONNECTION_STRING}")
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_CONNECTION_STRING))

    channel = connection.channel()
    channel.queue_declare(queue=PARSE_TKB_XLSX_QUEUE_NAME, durable=True)
    channel.queue_declare(queue=PROCESS_PARSE_TKD_XLSX_RESULT_QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=10)
    channel.basic_consume(
        queue=PARSE_TKB_XLSX_QUEUE_NAME, auto_ack=False, on_message_callback=on_message
    )

    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
