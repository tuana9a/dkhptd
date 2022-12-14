import os
import dotenv

dotenv.load_dotenv()

RABBITMQ_CONNECTION_STRING = os.getenv("RABBITMQ_CONNECTION_STRING")
