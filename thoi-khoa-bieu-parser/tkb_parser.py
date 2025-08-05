import datetime


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


class Parser:

    def __init__(self, timestamp=datetime.datetime.now()):
        self.timestamp = timestamp
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

    def parse(self, work_book):
        work_sheet = work_book.active
        max_column = work_sheet.max_column
        max_row = work_sheet.max_row
        ctr_list = []
        term_ids = set()
        iterator = work_sheet.iter_rows(min_row=0, values_only=True)

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
            ctr = {}
            for key, col_num in self.prop_at_column_number.items():
                v = row[col_num]
                if isinstance(v, datetime.datetime):
                    v = str(v)
                ctr[key] = v
            term_ids.add(ctr["term_id"])
            ctr_list.append(ctr)

        print(f"{datetime.datetime.now(datetime.timezone.utc)}")
        print(f" [*] max_column={max_column}")
        print(f" [*] max_row={max_row}")
        print(f" [*] ctr_count={len(ctr_list)}")
        print(f" [*] term_ids={list(term_ids)}")
        print(f" [*] ctr_list[0]={ctr_list[0]}")

        return ctr_list
