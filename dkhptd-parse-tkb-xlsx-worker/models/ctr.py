from dataclasses import dataclass


@dataclass
class ClassToRegister:
    class_id: str
    second_class_id: str
    learn_day_number: int
    class_type: str
    subject_id: str
    subject_name: str
    learn_at_day_of_week: int
    learn_time: str
    learn_room: str
    learn_week: str
    describe: str
    term_id: str