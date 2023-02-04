import time
import openpyxl

from models.ctr import ClassToRegister


def is_data_row_found(attribute_indexes):
    for key in attribute_indexes:
        if attribute_indexes[key] != -1:
            return True
    return False


def find_attribute_indexes(row, attribute_indexes,
                           column_name_to_attribute_name, **kwargs):
    i = 0
    for cell in row:
        prop_name = column_name_to_attribute_name.get(str(cell), None)
        if prop_name:
            attribute_indexes[prop_name] = i
        i = i + 1
    if is_data_row_found(attribute_indexes):
        return load_class_to_register
    return find_attribute_indexes


def load_class_to_register(row, attribute_indexes, class_list: list, **kwargs):
    construct_opts = {}
    for key in attribute_indexes:
        construct_opts[key] = row[attribute_indexes[key]]
    x = ClassToRegister(**construct_opts)
    class_list.append(x)
    return load_class_to_register


class XlsxParser:

    def __init__(self, id=str(time.time_ns())):
        self.row_handler = find_attribute_indexes
        self.id = id

    def parse(self, file):
        wb = openpyxl.load_workbook(file)
        ws = wb.active
        max_column = ws.max_column
        max_row = ws.max_row
        current_row = 0
        learn_classes = []

        attribute_indexes = {
            "term_id": -1,
            "class_id": -1,
            "second_class_id": -1,
            "subject_id": -1,
            "subject_name": -1,
            "learn_day_number": -1,
            "learn_at_day_of_week": -1,
            "learn_room": -1,
            "learn_time": -1,
            "learn_week": -1,
            "class_type": -1,
            "describe": -1,
        }

        column_name_to_attribute_name = {
            "Kỳ": "term_id",
            "Mã_lớp": "class_id",
            "Mã_lớp_kèm": "second_class_id",
            "Mã_HP": "subject_id",
            "Tên_HP": "subject_name",
            "Buổi_số": "learn_day_number",
            "Thứ": "learn_at_day_of_week",
            "Phòng": "learn_room",
            "Thời_gian": "learn_time",
            "Tuần": "learn_week",
            "Loại_lớp": "class_type",
            "Ghi_chú": "describe",
        }

        print(f" [*] {self.id} max_column = {max_column}")
        print(f" [*] {self.id} max_row = {max_row}")

        self.row_handler = find_attribute_indexes

        for row in ws.iter_rows(min_row=0, values_only=True):
            current_row += 1
            self.row_handler = self.row_handler(
                row,
                attribute_indexes=attribute_indexes,
                column_name_to_attribute_name=column_name_to_attribute_name,
                class_list=learn_classes)

        print(f" [*] {self.id} learn_class_count = {len(learn_classes)}")
        return learn_classes
