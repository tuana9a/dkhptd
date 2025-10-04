import json
import os
import sys
import logging
import traceback

import openpyxl

from flask import Flask, request, redirect, url_for, render_template, abort
from werkzeug.utils import secure_filename
from parser import TKBParser

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(process)d] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S %z",
)

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"xlsx"}

app = Flask(__name__)
# app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024


def allowed_file(filename):
    """Check if the file extension is in the allowed set."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET"])
def index():
    return "up"


@app.route("/", methods=["POST"])
def upload_file():
    logger.info("processing")
    if "file" not in request.files:
        return "file not found", 400

    file = request.files["file"]

    if file.filename == "":
        return "invalid file name", 400

    if not allowed_file(file.filename):
        return "Invalid file type. Allowed extensions are: xlsx", 400

    try:
        workbook = openpyxl.load_workbook(file)
        parsed_classes = TKBParser().parse(workbook)
        return {"data": parsed_classes}, 200
    except Exception as e:
        print(f" [ERROR] {str(e)}")
        print(traceback.format_exc())
        return "Internal err", 500


if __name__ == "__main__":
    try:
        app.run(
            host=(os.getenv("BIND") or "0.0.0.0"),
            port=(os.getenv("PORT") or "5000"),
            debug=(os.getenv("DEBUG") or False),
        )
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
