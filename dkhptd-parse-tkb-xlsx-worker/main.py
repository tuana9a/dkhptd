import os
import sys
import pika
import json

from io import BytesIO
from configs import cfg
from configs import qname
from utils.parser import XlsxParser

connection_string = cfg.RABBITMQ_CONNECTION_STRING
job_queue_name = qname.PARSE_TKD_XLSX
job_result_queue_name = qname.PROCESS_PARSE_TKD_XLSX_RESULT


def on_message(ch, method, properties, body):
    print(f" [*] Received new job {type(body)}")
    classes = XlsxParser().parse(BytesIO(body))
    payload = {"data": list(map(lambda x: vars(x), classes))}
    ch.basic_publish(exchange='',
                     routing_key=job_result_queue_name,
                     body=json.dumps(payload))
    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    connection = pika.BlockingConnection(pika.URLParameters(connection_string))

    channel = connection.channel()
    channel.queue_declare(queue=job_queue_name, durable=True)
    channel.queue_declare(queue=job_result_queue_name, durable=True)
    channel.basic_qos(prefetch_count=10)
    channel.basic_consume(queue=job_queue_name,
                          auto_ack=False,
                          on_message_callback=on_message)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
