import random
import datetime
import logging

MAP_COLUMN_NAME__PROP_NAME = {
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


logger = logging.getLogger(__name__)


class TKBParser:

    def __init__(self):
        self.prop_at_column_number = {
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

    def is_header_row_found(self):
        for _, col_num in self.prop_at_column_number.items():
            if col_num != -1:
                return True
        return False

    def parse(self, workbook):
        worksheet = workbook.active
        max_column = worksheet.max_column
        max_row = worksheet.max_row
        parsed_classes = []
        term_ids = set()
        iterator = worksheet.iter_rows(min_row=0, values_only=True)

        # detect headers
        for row in iterator:
            cell_number = 0
            for cell in row:
                prop_name = MAP_COLUMN_NAME__PROP_NAME.get(str(cell), None)
                # only care this cell value is in one of the headers
                if prop_name:
                    self.prop_at_column_number[prop_name] = cell_number
                cell_number = cell_number + 1
            # continue until headers found
            if self.is_header_row_found():
                break

        # following headers row is class to register rows
        for row in iterator:
            parsed_class = {}
            for key, col_num in self.prop_at_column_number.items():
                v = row[col_num]
                if isinstance(v, datetime.datetime):
                    v = str(v)
                parsed_class[key] = v
            term_ids.add(parsed_class["term_id"])
            parsed_classes.append(parsed_class)

        parsed_count = len(parsed_classes)
        sample_index = random.randint(0, parsed_count - 1)
        sample_parsed_class = parsed_classes[sample_index]
        metadata = {
            "max_column": max_column,
            "max_row": max_row,
            "parsed_count": parsed_count,
            "term_ids": list(term_ids),
            "sample_class_id": sample_parsed_class["class_id"],
            "sample_subject_id": sample_parsed_class["subject_id"],
            "sample_learn_room": sample_parsed_class["learn_room"],
        }
        logger.info(f"{metadata}")
        return parsed_classes
